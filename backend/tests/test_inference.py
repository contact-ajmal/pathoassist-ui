
import pytest
from app.inference.prompts import PromptBuilder
from app.models import PatchInfo

def test_prompt_builder_initialization():
    """Test that prompt builder initializes correctly."""
    builder = PromptBuilder()
    assert builder.system_instruction is not None

def test_prompt_with_clinical_context():
    """Test prompt generation with clinical context."""
    builder = PromptBuilder()
    patches = [PatchInfo(
        patch_id="p1", 
        x=0, 
        y=0, 
        width=256, 
        height=256, 
        level=0, 
        magnification=40, 
        coordinates={'x':0, 'y':0, 'width':256, 'height':256}, 
        is_background=False, 
        tissue_ratio=0.9, 
        variance_score=0.5
    )]
    context = "Patient has history of melanoma."
    
    prompt = builder.build_analysis_prompt(patches, clinical_context=context)
    
    assert "Patient Data & History" in prompt
    assert "melanoma" in prompt
    assert "IMPORTANT - Integrate into analysis" in prompt

def test_prompt_without_clinical_context():
    """Test prompt generation without clinical context."""
    builder = PromptBuilder()
    patches = [PatchInfo(
        patch_id="p1", 
        x=0, 
        y=0, 
        width=256, 
        height=256, 
        level=0, 
        magnification=40, 
        coordinates={'x':0, 'y':0, 'width':256, 'height':256}, 
        is_background=False, 
        tissue_ratio=0.9, 
        variance_score=0.5
    )]
    
    prompt = builder.build_analysis_prompt(patches)
    
    assert "No specific clinical history provided" in prompt

def test_safety_check():
    """Test forbidden pattern detection."""
    builder = PromptBuilder()
    
    safe_text = "The findings suggest probability of malignancy."
    is_safe, violations = builder.check_safety(safe_text)
    assert is_safe
    assert len(violations) == 0
    
    unsafe_text = "Patient is definitively diagnosed with carcinoma."
    is_safe, violations = builder.check_safety(unsafe_text)
    assert not is_safe
    assert len(violations) > 0
