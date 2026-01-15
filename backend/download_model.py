
import os
import sys
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

def download_model():
    model_name = "google/medgemma-1.5-4b-it"
    print(f"⬇️  Starting download for: {model_name}")
    print("----------------------------------------")
    
    try:
        print("⏳ Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        
        print("⏳ Loading model (this may take a while)...")
        # Load in float16 to save download/memory bandwidth if possible
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            trust_remote_code=True,
            torch_dtype=torch.float16,
        )
        print("----------------------------------------")
        print(f"✅ SUCCESS: Model '{model_name}' successfully downloaded and cached.")
        print("   You are ready to run the backend!")
        
    except Exception as e:
        print("----------------------------------------")
        print("❌ ERROR: Download failed.")
        print(f"   Reason: {str(e)}")
        print("\nCommon fixes:")
        print("1. Did you accept the license at https://huggingface.co/google/medgemma-1.5-4b-it ?")
        print("2. Did you run 'huggingface-cli login' inside the backend/venv?")

if __name__ == "__main__":
    download_model()
