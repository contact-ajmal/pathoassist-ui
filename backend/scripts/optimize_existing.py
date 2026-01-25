import asyncio
import sys
import os
from pathlib import Path

# Add backend directory to python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.storage.manager import StorageManager
from app.wsi.processor import WSIProcessor
from app.utils import get_logger

logger = get_logger(__name__)

async def optimize_all_cases():
    """
    Iterate through all cases and apply storage optimization.
    """
    print("Initializing Storage Manager and WSI Processor...")
    storage_manager = StorageManager()
    wsi_processor = WSIProcessor()
    
    # List all cases
    print("Fetching cases...")
    cases = await storage_manager.list_cases()
    print(f"Found {len(cases)} cases.")
    
    optimized_count = 0
    skipped_count = 0
    failed_count = 0
    
    for case_summary in cases:
        case_id = case_summary["case_id"]
        print(f"\nProcessing case: {case_id}")
        
        # Check status
        status = await storage_manager.get_case_status(case_id)
        if status and status.get("optimized"):
            print(f"  - Already optimized. Skipping.")
            skipped_count += 1
            continue
            
        # Check if slide exists
        slide_path = storage_manager.get_slide_path(case_id)
        if not slide_path or not slide_path.exists():
            print(f"  - No WSI file found. Skipping.")
            skipped_count += 1
            continue
            
        # Optimize
        print(f"  - Optimizing (extracting patches, deleting WSI)...")
        try:
            success = await storage_manager.optimize_case(case_id, wsi_processor)
            if success:
                print(f"  - SUCCESS")
                optimized_count += 1
            else:
                print(f"  - FAILED")
                failed_count += 1
        except Exception as e:
            print(f"  - ERROR: {e}")
            failed_count += 1
            
    print("\n" + "="*30)
    print("BATCH OPTIMIZATION COMPLETE")
    print(f"Total Cases: {len(cases)}")
    print(f"Optimized:   {optimized_count}")
    print(f"Skipped:     {skipped_count}")
    print(f"Failed:      {failed_count}")
    print("="*30)

if __name__ == "__main__":
    try:
        asyncio.run(optimize_all_cases())
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
