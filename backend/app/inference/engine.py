import time
import torch
import requests
import base64
import io
from pathlib import Path
from typing import Optional, List, Dict, Any
from PIL import Image
from transformers import AutoProcessor, AutoModelForImageTextToText, BitsAndBytesConfig

from ..config import settings
from ..models import (
    AnalysisRequest,
    AnalysisResult,
    PathologyFinding,
    ConfidenceLevel,
    TissueType,
    PatchInfo,
)
from ..utils import get_logger, log_inference
from .prompts import PromptBuilder

logger = get_logger(__name__)


class InferenceEngine:
    """AI inference engine for pathology analysis using MedGemma with vision capabilities."""

    def __init__(self):
        """Initialize inference engine."""
        self.model_name = settings.MODEL_NAME
        self.device = self._detect_device()
        self.model = None
        self.processor = None
        self.prompt_builder = PromptBuilder()
        self.is_loaded = False
        self.is_multimodal = False  # Track if model supports vision

        if settings.REMOTE_INFERENCE_URL:
            logger.info(f"Configured Remote URL: {settings.REMOTE_INFERENCE_URL}")
        else:
            logger.info("No Remote URL configured (local mode)")
            
        logger.info(f"Inference engine initialized (device: {self.device})")

    def _detect_device(self) -> str:
        """
        Detect available device (GPU/CPU).

        Returns:
            Device string
        """
        if settings.DEVICE != "cpu":
            if torch.cuda.is_available():
                return "cuda"
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                return "mps"

        return "cpu"

    def load_model(self) -> bool:
        """
        Load MedGemma model and processor for multimodal inference.

        Returns:
            True if successful
        """
        if self.is_loaded:
            logger.info("Model already loaded")
            return True

        if settings.REMOTE_INFERENCE_URL:
            logger.info(f"Using remote inference API at: {settings.REMOTE_INFERENCE_URL}")
            self.is_multimodal = True  # Assume remote model is multimodal (MedGemma)
            self.is_loaded = True
            return True

        try:
            logger.info(f"Loading model: {self.model_name}")

            # Determine dtype based on device
            if self.device == "cuda":
                torch_dtype = torch.bfloat16
            elif self.device == "mps":
                torch_dtype = torch.float16  # MPS works better with float16
            else:
                torch_dtype = torch.float32

            # Try loading as multimodal vision-language model first
            try:
                self.processor = AutoProcessor.from_pretrained(
                    self.model_name,
                    trust_remote_code=True,
                )

                self.model = AutoModelForImageTextToText.from_pretrained(
                    self.model_name,
                    device_map="auto" if self.device != "cpu" else None,
                    trust_remote_code=True,
                    torch_dtype=torch_dtype,
                )
                self.is_multimodal = True
                logger.info("Loaded as multimodal vision-language model")

            except Exception as e:
                # Fallback to text-only model
                logger.warning(f"Could not load as multimodal model: {e}")
                logger.info("Falling back to text-only model")
                
                from transformers import AutoTokenizer, AutoModelForCausalLM
                
                self.processor = AutoTokenizer.from_pretrained(
                    self.model_name,
                    trust_remote_code=True,
                )
                
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    device_map="auto" if self.device != "cpu" else None,
                    trust_remote_code=True,
                    torch_dtype=torch_dtype,
                )
                self.is_multimodal = False

            if self.device == "cpu":
                self.model = self.model.to(self.device)

            self.model.eval()
            self.is_loaded = True

            mode = "multimodal" if self.is_multimodal else "text-only"
            logger.info(f"✓ Model loaded successfully on {self.device} ({mode})")
            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.is_loaded = False
            return False

    def _load_patch_image(self, case_id: str, patch: PatchInfo) -> Optional[Image.Image]:
        """
        Load a patch image from the slide for the given patch info.
        
        Args:
            case_id: Case identifier
            patch: Patch information
            
        Returns:
            PIL Image of the patch or None if not available
        """
        try:
            # Try to load from cached patch images first
            patch_dir = settings.CASES_DIR / case_id / "patches"
            patch_file = patch_dir / f"{patch.patch_id}.png"
            
            if patch_file.exists():
                return Image.open(patch_file).convert("RGB")
            
            # If no cached patch, extract from the original slide
            # Find slide file in case directory
            case_dir = settings.CASES_DIR / case_id
            
            # Look for common slide formats
            slide_extensions = ['.svs', '.tiff', '.ndpi', '.mrxs', '.tif']
            slide_files = [
                f for f in case_dir.iterdir() 
                if f.suffix.lower() in slide_extensions
            ]
            
            if not slide_files:
                logger.warning(f"No slide file found for case {case_id}")
                return None
                
            # Import openslide to extract patch
            try:
                import openslide
                slide_path = slide_files[0]
                slide = openslide.OpenSlide(str(slide_path))
                
                # Extract patch region
                patch_size = settings.PATCH_SIZE
                region = slide.read_region(
                    (patch.x, patch.y),
                    patch.level,
                    (patch_size, patch_size)
                ).convert("RGB")
                
                slide.close()
                
                # Cache the patch for future use
                patch_dir.mkdir(parents=True, exist_ok=True)
                region.save(patch_file)
                
                return region
                
            except Exception as e:
                logger.warning(f"Could not extract patch {patch.patch_id}: {e}")
                return None
                
        except Exception as e:
            logger.warning(f"Error loading patch image: {e}")
            return None

    def _analyze_with_images(
        self,
        case_id: str,
        patches: List[PatchInfo],
        clinical_context: Optional[str] = None,
        template_content: Optional[str] = None,
    ) -> str:
        """
        Analyze patches using multimodal vision-language model.
        
        Args:
            case_id: Case identifier
            patches: List of patch information
            clinical_context: Optional clinical context
            template_content: Optional custom template content
            
        Returns:
            Generated analysis text
        """
        # Load a sample of patch images (limit to avoid memory issues)
        max_images = 1  # Reduce to 1 image to ensure stability
        patch_images = []
        
        for patch in patches[:max_images * 2]:  # Try more patches in case some fail
            img = self._load_patch_image(case_id, patch)
            if img:
                # Resize to reasonable size for model input
                img = img.resize((224, 224), Image.Resampling.LANCZOS)
                patch_images.append(img)
                if len(patch_images) >= max_images:
                    break
        
        # Build system message
        system_text = self.prompt_builder.get_system_prompt()

        # Build text prompt using the builder (handles template injection)
        text_prompt = self.prompt_builder.build_analysis_prompt(
            patches=patches, 
            clinical_context=clinical_context,
            template_content=template_content
        )

        # Build user message with images
        if self.is_multimodal and patch_images:
            # Build message with {"type": "image"} entries - processor handles token insertion
            user_content = []
            for _ in patch_images:
                user_content.append({"type": "image"})  # Just marker, no actual image data here
            user_content.append({"type": "text", "text": text_prompt})
        else:
            user_content = [{"type": "text", "text": text_prompt}]
        
        messages = [
            {"role": "system", "content": [{"type": "text", "text": system_text}]},
            {"role": "user", "content": user_content}
        ]

        # Prepare inputs - apply_chat_template handles token insertion for {"type": "image"}
        text = self.processor.apply_chat_template(messages, add_generation_prompt=True)
        logger.info(f"Input prompt text (first 200 chars): {text[:200]}...")
        
        # Now tokenize + process with images
        inputs = self.processor(
            text=text,
            images=patch_images if self.is_multimodal and patch_images else None,
            return_tensors="pt",
            padding=True
        ).to(self.device)
        if self.device == "mps":
            inputs = {k: v.to(self.device, dtype=torch.float16) if v.dtype == torch.bfloat16 else v.to(self.device) for k, v in inputs.items()}
        else:
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        
        input_len = inputs["input_ids"].shape[-1]

        # Generate with error handling and retry
        try:
            with torch.inference_mode():
                generation = self.model.generate(
                    **inputs,
                    max_new_tokens=settings.MAX_TOKENS,
                    do_sample=True,
                    temperature=settings.TEMPERATURE, # Use configured temperature
                    top_p=0.9,
                    pad_token_id=self.processor.tokenizer.eos_token_id if hasattr(self.processor, 'tokenizer') else 0,
                )
        except RuntimeError as e:
            if "probability tensor contains either `inf`, `nan`" in str(e):
                logger.warning("Sampling failed due to numerical instability, retrying with greedy decoding...")
                with torch.inference_mode():
                    generation = self.model.generate(
                        **inputs,
                        max_new_tokens=settings.MAX_TOKENS,
                        do_sample=False,  # Fallback to greedy
                        pad_token_id=self.processor.tokenizer.eos_token_id if hasattr(self.processor, 'tokenizer') else 0,
                    )
            else:
                raise e
        
        generation = generation[0][input_len:]
        decoded = self.processor.decode(generation, skip_special_tokens=True)
        
        logger.info(f"Raw generated text: {decoded}")

        # Clean up images to free memory
        for img in patch_images:
            img.close()
        
        if self.device == "cuda":
            torch.cuda.empty_cache()
        
        return decoded

    def _analyze_text_only(
        self,
        patches: List[PatchInfo],
        clinical_context: Optional[str] = None,
        template_content: Optional[str] = None,
    ) -> str:
        """
        Analyze patches using text-only model (fallback).
        
        Args:
            patches: List of patch information
            clinical_context: Optional clinical context
            template_content: Optional custom template content
            
        Returns:
            Generated analysis text
        """
        # Build prompt using existing prompt builder
        prompt = self.prompt_builder.build_analysis_prompt(
            patches=patches,
            clinical_context=clinical_context,
            template_content=template_content,
        )

        # Tokenize input
        inputs = self.processor(prompt, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=settings.MAX_TOKENS,
                do_sample=False,
                pad_token_id=self.processor.eos_token_id,
            )

        # Decode output
        generated_text = self.processor.decode(outputs[0], skip_special_tokens=True)

        # Extract only the generated part (remove prompt)
        if generated_text.startswith(prompt):
            generated_text = generated_text[len(prompt):].strip()

        return generated_text

    def _analyze_remote(self, text_prompt: str, patch_images: List[Image.Image], system_text: str) -> str:
        """
        Perform analysis using remote inference API.
        """
        logger.info(f"Sending request to remote API: {settings.REMOTE_INFERENCE_URL}")
        
        # 1. Encode images to base64
        encoded_images = []
        for img in patch_images:
            # Resize if too large to save bandwidth
            if img.size[0] > 224 or img.size[1] > 224:
                img = img.resize((224, 224))
                
            buffered = io.BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            encoded_images.append(img_str)
            
        # 2. Construct payload
        payload = {
            "text": text_prompt,
            "images": encoded_images,
            "system_prompt": system_text,  # Optional depending on colab implementation
            "parameters": {
                "max_new_tokens": settings.MAX_TOKENS,
                "temperature": settings.TEMPERATURE,
            }
        }
        
        # 3. Send Request
        headers = {"Content-Type": "application/json"}
        if settings.REMOTE_API_KEY:
            headers["Authorization"] = f"Bearer {settings.REMOTE_API_KEY}"
            
        try:
            response = requests.post(
                settings.REMOTE_INFERENCE_URL, 
                json=payload, 
                headers=headers,
                timeout=120
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Remote inference failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"API Error Response: {e.response.text}")
            raise RuntimeError(f"Remote API Error: {str(e)}")

    def analyze_patches(
        self,
        case_id: str,
        patches: List[PatchInfo],
        clinical_context: Optional[str] = None,
        template_content: Optional[str] = None,
    ) -> AnalysisResult:
        """
        Analyze pathology patches using AI.
        """
        start_time = time.time()

        if not self.is_loaded:
            raise RuntimeError("Model not loaded")

        logger.info(f"Analyzing {len(patches)} patches for case {case_id}")

        # Generate analysis using appropriate method
        try:
            generated_text = ""
            
            # Load images if needed (remote or multimodal)
            patch_images = []
            if settings.REMOTE_INFERENCE_URL or self.is_multimodal:
                max_images = 1 # Limit images
                for patch in patches[:max_images * 2]:
                    img = self._load_patch_image(case_id, patch)
                    if img:
                        img = img.resize((224, 224), Image.Resampling.LANCZOS)
                        patch_images.append(img)
                        if len(patch_images) >= max_images:
                            break
            
            # 1. REMOTE INFERENCE
            if settings.REMOTE_INFERENCE_URL:
                # Build analysis prompt
                text_prompt = self.prompt_builder.build_analysis_prompt(
                    patches, 
                    clinical_context, 
                    template_content
                )
                
                generated_text = self._analyze_remote(
                    text_prompt=text_prompt,
                    patch_images=patch_images,
                    system_text=self.prompt_builder.get_system_prompt()
                )
                
            # 2. LOCAL MULTIMODAL
            elif self.is_multimodal:
                generated_text = self._analyze_with_images(
                    case_id=case_id,
                    patches=patches,
                    clinical_context=clinical_context,
                    template_content=template_content,
                )
                
            # 3. LOCAL TEXT-ONLY
            else:
                generated_text = self._analyze_text_only(
                    patches=patches,
                    clinical_context=clinical_context,
                    template_content=template_content,
                )

            # Check safety
            is_safe, violations = self.prompt_builder.check_safety(generated_text)
            warnings = []

            if not is_safe:
                warnings.append(f"Potentially inappropriate language detected: {', '.join(violations)}")
                logger.warning(f"Safety check failed for case {case_id}: {violations}")

            # Parse structured output
            parsed = self.prompt_builder.parse_structured_output(generated_text)

            # Build findings
            findings = []
            for idx, finding_data in enumerate(parsed.get("findings", [])):
                finding_text = finding_data.get("text", "")
                confidence_str = finding_data.get("confidence", "MEDIUM").upper()

                # Map confidence string to enum
                if "HIGH" in confidence_str:
                    confidence_level = ConfidenceLevel.HIGH
                    confidence_score = 0.85
                elif "LOW" in confidence_str:
                    confidence_level = ConfidenceLevel.LOW
                    confidence_score = 0.45
                else:
                    confidence_level = ConfidenceLevel.MEDIUM
                    confidence_score = 0.65

                finding = PathologyFinding(
                    category=f"Finding {idx + 1}",
                    finding=finding_text,
                    confidence=confidence_level,
                    confidence_score=confidence_score,
                )
                findings.append(finding)

            # Determine tissue type
            tissue_type_str = parsed.get("tissue_type") or "unknown"
            tissue_type_str = tissue_type_str.lower() if isinstance(tissue_type_str, str) else "unknown"
            tissue_type = self._parse_tissue_type(tissue_type_str)

            # Get overall confidence
            overall_confidence = parsed.get("confidence") or 0.65

            # Get narrative summary
            narrative = parsed.get("summary") or generated_text[:500] or "Analysis completed."

            # Add disclaimer
            narrative = self.prompt_builder.add_disclaimer(narrative)

            # Add low confidence warning
            if overall_confidence < settings.CONFIDENCE_THRESHOLD:
                warnings.append(
                    f"Overall confidence ({overall_confidence:.2f}) is below threshold "
                    f"({settings.CONFIDENCE_THRESHOLD}). Findings require careful expert review."
                )

            processing_time = time.time() - start_time

            result = AnalysisResult(
                case_id=case_id,
                findings=findings,
                narrative_summary=narrative,
                tissue_type=tissue_type,
                overall_confidence=overall_confidence,
                warnings=warnings,
                processing_time=processing_time,
            )

            # Log inference
            log_inference(
                case_id=case_id,
                model_name=self.model_name,
                input_data={
                    "num_patches": len(patches),
                    "clinical_context": clinical_context,
                    "mode": "multimodal" if self.is_multimodal else "text-only"
                },
                output_data={
                    "findings": [f.dict() for f in findings],
                    "tissue_type": str(tissue_type),
                    "summary": narrative
                },
                confidence=overall_confidence,
                processing_time=processing_time,
                warnings=warnings
            )

            logger.info(
                f"Analysis complete for case {case_id}: "
                f"{len(findings)} findings, confidence {overall_confidence:.2f}, "
                f"time {processing_time:.2f}s"
            )

            return result

        except Exception as e:
            logger.error(f"Analysis failed for case {case_id}: {e}")
            raise

    def _parse_tissue_type(self, tissue_str: str) -> TissueType:
        """
        Parse tissue type string to enum.

        Args:
            tissue_str: Tissue type string

        Returns:
            TissueType enum value
        """
        tissue_str = tissue_str.lower()

        tissue_mapping = {
            "epithelial": TissueType.EPITHELIAL,
            "connective": TissueType.CONNECTIVE,
            "muscle": TissueType.MUSCLE,
            "nervous": TissueType.NERVOUS,
            "blood": TissueType.BLOOD,
            "mixed": TissueType.MIXED,
        }

        for key, value in tissue_mapping.items():
            if key in tissue_str:
                return value

        return TissueType.UNKNOWN

    def unload_model(self):
        """Unload model to free resources."""
        if self.model:
            del self.model
            self.model = None
        
        if self.processor:
            del self.processor
            self.processor = None
            
        if self.device == "cuda":
            torch.cuda.empty_cache()
        elif self.device == "mps":
            torch.mps.empty_cache()
            
        self.is_loaded = False
        logger.info("Model unloaded")


# Global inference engine instance
_inference_engine: Optional[InferenceEngine] = None


def get_inference_engine() -> InferenceEngine:
    """
    Get or create the global inference engine instance.

    Returns:
        InferenceEngine instance
    """
    global _inference_engine

    if _inference_engine is None:
        _inference_engine = InferenceEngine()

    return _inference_engine
