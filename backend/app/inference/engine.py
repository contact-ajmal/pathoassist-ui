"""
AI inference engine using MedGemma for pathology analysis.
"""
import time
import torch
from typing import Optional, List
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

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
    """AI inference engine for pathology analysis using MedGemma."""

    def __init__(self):
        """Initialize inference engine."""
        self.model_name = settings.MODEL_NAME
        self.device = self._detect_device()
        self.model = None
        self.tokenizer = None
        self.prompt_builder = PromptBuilder()
        self.is_loaded = False

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
        Load MedGemma model and tokenizer.

        Returns:
            True if successful
        """
        if self.is_loaded:
            logger.info("Model already loaded")
            return True

        try:
            logger.info(f"Loading model: {self.model_name}")

            # Configure quantization if enabled
            if settings.USE_QUANTIZATION and self.device == "cuda":
                quantization_config = BitsAndBytesConfig(
                    load_in_8bit=True,
                    llm_int8_threshold=6.0,
                )
                logger.info("Using 8-bit quantization")
            else:
                quantization_config = None

            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True,
            )

            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=quantization_config,
                device_map="auto" if self.device != "cpu" else None,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device != "cpu" else torch.float32,
            )

            if self.device == "cpu":
                self.model = self.model.to(self.device)

            self.model.eval()
            self.is_loaded = True

            logger.info(f"✓ Model loaded successfully on {self.device}")
            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.is_loaded = False
            return False

    def generate_text(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
    ) -> str:
        """
        Generate text using the model.

        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature

        Returns:
            Generated text
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        max_tokens = max_tokens or settings.MAX_TOKENS
        temperature = temperature or settings.TEMPERATURE

        # Tokenize input
        inputs = self.tokenizer(prompt, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=settings.TOP_P,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        # Decode output
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract only the generated part (remove prompt)
        if generated_text.startswith(prompt):
            generated_text = generated_text[len(prompt):].strip()

        return generated_text

    def analyze_patches(
        self,
        case_id: str,
        patches: List[PatchInfo],
        clinical_context: Optional[str] = None,
    ) -> AnalysisResult:
        """
        Analyze pathology patches using AI.

        Args:
            case_id: Case identifier
            patches: List of patch information
            clinical_context: Optional clinical context

        Returns:
            Analysis result
        """
        start_time = time.time()

        if not self.is_loaded:
            raise RuntimeError("Model not loaded")

        logger.info(f"Analyzing {len(patches)} patches for case {case_id}")

        # Build prompt
        prompt = self.prompt_builder.build_analysis_prompt(
            patches=patches,
            clinical_context=clinical_context,
        )

        # Generate analysis
        try:
            generated_text = self.generate_text(prompt)

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
            tissue_type_str = parsed.get("tissue_type", "unknown").lower()
            tissue_type = self._parse_tissue_type(tissue_type_str)

            # Get overall confidence
            overall_confidence = parsed.get("confidence", 0.65)

            # Get narrative summary
            narrative = parsed.get("summary", generated_text[:500])

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
                    "clinical_context": bool(clinical_context),
                },
                output_data={
                    "num_findings": len(findings),
                    "tissue_type": tissue_type.value,
                },
                confidence=overall_confidence,
                processing_time=processing_time,
                warnings=warnings,
            )

            logger.info(
                f"Analysis complete for case {case_id}: "
                f"{len(findings)} findings, "
                f"confidence {overall_confidence:.2f}, "
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
            TissueType enum
        """
        tissue_str = tissue_str.lower()

        if "epithelial" in tissue_str:
            return TissueType.EPITHELIAL
        elif "connective" in tissue_str or "stromal" in tissue_str:
            return TissueType.CONNECTIVE
        elif "muscle" in tissue_str:
            return TissueType.MUSCLE
        elif "nervous" in tissue_str or "neural" in tissue_str:
            return TissueType.NERVOUS
        elif "blood" in tissue_str or "hematopoietic" in tissue_str:
            return TissueType.BLOOD
        elif "mixed" in tissue_str:
            return TissueType.MIXED
        else:
            return TissueType.UNKNOWN

    def generate_summary(self, findings: List[PathologyFinding]) -> str:
        """
        Generate a narrative summary from findings.

        Args:
            findings: List of findings

        Returns:
            Narrative summary
        """
        if not findings:
            return "No significant findings to report."

        # Build observations string
        observations = "\n".join([
            f"- {finding.finding} (Confidence: {finding.confidence.value})"
            for finding in findings
        ])

        prompt = self.prompt_builder.build_description_prompt(observations)

        try:
            summary = self.generate_text(prompt, max_tokens=500)
            summary = self.prompt_builder.add_disclaimer(summary)
            return summary
        except Exception as e:
            logger.error(f"Failed to generate summary: {e}")
            return "Unable to generate summary. Please review individual findings."

    def unload_model(self):
        """Unload model from memory."""
        if self.model is not None:
            del self.model
            self.model = None

        if self.tokenizer is not None:
            del self.tokenizer
            self.tokenizer = None

        # Clear CUDA cache if using GPU
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        self.is_loaded = False
        logger.info("Model unloaded from memory")
