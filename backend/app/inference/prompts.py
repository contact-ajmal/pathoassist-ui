"""
Prompt templates and builders for MedGemma inference.
"""
from typing import Optional, List, Dict, Any
from ..models import PatchInfo
from ..config import MEDICAL_DISCLAIMER

# System instruction for MedGemma
SYSTEM_INSTRUCTION = """You are a medical AI assistant specialized in pathology image analysis.
Your role is to assist pathologists by providing observations and potential findings
from histopathology slides.

CRITICAL GUIDELINES:
1. You provide decision support ONLY, not definitive diagnoses
2. Always express appropriate uncertainty and confidence levels
3. Use phrases like "suggests", "consistent with", "may indicate"
4. NEVER use definitive diagnostic language like "diagnosed with", "confirms", "definitively shows"
5. Always recommend verification by qualified pathologists
6. Highlight areas requiring expert review
7. Provide confidence scores for all observations"""

# Template for pathology analysis
PATHOLOGY_ANALYSIS_TEMPLATE = """Analyze the following histopathology slide information using multimodal clinical reasoning:

SLIDE CONTEXT:
- Number of regions analyzed: {num_patches}
- Tissue characteristics: {tissue_summary}

DETAILED PATCH ANALYSIS (Top Regions of Interest):
{patch_details}

CLINICAL CONTEXT (CRITICAL FOR HAI-DEF ANALYSIS):
{clinical_context}

ANALYSIS REQUEST:
Perform a deep multimodal analysis. You must synthesize the VISUAL evidence (from the slide/patches) with the TEXTUAL evidence (from clinical history) to provide a comprehensive diagnostic assessment.

1. **Multimodal Synthesis** (The "Reasoning" Step):
   - Explicitly connect specific visual features (e.g., "high nuclear-to-cytoplasmic ratio in ROI #X") with the clinical history.
   - Refer to specific Patches (ROI ids) where relevant findings are observed.
   - Explain *why* the visual features support or refute the clinical suspicion.

2. **Microscopic Description**:
   - Cellular architecture and cytology
   - Mitotic activity and atypia
   - Stroma and inflammatory response

3. **Differential Diagnosis & Reasoning**:
   - List potential diagnoses.
   - For each, provide evidence FOR and AGAINST based on the fused data.

4. **Summary**: A professional pathology conclusion.

Format your response as follows:

TISSUE TYPE: [type] (Confidence: [level])

MULTIMODAL SYNTHESIS:
[Explain connection between image features and clinical history.]

FINDINGS:
1. [Category]: [Detailed Finding]
   Confidence: [HIGH/MEDIUM/LOW]
   Evidence: [Specific visual feature, e.g., "Enlarged nuclei in ROI #3", "Cribriform architecture"]
   Details: [Elaboration]

STRUCTURED OBSERVATIONS:
- Cellularity: [High/Moderate/Low] - [Observation]
- Nuclear Features: [Description of atypia, pleomorphism]
- Mitosis: [Description of activity]
- Necrosis: [Present/Absent] - [Description]
- Inflammation: [Description of infiltrate]

DIFFERENTIAL DIAGNOSIS:
- [Condition A]: [Likelihood] - [Reasoning based on image+text]
- [Condition B]: [Likelihood] - [Reasoning]

SUMMARY:
[Final professional assessment]

RECOMMENDATIONS:
- [Next steps]

CONFIDENCE ASSESSMENT:
Overall analysis confidence: [score 0-1]
Limitations: [Specific limitations]"""


