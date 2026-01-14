# MedGemma Prompt Templates

This document describes the prompt engineering approach used in PathoAssist for safe, effective medical AI inference.

## Design Principles

1. **Safety First**: No definitive diagnostic language
2. **Structured Output**: Consistent, parseable responses
3. **Confidence Scoring**: Always include uncertainty
4. **Medical Context**: Appropriate clinical terminology
5. **Verification Reminders**: Emphasize need for expert review

---

## System Instruction

Used for every inference to set the AI's role and boundaries.

```
You are a medical AI assistant specialized in pathology image analysis.
Your role is to assist pathologists by providing observations and potential
findings from histopathology slides.

CRITICAL GUIDELINES:
1. You provide decision support ONLY, not definitive diagnoses
2. Always express appropriate uncertainty and confidence levels
3. Use phrases like "suggests", "consistent with", "may indicate"
4. NEVER use definitive diagnostic language like "diagnosed with", "confirms", "definitively shows"
5. Always recommend verification by qualified pathologists
6. Highlight areas requiring expert review
7. Provide confidence scores for all observations
```

**Why This Works:**
- Sets clear role boundaries
- Emphasizes uncertainty and safety
- Provides specific phrase guidance
- Prevents overconfident outputs

---

## Pathology Analysis Prompt

Primary template for analyzing WSI patches.

### Template Structure

```
Analyze the following histopathology slide information:

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
Limitations: [any limitations]
```

### Example Input

```
Analyze the following histopathology slide information:

SLIDE CONTEXT:
- Number of regions analyzed: 50
- Tissue characteristics: 45 tissue-containing regions (avg tissue density: 0.72, avg variance: 0.58)

CLINICAL CONTEXT:
Patient: 58-year-old female
Clinical indication: Breast biopsy for palpable mass
Previous history: No prior malignancy

[Rest of template...]
```

### Example Expected Output

```
TISSUE TYPE: Epithelial (Confidence: HIGH)

FINDINGS:
1. Cellularity: Moderate to high cellularity observed across analyzed regions
   Confidence: HIGH
   Details: Consistent cellular density suggests viable tissue sampling. No significant necrosis noted in analyzed patches.

2. Nuclear Features: Mild nuclear enlargement with occasional pleomorphism
   Confidence: MEDIUM
   Details: Some nuclei show size variation and irregular contours. Further evaluation at higher magnification may be beneficial.

3. Mitotic Activity: Low to moderate mitotic figures present
   Confidence: MEDIUM
   Details: Scattered mitotic figures identified, but quantification requires dedicated high-power field assessment.

4. Architecture: Preserved glandular architecture with some crowding
   Confidence: HIGH
   Details: Glandular structures remain identifiable but show some architectural distortion.

SUMMARY:
The analyzed tissue sections suggest epithelial tissue with preserved but crowded architecture, moderate cellularity, and mild nuclear atypia. These findings may be consistent with proliferative changes, but further characterization and expert pathologist review are essential for accurate classification.

RECOMMENDATIONS:
- Expert pathologist review recommended
- Consider immunohistochemistry panel (ER, PR, HER2 if breast tissue)
- Additional sampling if clinically indicated
- Clinical correlation with imaging findings

CONFIDENCE ASSESSMENT:
Overall analysis confidence: 0.65
Limitations: Limited magnification views, unable to perform true high-power field counts, immunohistochemistry data not available, clinical context limited
```

---

## Description Generation Prompt

For creating narrative summaries from structured findings.

### Template

```
Provide a brief clinical description of the following pathology observations:

{observations}

Focus on clinically relevant features. Use appropriate medical terminology.
Express appropriate uncertainty. Keep response concise (2-3 paragraphs).
```

### Example Input

```
Provide a brief clinical description of the following pathology observations:

- Moderate cellularity with preserved architecture (Confidence: high)
- Mild nuclear atypia with occasional pleomorphism (Confidence: medium)
- Low mitotic activity (Confidence: medium)
- No necrosis identified (Confidence: high)
- Minimal inflammatory infiltrate (Confidence: high)

Focus on clinically relevant features. Use appropriate medical terminology.
Express appropriate uncertainty. Keep response concise (2-3 paragraphs).
```

### Example Output

```
The histological examination reveals tissue sections with moderate cellularity and largely preserved architectural features. The cellular composition shows mild nuclear enlargement with occasional pleomorphic changes, suggesting some degree of cellular atypia, though the significance requires correlation with clinical and imaging findings.

Mitotic activity appears relatively low in the examined regions, and no areas of necrosis were identified in the analyzed sections. A minimal inflammatory cell infiltrate is noted, without features suggesting acute inflammation or abscess formation.

These findings are suggestive of proliferative changes with mild atypia. However, definitive classification requires expert pathologist review, consideration of the complete clinical context, and potentially additional immunohistochemical studies. The observations should not be interpreted as diagnostic conclusions without formal pathological evaluation.
```

