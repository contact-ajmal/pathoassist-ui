# PathoAssist Backend - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Python 3.10+
- OpenSlide library installed on your system

## Installation

### 1. System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install openslide-tools python3-openslide
```

**macOS:**
```bash
brew install openslide
```

### 2. Backend Setup

```bash
cd backend

# Run automated setup
./setup.sh

# Or manual setup:
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 3. Configuration (Optional)

Edit `.env` to customize:
```bash
# Enable GPU if available
DEVICE=cuda

# Or use CPU only
DEVICE=cpu
```

### 4. Start Backend

```bash
./run.sh

# Or manually:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Testing the API

### Using Browser

Visit http://127.0.0.1:8000/docs for interactive API documentation

### Using cURL

```bash
# Health check
curl http://127.0.0.1:8000/health

# Upload a slide
curl -X POST "http://127.0.0.1:8000/upload" \
  -F "file=@/path/to/slide.svs"

# Get metadata (use case_id from upload response)
curl http://127.0.0.1:8000/metadata/case_abc123
```

### Complete Workflow

```python
import requests
import time

BASE_URL = "http://127.0.0.1:8000"

# 1. Upload slide
with open("slide.svs", "rb") as f:
    response = requests.post(f"{BASE_URL}/upload", files={"file": f})
case_id = response.json()["case_id"]
print(f"Case ID: {case_id}")

# 2. Wait for processing
time.sleep(5)

# 3. Get patches
patches = requests.get(f"{BASE_URL}/patches/{case_id}").json()
print(f"Found {patches['total_patches']} patches")

# 4. Auto-select ROIs
roi_response = requests.post(f"{BASE_URL}/roi/confirm", json={
    "case_id": case_id,
    "selected_patch_ids": [],
    "auto_select": True,
    "top_k": 50
})
selected_patches = roi_response.json()["selected_patches"]
patch_ids = [p["patch_id"] for p in selected_patches]

# 5. Run AI analysis
analysis = requests.post(f"{BASE_URL}/analyze", json={
    "case_id": case_id,
    "patch_ids": patch_ids,
    "clinical_context": "Optional patient history here"
}).json()
print(f"Analysis complete: {len(analysis['findings'])} findings")

# 6. Get report
report = requests.get(f"{BASE_URL}/report/{case_id}").json()
print(f"Report generated for {report['tissue_type']}")

# 7. Export PDF
export_result = requests.post(f"{BASE_URL}/export", json={
    "case_id": case_id,
    "format": "pdf"
}).json()
print(f"Report exported: {export_result['file_path']}")

# 8. Download PDF
pdf_response = requests.get(f"{BASE_URL}/export/{case_id}/download?format=pdf")
with open(f"{case_id}.pdf", "wb") as f:
    f.write(pdf_response.content)
print(f"PDF downloaded: {case_id}.pdf")
```

## Connecting Frontend

The React frontend at `http://localhost:8080` will automatically connect to the backend API.

Make sure:
1. Backend is running on port 8000
2. Frontend is running on port 8080
3. CORS is configured correctly (already set in `.env`)

## Troubleshooting

### OpenSlide Not Found
```bash
# Verify OpenSlide is installed
python -c "import openslide; print(openslide.__version__)"
```

### Model Not Loading
```bash
# Accept license on Hugging Face
huggingface-cli login

# Then visit: https://huggingface.co/google/medgemma-2b
```

### CUDA Out of Memory
```bash
# In .env, enable quantization or use CPU
USE_QUANTIZATION=True
# or
DEVICE=cpu
```

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Explore API at http://127.0.0.1:8000/docs
- Review code in `app/` directory
- Check logs in `data/logs/` for debugging

## Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload WSI file |
| `/metadata/{case_id}` | GET | Get slide metadata |
| `/patches/{case_id}` | GET | Get patches |
| `/roi/confirm` | POST | Confirm ROI selection |
| `/analyze` | POST | Run AI analysis |
| `/report/{case_id}` | GET | Get/generate report |
| `/export` | POST | Export report |
| `/cases` | GET | List all cases |

## Directory Structure

```
backend/
├── app/                 # Application code
├── data/                # Local storage (created at runtime)
│   ├── uploads/         # Uploaded files
│   ├── cases/           # Case data
│   ├── exports/         # Exported reports
│   └── logs/            # Application logs
├── requirements.txt     # Dependencies
├── .env                 # Configuration
├── setup.sh             # Setup script
└── run.sh               # Run script
```

## Performance Tips

**For GPU Systems:**
- Set `DEVICE=cuda` in `.env`
- Enable `USE_QUANTIZATION=True` to save memory
- Use PyTorch with CUDA support

**For CPU Systems:**
- Set `DEVICE=cpu` in `.env`
- Reduce `MAX_PATCHES_PER_SLIDE` to 500
- Expect slower inference (~30-60s per case)

## Support

Check the main [README.md](README.md) for:
- Detailed architecture
- API documentation
- Safety & compliance info
- Advanced configuration

---

**Ready to go!** 🚀

Start the backend and begin processing pathology slides.