class PromptBuilder:
    """Builds prompts for MedGemma inference."""

    def __init__(self):
        """Initialize prompt builder."""
        self.system_instruction = SYSTEM_INSTRUCTION

    def get_system_prompt(self) -> str:
        """Get the system instruction."""
        return self.system_instruction

    def build_analysis_prompt(
        self,
        patches: List[PatchInfo],
        clinical_context: Optional[str] = None,
        template_content: Optional[str] = None,
    ) -> str:
        """
        Build prompt for pathology analysis.

        Args:
            patches: List of analyzed patches
            clinical_context: Optional clinical context
            template_content: Optional custom template content. Uses default if None.

        Returns:
            Formatted prompt
        """
        # Summarize tissue characteristics
        total_patches = len(patches)
        tissue_patches = [p for p in patches if not p.is_background]
        
        patch_details = "   No specific patch details available."
        
        if not tissue_patches:
            tissue_summary = "No tissue regions detected"
        else:
            avg_tissue_ratio = sum(p.tissue_ratio for p in tissue_patches) / len(tissue_patches)
            max_variance = max(p.variance_score for p in tissue_patches)
            min_variance = min(p.variance_score for p in tissue_patches)
            
            # Categorize patches by variance (proxy for tissue complexity)
            # Sort by variance descending to get most interesting first
            sorted_patches = sorted(tissue_patches, key=lambda p: p.variance_score, reverse=True)
            
            high_variance_patches = [p for p in tissue_patches if p.variance_score > 0.7]
            medium_variance_patches = [p for p in tissue_patches if 0.3 <= p.variance_score <= 0.7]
            low_variance_patches = [p for p in tissue_patches if p.variance_score < 0.3]
            
            # Infer tissue characteristics from statistics
            tissue_density_desc = "high" if avg_tissue_ratio > 0.7 else "moderate" if avg_tissue_ratio > 0.4 else "low"
            heterogeneity_desc = "highly heterogeneous" if (max_variance - min_variance) > 0.5 else "moderately heterogeneous" if (max_variance - min_variance) > 0.2 else "relatively homogeneous"
            
            tissue_summary = (
                f"{len(tissue_patches)} tissue-containing regions analyzed at 40x magnification.\n"
                f"   - Tissue density: {tissue_density_desc} (avg {avg_tissue_ratio:.1%})\n"
                f"   - Tissue heterogeneity: {heterogeneity_desc} (variance range {min_variance:.2f}-{max_variance:.2f})\n"
                f"   - High-interest regions: {len(high_variance_patches)} (areas with significant cellular variation)\n"
                f"   - Medium-interest regions: {len(medium_variance_patches)} (areas with moderate features)\n"
                f"   - Background/low-interest: {len(low_variance_patches)} regions"
            )
            
            # Build detailed patch list (Top 8 most interesting)
            details_list = []
            for i, p in enumerate(sorted_patches[:8]):
                idx = i + 1
                details_list.append(
                    f"   ROI #{idx} (Location x={p.coordinates.get('x')}, y={p.coordinates.get('y')}): "
                    f"Tissue Context={p.tissue_ratio:.0%}, Complexity Score={p.variance_score:.2f}. "
                    f"Visual Feature: Possible cellular atypia or mitoses based on variance."
                )
            patch_details = "\n".join(details_list)

        # Format clinical context
        clinical_section = ""
        if clinical_context:
            clinical_section = f"Patient Data & History:\n{clinical_context}\n\n(Use this patient history to inform your differential diagnosis and risk assessment)"
        else:
            clinical_section = "No specific clinical history provided. Analyze based on morphology only."

        # Determine template to use
        template_to_use = template_content if template_content else PATHOLOGY_ANALYSIS_TEMPLATE

        # Build prompt
        try:
            prompt = template_to_use.format(
                num_patches=total_patches,
                tissue_summary=tissue_summary,
                patch_details=patch_details,
                clinical_context=clinical_section,
            )
        except KeyError:
            # Fallback if template is missing keys
            prompt = (
                f"{template_to_use}\n\n"
                f"CONTEXT:\nRegions: {total_patches}\nSummary: {tissue_summary}\n"
                f"ROI Details:\n{patch_details}\n{clinical_section}"
            )

        return prompt

    def build_description_prompt(self, observations: str) -> str:
        """
        Build prompt for generating clinical description.

        Args:
            observations: Structured observations

        Returns:
            Formatted prompt
        """
        return DESCRIPTION_TEMPLATE.format(observations=observations)

    def build_structured_prompt(
        self,
        task: str,
        context: Dict[str, Any],
    ) -> str:
        """
        Build a custom structured prompt.

        Args:
            task: Task description
            context: Context dictionary

        Returns:
            Formatted prompt
        """
        prompt_parts = [f"TASK: {task}\n"]

        for key, value in context.items():
            prompt_parts.append(f"{key.upper()}: {value}")

        prompt_parts.append("\nProvide analysis following safety guidelines.")

        return "\n".join(prompt_parts)

    def check_safety(self, generated_text: str) -> tuple[bool, List[str]]:
        """
        Check if generated text contains forbidden diagnostic language.

        Args:
            generated_text: Generated text to check

        Returns:
            Tuple of (is_safe, list of violations)
        """
        violations = []

        text_lower = generated_text.lower()

        for pattern in FORBIDDEN_PATTERNS:
            if pattern in text_lower:
                violations.append(pattern)

        is_safe = len(violations) == 0

        return is_safe, violations

    def add_disclaimer(self, text: str) -> str:
        """
        Add medical disclaimer to generated text.

        Args:
            text: Generated text

        Returns:
            Text with disclaimer appended
        """
        return f"{text}\n\n{MEDICAL_DISCLAIMER}"

    def extract_confidence_level(self, text: str) -> str:
        """
        Extract confidence level from generated text.

        Args:
            text: Generated text

        Returns:
            Confidence level (HIGH/MEDIUM/LOW) or UNKNOWN
        """
        text_upper = text.upper()

        if "CONFIDENCE: HIGH" in text_upper or "HIGH CONFIDENCE" in text_upper:
            return "HIGH"
        elif "CONFIDENCE: MEDIUM" in text_upper or "MEDIUM CONFIDENCE" in text_upper:
            return "MEDIUM"
        elif "CONFIDENCE: LOW" in text_upper or "LOW CONFIDENCE" in text_upper:
            return "LOW"
        else:
            return "UNKNOWN"

        return result

    def _parse_differential_diagnosis(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract differential diagnosis candidates.
        Format: - [Condition]: [Likelihood] - [Reasoning]
        """
        import re
        candidates = []
        
        # Look for the section
        section_match = re.search(r"DIFFERENTIAL DIAGNOSIS:(.*?)(?=\n[A-Z]+:|$)", text, re.DOTALL | re.IGNORECASE)
        if not section_match:
            return []
            
        section_text = section_match.group(1).strip()
        
        # Parse lines
        # Regex to capture: "- Condition: Likelihood - Reasoning"
        # Handling variations like bullets, bolding, etc.
        pattern = r"[-•*]\s*([^\:]+?)\s*:\s*([^\s-]+(?:[^\-]+)?)\s*[-–]\s*(.+)"
        
        for line in section_text.split('\\n'):
            line = line.strip()
            if not line:
                continue
                
            match = re.search(pattern, line)
            if match:
                condition = match.group(1).replace('*', '').strip()
                likelihood_str = match.group(2).strip()
                reasoning = match.group(3).strip()
                
                # Normalize likelihood
                if 'HIGH' in likelihood_str.upper():
                    likelihood = 'HIGH'
                    score = 0.85
                elif 'LOW' in likelihood_str.upper():
                    likelihood = 'LOW'
                    score = 0.25
                else:
                    likelihood = 'MEDIUM'
                    score = 0.55
                    
                candidates.append({
                    "condition": condition,
                    "likelihood": likelihood,
                    "likelihood_score": score,
                    "reasoning": reasoning
                })
                
        return candidates

    def parse_structured_output(self, text: str) -> Dict[str, Any]:
        """
        Parse structured output from model with flexible matching.

        Args:
            text: Generated text

        Returns:
            Parsed structure
        """
        import re
        
        result = {
            "tissue_type": None,
            "findings": [],
            "differential_diagnosis": [],
            "summary": None,
            "recommendations": [],
            "confidence": 0.5,
        }

        # More flexible pattern matching for tissue type
        tissue_patterns = [
            r"TISSUE TYPE:\s*([^\n\(]+)",
            r"Tissue Type[:\s]+([^\n\|]+)",
            r"Type of tissue[:\s]+([^\n]+)",
        ]
        for pattern in tissue_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match and match.group(1).strip().lower() not in ['n/a', 'unknown', '']:
                result["tissue_type"] = match.group(1).strip()
                break
        
        # If still no tissue type, try to infer from content
        if not result["tissue_type"]:
            tissue_keywords = ['epithelial', 'connective', 'muscle', 'nervous', 'blood', 'lymph', 'glandular', 'carcinoma']
            for keyword in tissue_keywords:
                if keyword.lower() in text.lower():
                    result["tissue_type"] = keyword.capitalize()
                    break
        
        # Default to mixed if nothing found
        if not result["tissue_type"]:
            result["tissue_type"] = "Mixed tissue specimen"

        # 1. Extract specific structured observations (Priority)
        # We look for "Key: Value" patterns first
        observation_patterns = {
            "Cellularity": r"(?:Cellularity|Cell density)[:\s]+(?:\*\*)?\s*(?:Cellularity[:\s]*)?([^\n]+)",
            "Nuclear Features": r"(?:Nuclear Features|Nuclear Atypia)[:\s]+(?:\*\*)?\s*(?:Nuclear Features[:\s]*)?([^\n]+)",
            "Mitosis": r"(?:Mitosis|Mitotic Activity)[:\s]+(?:\*\*)?\s*(?:Mitosis[:\s]*)?([^\n]+)",
            "Necrosis": r"Necrosis[:\s]+(?:\*\*)?\s*(?:Necrosis[:\s]*)?([^\n]+)",
            "Inflammation": r"Inflammation[:\s]+(?:\*\*)?\s*(?:Inflammation[:\s]*)?([^\n]+)"
        }
        
        for category, pattern in observation_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                obs_text = match.group(1).replace('**', '').strip()
                # Handle leading colon/redundancy if model repeats keys
                obs_text = re.sub(r"^(?:Cellularity|Nuclear Features|Mitosis|Necrosis|Inflammation)[:\s]*", "", obs_text, flags=re.IGNORECASE).strip()
                
                # Filter out empty/useless responses
                if obs_text.lower() not in ["not assessed", "unknown", "none", "", "and"] and len(obs_text) > 3:
                    # Check duplication
                    if not any(category in f.get("category", "") for f in result["findings"]):
                        result["findings"].append({
                            "text": f"{category}: {obs_text}",
                            "category": category,
                            "confidence": "HIGH",
                            "visual_evidence": None # Global assessment
                        })

        # 2. Extract general numbered findings
        finding_patterns = [
            r"(\d+\.)\s*\[?([^\]:\n]+)\]?[:\s]+(?:\*\*)?\s*([^\n]+)(?:\n\s*Confidence:[^\n]+)?(?:\n\s*Evidence:\s*([^\n]+))?", 
        ]
        
        for pattern in finding_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match) >= 3 and isinstance(match, tuple):
                    category = match[1].strip()
                    finding_text = match[2].replace('**', '').strip()
                    evidence = match[3].strip() if len(match) > 3 and match[3] else None
                    
                    if len(finding_text) > 5:
                        result["findings"].append({
                            "text": finding_text,
                            "category": category, 
                            "confidence": "MEDIUM",
                            "visual_evidence": evidence 
                        })

        # 3. Fallback: Key sentences (Only if findings are sparse)
        if len(result["findings"]) < 3:
            sentences = text.split('.')
            for sentence in sentences:
                sentence = sentence.replace('**', '').strip()
                if len(sentence) > 30 and any(kw in sentence.lower() for kw in ['cells', 'tissue', 'nuclei', 'regions', 'features', 'observed', 'shows', 'appear', 'structure']):
                    # Check if already covered
                    if not any(sentence[:20] in f["text"] for f in result["findings"]):
                        result["findings"].append({
                            "text": sentence,
                            "confidence": "MEDIUM",
                            "category": "General Observation"
                        })
                    if len(result["findings"]) >= 5:
                        break

        # If still no findings, extract key sentences that look like findings
        if not result["findings"]:
            sentences = text.split('.')
            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence) > 30 and any(kw in sentence.lower() for kw in ['cells', 'tissue', 'nuclei', 'regions', 'features', 'observed', 'shows', 'appear', 'structure']):
                    result["findings"].append({
                        "text": sentence,
                        "confidence": "MEDIUM",
                        "category": "General Observation"
                    })
                    if len(result["findings"]) >= 3:
                        break
        
        # Parse Differential Diagnosis (HAI-DEF Feature)
        result["differential_diagnosis"] = self._parse_differential_diagnosis(text)
        
        # Extract summary with flexible patterns
        summary_patterns = [
            r"SUMMARY:\s*([^\n]+(?:\n(?![A-Z]{3,}).*)*)",
            r"(?:Summary|Conclusion)[:\s]+([^\n]+)",
            r"\*\*Summary[:\*]*\*?\s*([^\n]+)",
        ]
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                summary = match.group(1).strip()
                if len(summary) > 20:
                    result["summary"] = summary
                    break
        
        # If no explicit summary, use first paragraph or findings summary
        if not result["summary"] and result["findings"]:
            result["summary"] = f"Analysis identified {len(result['findings'])} notable findings in the tissue specimen."
        elif not result["summary"]:
            # Extract first meaningful paragraph
            paragraphs = [p.strip() for p in text.split('\\n\\n') if len(p.strip()) > 50]
            if paragraphs:
                result["summary"] = paragraphs[0][:500]

        # Extract confidence
        confidence_patterns = [
            r"confidence[:\s]+(\d+\.?\d*)",
            r"confidence[:\s]+(high|medium|low)",
            r"(\d+\.?\d*)\s*%?\s*confidence",
        ]
        for pattern in confidence_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                conf_str = match.group(1).lower()
                if conf_str == 'high':
                    result["confidence"] = 0.85
                elif conf_str == 'low':
                    result["confidence"] = 0.45
                elif conf_str == 'medium':
                    result["confidence"] = 0.65
                else:
                    try:
                        conf_val = float(conf_str)
                        result["confidence"] = conf_val if conf_val <= 1 else conf_val / 100
                    except ValueError:
                        pass
                break

        return result
