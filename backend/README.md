# PathoAssist Backend

**Offline WSI Pathology Report Generator - Backend API**

A complete Python backend for AI-assisted pathology analysis using MedGemma, designed for offline operation with local storage and privacy-first architecture.

---

## Features

- 🔬 **WSI Processing**: OpenSlide-based whole slide image processing
- 🎯 **ROI Selection**: Automated region of interest detection
- 🤖 **AI Analysis**: MedGemma-powered pathology analysis
- 📊 **Report Generation**: Structured clinical reports
- 📄 **Multi-Format Export**: PDF, JSON, and TXT export
- 🔒 **Privacy-First**: Fully offline, local filesystem storage
- ⚠️ **Safety Compliance**: Medical disclaimers and audit logging

---

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── models.py            # Pydantic data models
│   ├── wsi/                 # WSI processing
│   │   ├── processor.py     # OpenSlide integration
│   │   └── tiling.py        # Patch generation
│   ├── roi/                 # ROI selection
│   │   └── selector.py      # ROI algorithms
│   ├── inference/           # AI inference
│   │   ├── engine.py        # MedGemma engine
│   │   └── prompts.py       # Prompt templates
│   ├── report/              # Report generation
│   │   └── generator.py     # Report builder
│   ├── export/              # Export functionality
│   │   └── exporter.py      # PDF/JSON/TXT export
│   ├── storage/             # Storage management
│   │   └── manager.py       # File system operations
│   └── utils/               # Utilities
│       ├── logger.py        # Logging
│       └── validators.py    # Input validation
├── data/                    # Local storage (created at runtime)
│   ├── uploads/
│   ├── cases/
│   ├── exports/
│   ├── models/
│   └── logs/
├── requirements.txt         # Python dependencies
├── .env.example             # Configuration template
└── README.md                # This file
```

---

## Tech Stack

- **Framework**: FastAPI 0.109
- **WSI Processing**: OpenSlide 1.3.1, Pillow, OpenCV
- **AI/ML**: PyTorch 2.1, Transformers 4.36, MedGemma
- **Report Generation**: ReportLab 4.0
- **Storage**: Local filesystem with aiosqlite
- **Python**: 3.10+

---

## Installation

### Prerequisites

1. **Python 3.10 or higher**
   ```bash
   python --version
   ```

2. **OpenSlide Library** (system dependency)

   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install openslide-tools python3-openslide
   ```

   **macOS:**
   ```bash
   brew install openslide
   ```

   **Windows:**
   Download from: https://openslide.org/download/

3. **Virtual Environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: If you have a GPU and want to use CUDA:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### Download MedGemma Model

The model will be automatically downloaded on first run, or you can pre-download:

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "google/medgemma-2b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
```

**Note**: You may need to accept the model license on Hugging Face first.

### Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings:
   ```bash
   # Key settings:
   DEBUG=True                    # Enable for development
   DEVICE=cuda                   # Use 'cpu' if no GPU
   USE_QUANTIZATION=True         # Enable 8-bit quantization (saves memory)
   MODEL_NAME=google/medgemma-2b # MedGemma model
   ```

---

## Running the Backend

### Development Mode

```bash
cd backend
python -m app.main
```

Or use uvicorn directly:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

The API will be available at:
- **API**: http://127.0.0.1:8000
- **Docs**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

---

## API Endpoints

### Health & Status

- `GET /` - Root endpoint
- `GET /health` - Health check

### File Upload

- `POST /upload` - Upload WSI file

### Metadata & Patches

- `GET /metadata/{case_id}` - Get slide metadata
- `GET /patches/{case_id}` - Get patch information

### ROI Selection

- `POST /roi/confirm` - Confirm ROI selection

### AI Analysis

- `POST /analyze` - Run AI analysis on selected patches

### Reports

- `GET /report/{case_id}` - Generate/retrieve structured report
- `POST /export` - Export report (PDF/JSON/TXT)
- `GET /export/{case_id}/download` - Download exported report

### Case Management

- `GET /cases` - List all cases
- `GET /cases/{case_id}/status` - Get case status
- `DELETE /cases/{case_id}` - Delete case

---

## Usage Example

### 1. Upload a Slide

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@sample_slide.svs"
```

Response:
```json
{
  "case_id": "case_a1b2c3d4e5f6",
  "filename": "sample_slide.svs",
  "file_size": 12345678,
  "status": "uploaded",
  "message": "File uploaded successfully. Processing started."
}
```

### 2. Get Metadata

```bash
curl "http://localhost:8000/metadata/case_a1b2c3d4e5f6"
```

### 3. Get Patches

```bash
curl "http://localhost:8000/patches/case_a1b2c3d4e5f6"
```

### 4. Confirm ROI Selection

```bash
curl -X POST "http://localhost:8000/roi/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "case_a1b2c3d4e5f6",
    "selected_patch_ids": [],
    "auto_select": true,
    "top_k": 50
  }'
```

### 5. Run AI Analysis

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "case_a1b2c3d4e5f6",
    "patch_ids": ["case_a1b2c3d4e5f6_100_200_0", "..."],
    "clinical_context": "Patient history: ...",
    "include_confidence": true
  }'
