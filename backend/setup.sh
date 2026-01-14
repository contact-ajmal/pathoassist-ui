#!/bin/bash
#
# Setup script for PathoAssist Backend
#

set -e

echo "========================================"
echo "PathoAssist Backend Setup"
echo "========================================"
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.10"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.10+ required. Found: $python_version"
    exit 1
fi
echo "✓ Python $python_version"
echo ""

# Check OpenSlide
echo "Checking OpenSlide..."
python3 -c "import openslide" 2>/dev/null || {
    echo "❌ OpenSlide not found"
    echo ""
    echo "Install OpenSlide:"
    echo "  Ubuntu/Debian: sudo apt-get install openslide-tools python3-openslide"
    echo "  macOS: brew install openslide"
    echo "  Windows: Download from https://openslide.org/download/"
    echo ""
    exit 1
}
echo "✓ OpenSlide installed"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    source venv/Scripts/activate  # Windows
fi
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Create .env file
echo "Creating configuration..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env file"
else
    echo "✓ .env file exists"
fi
echo ""

# Create data directories
echo "Creating data directories..."
python -c "from app.config import init_directories; init_directories()"
echo "✓ Data directories created"
echo ""

# Download model (optional)
read -p "Download MedGemma model now? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Downloading MedGemma model..."
    python -c "
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_name = 'google/medgemma-2b'
print(f'Downloading {model_name}...')

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        trust_remote_code=True,
        torch_dtype=torch.float16,
    )
    print('✓ Model downloaded successfully')
except Exception as e:
    print(f'⚠️  Model download failed: {e}')
    print('You may need to accept the license on Hugging Face first.')
    print('Visit: https://huggingface.co/google/medgemma-2b')
"
    echo ""
fi

echo "========================================"
echo "Setup Complete! 🎉"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review configuration in .env"
echo "2. Run the backend: ./run.sh"
echo "3. Access API docs: http://127.0.0.1:8000/docs"
echo ""
echo "For CUDA support:"
echo "  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118"
echo ""
