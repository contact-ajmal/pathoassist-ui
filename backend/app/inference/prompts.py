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
PATHOLOGY_ANALYSIS_TEMPLATE = """Analyze the following histopathology slide information:

SLIDE CONTEXT:
- Number of regions analyzed: {num_patches}
- Tissue characteristics: {tissue_summary}
{clinical_context}

ANALYSIS REQUEST:
Provide a structured analysis including:
1. Tissue Type Classification
2. Cellular Observations (cellularity, nuclear features, mitotic activity)
3. Tissue Architecture
4. Notable Features (inflammation, necrosis, etc.)
5. Confidence Assessment

For each finding:
- State your observation
- Provide confidence level (HIGH/MEDIUM/LOW)
- Explain reasoning
- Note limitations or uncertainties

Remember: This is decision support. All findings require pathologist verification.

FORMAT YOUR RESPONSE AS FOLLOWS:

TISSUE TYPE: [type] (Confidence: [level])

FINDINGS:
1. [Category]: [Finding]
   Confidence: [HIGH/MEDIUM/LOW]
   Details: [explanation]

2. [Continue for all findings]

SUMMARY:
[2-3 sentence narrative summary]

RECOMMENDATIONS:
- [Suggested follow-up tests or additional analysis]

CONFIDENCE ASSESSMENT:
Overall analysis confidence: [score 0-1]
Limitations: [any limitations]"""

# Template for simple description
DESCRIPTION_TEMPLATE = """Provide a brief clinical description of the following pathology observations:

{observations}

Focus on clinically relevant features. Use appropriate medical terminology.
Express appropriate uncertainty. Keep response concise (2-3 paragraphs)."""

# Safety check patterns (forbidden phrases)
FORBIDDEN_PATTERNS = [
    "diagnosed with",
    "definitive diagnosis",
    "confirmed diagnosis",
    "conclusively shows",
    "definitely is",
    "positively identified as",
]


class PromptBuilder:
    """Builds prompts for MedGemma inference."""

    def __init__(self):
        """Initialize prompt builder."""
        self.system_instruction = SYSTEM_INSTRUCTION

    def build_analysis_prompt(
        self,
        patches: List[PatchInfo],
        clinical_context: Optional[str] = None,
    ) -> str:
        """
        Build prompt for pathology analysis.

        Args:
            patches: List of analyzed patches
            clinical_context: Optional clinical context

        Returns:
            Formatted prompt
        """
        # Summarize tissue characteristics
        total_patches = len(patches)
        tissue_patches = [p for p in patches if not p.is_background]
        avg_tissue_ratio = sum(p.tissue_ratio for p in tissue_patches) / len(tissue_patches) if tissue_patches else 0
        avg_variance = sum(p.variance_score for p in tissue_patches) / len(tissue_patches) if tissue_patches else 0

        tissue_summary = (
            f"{len(tissue_patches)} tissue-containing regions "
            f"(avg tissue density: {avg_tissue_ratio:.2f}, "
            f"avg variance: {avg_variance:.2f})"
        )

        # Format clinical context
        clinical_section = ""
        if clinical_context:
            clinical_section = f"\nCLINICAL CONTEXT:\n{clinical_context}\n"

        # Build prompt
        prompt = PATHOLOGY_ANALYSIS_TEMPLATE.format(
            num_patches=total_patches,
            tissue_summary=tissue_summary,
            clinical_context=clinical_section,
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

    def parse_structured_output(self, text: str) -> Dict[str, Any]:
        """
        Parse structured output from model.

        Args:
            text: Generated text

        Returns:
            Parsed structure
        """
        result = {
            "tissue_type": None,
            "findings": [],
            "summary": None,
            "recommendations": [],
            "confidence": 0.5,
        }

        lines = text.split("\n")

        current_section = None
        current_finding = None

        for line in lines:
            line = line.strip()

            if not line:
                continue

            # Detect sections
            if line.startswith("TISSUE TYPE:"):
                result["tissue_type"] = line.replace("TISSUE TYPE:", "").strip()

            elif line.startswith("FINDINGS:"):
                current_section = "findings"

            elif line.startswith("SUMMARY:"):
                current_section = "summary"

            elif line.startswith("RECOMMENDATIONS:"):
                current_section = "recommendations"

            elif line.startswith("Overall analysis confidence:"):
                try:
                    conf_str = line.split(":")[-1].strip()
                    result["confidence"] = float(conf_str)
                except (ValueError, IndexError):
                    pass

            elif current_section == "findings" and line[0].isdigit():
                # New finding
                if current_finding:
                    result["findings"].append(current_finding)
                current_finding = {"text": line}

            elif current_section == "findings" and line.startswith("Confidence:"):
                if current_finding:
                    current_finding["confidence"] = line.replace("Confidence:", "").strip()

            elif current_section == "summary":
                if result["summary"] is None:
                    result["summary"] = line
                else:
                    result["summary"] += " " + line

            elif current_section == "recommendations" and line.startswith("-"):
                result["recommendations"].append(line[1:].strip())

        # Add last finding
        if current_finding:
            result["findings"].append(current_finding)

        return result
