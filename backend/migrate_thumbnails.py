import os
import sys
from pathlib import Path

# Add backend directory to Python path so we can import app modules
backend_dir = Path("/Users/zaza/Documents/Ajmal-coding-Projects/pathoassist-ui/backend")
sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.wsi.processor import WSIProcessor

def migrate_existing_cases():
    processor = WSIProcessor()
    cases_dir = settings.CASES_DIR
    
    if not cases_dir.exists():
        print(f"Cases dir {cases_dir} does not exist.")
        return
        
    for case_dir in cases_dir.iterdir():
        if not case_dir.is_dir():
            continue
            
        case_id = case_dir.name
        thumbnails_dir = case_dir / "thumbnails"
        hd_path = thumbnails_dir / "hd_thumbnail.jpg"
        
        # Check if WSI file exists
        wsi_files = list(case_dir.glob("*.svs")) + list(case_dir.glob("*.ndpi")) + list(case_dir.glob("*.tif")) + list(case_dir.glob("*.tiff"))
        
        if not hd_path.exists() and wsi_files:
            slide_path = wsi_files[0]
            print(f"Generating HD thumbnail for case: {case_id}")
            try:
                thumbnails_dir.mkdir(parents=True, exist_ok=True)
                processor.generate_thumbnail(slide_path, hd_path, max_size=(4000, 4000))
                print(f"  -> OK: {hd_path}")
            except Exception as e:
                print(f"  -> Error: {e}")

if __name__ == "__main__":
    print("Starting thumbnail migration...")
    migrate_existing_cases()
    print("Done.")
