#!/bin/bash
#
# Run script for PathoAssist Backend
#

set -e

echo "🚀 Starting PathoAssist Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found"
    echo "Please run: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    source venv/Scripts/activate  # Windows
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file. Please review configuration."
    echo ""
fi

# Create data directories
echo "Creating data directories..."
python -c "from app.config import init_directories; init_directories()"
echo ""

# Check dependencies
echo "Checking dependencies..."
python -c "import fastapi, openslide, torch, transformers" 2>/dev/null || {
    echo "❌ Missing dependencies. Installing..."
    pip install -r requirements.txt
}
echo "✓ Dependencies OK"
echo ""

# Run server
echo "Starting FastAPI server..."
echo "API: http://127.0.0.1:8000"
echo "Docs: http://127.0.0.1:8000/docs"
echo ""

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