---

## Safety Checks

### Forbidden Phrases

The system automatically flags outputs containing:
```python
FORBIDDEN_PATTERNS = [
    "diagnosed with",
    "definitive diagnosis",
    "confirmed diagnosis",
    "positively identified as",
    "conclusively shows",
    "definitely is",
]
```

### Confidence Validation

- Outputs must include confidence indicators
- Scores below threshold trigger warnings
- Low confidence = increased verification emphasis

### Medical Disclaimer

Automatically appended to all outputs:
```
IMPORTANT MEDICAL DISCLAIMER:
This report is generated by an AI-assisted system for research and decision
support purposes only. It is NOT intended for diagnostic use. All findings
should be verified by qualified healthcare professionals. This system does
not replace professional medical judgment, diagnosis, or treatment recommendations.
```

---

## Prompt Engineering Best Practices

### 1. Structured Formatting

**✅ Good:**
```
FORMAT YOUR RESPONSE AS FOLLOWS:
TISSUE TYPE: [type]
FINDINGS:
1. [Finding]
```

**❌ Bad:**
```
Describe the tissue
```

### 2. Explicit Uncertainty

**✅ Good:**
```
Use phrases like "suggests", "consistent with", "may indicate"
```

**❌ Bad:**
```
Tell me what it is
```

### 3. Context Provision

**✅ Good:**
```
CLINICAL CONTEXT:
Patient: 58-year-old female
Clinical indication: Breast biopsy
```

**❌ Bad:**
```
Analyze this slide
```

### 4. Safety Reminders

**✅ Good:**
```
Remember: This is decision support. All findings require pathologist verification.
```

**❌ Bad:**
```
(No reminder)
```

---

## Customization

### Adjusting Confidence Thresholds

In `app/config.py`:
```python
CONFIDENCE_THRESHOLD: float = 0.6  # Minimum confidence for findings
```

Lower = More cautious (more warnings)
Higher = More permissive (fewer warnings)

### Modifying Templates

Edit `app/inference/prompts.py`:
```python
PATHOLOGY_ANALYSIS_TEMPLATE = """
Your custom template here
{variables}
"""
```

### Adding New Templates

```python
class PromptBuilder:
    def build_custom_prompt(self, context: Dict[str, Any]) -> str:
        """Build custom prompt."""
        template = "Your template: {data}"
        return template.format(**context)
```

---

## Testing Prompts

### Interactive Testing

```python
from app.inference import PromptBuilder, InferenceEngine

builder = PromptBuilder()
engine = InferenceEngine()
engine.load_model()

# Build prompt
prompt = builder.build_analysis_prompt(
    patches=patches,
    clinical_context="Test context"
)

# Generate
output = engine.generate_text(prompt)

# Check safety
is_safe, violations = builder.check_safety(output)
print(f"Safe: {is_safe}, Violations: {violations}")
```

### Prompt Quality Checklist

- [ ] Includes system instruction
- [ ] Provides sufficient context
- [ ] Requests structured output
- [ ] Emphasizes uncertainty
- [ ] Includes safety reminders
- [ ] Specifies confidence scoring
- [ ] Defines forbidden language
- [ ] Requests verification reminders

---

## Advanced Techniques

### Few-Shot Examples

Add examples to improve output quality:
```python
EXAMPLE_1 = """
FINDING: Moderate cellularity
CONFIDENCE: HIGH
RATIONALE: Clear tissue density across multiple regions
"""

prompt = f"{SYSTEM_INSTRUCTION}\n\nEXAMPLE:\n{EXAMPLE_1}\n\nNow analyze: {context}"
```

### Chain-of-Thought

Encourage reasoning:
```python
"First, describe what you observe.
Then, consider what this might suggest.
Finally, note the confidence and limitations."
```

### Confidence Calibration

Request explicit reasoning:
```python
"For each finding, explain:
1. What supports this finding (evidence)
2. What limits confidence (uncertainty)
3. What would increase confidence (additional tests)"
```

---

## Monitoring & Improvement

### Log Analysis

Check `data/logs/inference.jsonl` for:
- Output quality issues
- Safety violations
- Confidence patterns
- Processing times

### Prompt Iteration

1. Identify problematic outputs
2. Adjust template specificity
3. Add clarifying instructions
4. Test on edge cases
5. Deploy incrementally

### Metrics to Track

- Safety violation rate
- Average confidence scores
- Output structure compliance
- Verification phrase usage
- Inappropriate language detection

---

## References

- **MedGemma Documentation**: https://huggingface.co/google/medgemma-2b
- **Medical AI Guidelines**: https://www.fda.gov/medical-devices/software-medical-device-samd
- **Prompt Engineering**: OpenAI Best Practices

---

**Remember**: Prompts are critical for safety. Always test changes thoroughly and maintain appropriate uncertainty in medical AI systems.
