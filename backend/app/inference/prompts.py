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
        
        if not tissue_patches:
            tissue_summary = "No tissue regions detected"
        else:
            avg_tissue_ratio = sum(p.tissue_ratio for p in tissue_patches) / len(tissue_patches)
            avg_variance = sum(p.variance_score for p in tissue_patches) / len(tissue_patches)
            max_variance = max(p.variance_score for p in tissue_patches)
            min_variance = min(p.variance_score for p in tissue_patches)
            
            # Categorize patches by variance (proxy for tissue complexity)
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
                f"   - Background/low-interest: {len(low_variance_patches)} regions\n"
                f"   - Slide appears to contain tissue microarray (TMA) cores with multiple tissue specimens"
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

        # Extract findings with flexible patterns
        finding_patterns = [
            r"(\d+\.)\s*\[?([^\]:\n]+)\]?[:\s]+([^\n]+)",  # "1. [Category]: Finding"
            r"(?:Finding|Observation)\s*\d*[:\s]+([^\n]+)",  # "Finding: text"
            r"[-•]\s*([A-Z][^\n]{10,})",  # Bullet points with substantial text
        ]
        
        for pattern in finding_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    finding_text = ' '.join(match).strip()
                else:
                    finding_text = match.strip()
                
                if len(finding_text) > 10 and finding_text.lower() not in ['n/a', 'none']:
                    result["findings"].append({
                        "text": finding_text,
                        "confidence": "MEDIUM"
                    })
            if result["findings"]:
                break
        
        # If still no findings, extract key sentences that look like findings
        if not result["findings"]:
            sentences = text.split('.')
            for sentence in sentences:
                sentence = sentence.strip()
                # Look for sentences that look like findings
                if len(sentence) > 30 and any(kw in sentence.lower() for kw in ['cells', 'tissue', 'nuclei', 'regions', 'features', 'observed', 'shows', 'appear', 'structure']):
                    result["findings"].append({
                        "text": sentence,
                        "confidence": "MEDIUM"
                    })
                    if len(result["findings"]) >= 3:
                        break

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
            paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 50]
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