```

### 6. Get Report

```bash
curl "http://localhost:8000/report/case_a1b2c3d4e5f6"
```

### 7. Export Report

```bash
curl -X POST "http://localhost:8000/export" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "case_a1b2c3d4e5f6",
    "format": "pdf",
    "include_images": false
  }'
```

### 8. Download Export

```bash
curl "http://localhost:8000/export/case_a1b2c3d4e5f6/download?format=pdf" \
  --output report.pdf
```

---

## MedGemma Prompt Templates

The system uses structured prompts for safety and consistency. Key templates:

### System Instruction

```
You are a medical AI assistant specialized in pathology image analysis.
Your role is to assist pathologists by providing observations and potential
findings from histopathology slides.

CRITICAL GUIDELINES:
1. You provide decision support ONLY, not definitive diagnoses
2. Always express appropriate uncertainty and confidence levels
3. Use phrases like "suggests", "consistent with", "may indicate"
4. NEVER use definitive diagnostic language
5. Always recommend verification by qualified pathologists
```

### Analysis Template

Prompts include:
- Number of regions analyzed
- Tissue characteristics summary
- Optional clinical context
- Structured output format (tissue type, findings, confidence, recommendations)

---

## Safety & Compliance

### Medical Disclaimers

All reports automatically include:
```
IMPORTANT MEDICAL DISCLAIMER:
This report is generated by an AI-assisted system for research and decision
support purposes only. It is NOT intended for diagnostic use. All findings
should be verified by qualified healthcare professionals.
```

### Audit Logging

All AI inferences are logged with:
- Timestamp
- Case ID
- Model name
- Input/output summaries
- Confidence scores
- Warnings

Logs stored in: `data/logs/`

### Safety Checks

- Forbidden diagnostic language detection
- Confidence threshold warnings
- Input validation
- Output sanitization

---

## Storage Structure

```
data/
├── cases/
│   └── case_a1b2c3d4e5f6/
│       ├── slide_sample.svs          # Original slide
│       ├── metadata.json              # Slide metadata
│       ├── status.json                # Case status
│       ├── patches/                   # Extracted patches
│       ├── thumbnails/
│       │   └── thumbnail.png
│       └── results/
│           ├── processing.json        # WSI processing
│           ├── roi.json               # ROI selection
│           ├── analysis.json          # AI analysis
│           └── report.json            # Final report
├── exports/
│   ├── case_a1b2c3d4e5f6_20260114_123456.pdf
│   ├── case_a1b2c3d4e5f6_20260114_123456.json
│   └── case_a1b2c3d4e5f6_20260114_123456.txt
└── logs/
    ├── 20260114_app.log
    ├── 20260114_inference.jsonl
    └── 20260114_errors.jsonl
```

---

## Troubleshooting

### OpenSlide Not Found

**Error**: `openslide library not found`

**Solution**:
- Install system OpenSlide library (see Prerequisites)
- Verify with: `python -c "import openslide; print(openslide.__version__)"`

### CUDA Out of Memory

**Error**: `CUDA out of memory`

**Solutions**:
1. Enable quantization: `USE_QUANTIZATION=True`
2. Use CPU: `DEVICE=cpu`
3. Reduce batch size or patch count

### Model Download Fails

**Error**: `HTTPError 401 Unauthorized`

**Solution**:
- Accept MedGemma license on Hugging Face
- Login with: `huggingface-cli login`

### Slow Inference

**Solutions**:
1. Enable GPU: `DEVICE=cuda`
2. Use quantization: `USE_QUANTIZATION=True`
3. Reduce `MAX_TOKENS` in config

---

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
```

### Adding New Features

1. Create module in appropriate directory
2. Add models to `models.py`
3. Create endpoint in `main.py`
4. Update documentation

---

## Performance Optimization

### For GPU Systems

```bash
# .env
DEVICE=cuda
USE_QUANTIZATION=True
```

### For CPU Systems

```bash
# .env
DEVICE=cpu
USE_QUANTIZATION=False  # Quantization requires GPU
MAX_PATCHES_PER_SLIDE=500  # Reduce for faster processing
```

### Memory Management

- **Quantization**: Reduces model size from ~16GB to ~2GB
- **Patch Limiting**: Prevents excessive memory usage
- **Lazy Loading**: Models loaded on-demand

---

## Security Considerations

1. **No External APIs**: Fully offline operation
2. **Local Storage Only**: No cloud dependencies
3. **Input Validation**: All inputs sanitized
4. **Audit Trails**: Complete logging
5. **Medical Disclaimers**: Automatic inclusion

---

## License

Proprietary - All rights reserved

---

## Medical Device Notice

**This software is intended for research and decision support purposes only.**

It is NOT:
- A diagnostic device
- A replacement for professional judgment
- FDA approved or CE marked
- Intended for clinical use without verification

All findings must be verified by qualified healthcare professionals.

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check logs in `data/logs/`

---

## Version

**Backend Version**: 1.0.0
**API Version**: 1.0.0
**Python**: 3.10+
**FastAPI**: 0.109.0
