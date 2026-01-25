"""
Storage management for cases, metadata, and results.
"""
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
import aiofiles

from ..config import settings
from ..models import (
    SlideMetadata,
    WSIProcessingResult,
    ROIResult,
    AnalysisResult,
    StructuredReport,
    CaseStatus,
)
from ..utils import get_logger

logger = get_logger(__name__)


class StorageManager:
    """Manages local filesystem storage for cases and results."""

    def __init__(self):
        """Initialize storage manager."""
        self.cases_dir = settings.CASES_DIR
        self.uploads_dir = settings.UPLOAD_DIR
        self.exports_dir = settings.EXPORTS_DIR

    def get_case_dir(self, case_id: str) -> Path:
        """Get case directory path."""
        return self.cases_dir / case_id

    def create_case(self, case_id: str) -> Path:
        """
        Create directory structure for a new case.

        Args:
            case_id: Case identifier

        Returns:
            Path to case directory
        """
        case_dir = self.get_case_dir(case_id)
        case_dir.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        (case_dir / "patches").mkdir(exist_ok=True)
        (case_dir / "thumbnails").mkdir(exist_ok=True)
        (case_dir / "results").mkdir(exist_ok=True)

        logger.info(f"Created case directory: {case_id}")
        return case_dir

    async def optimize_case(self, case_id: str, wsi_processor) -> bool:
        """
        Optimize case storage by saving patches and deleting the original WSI file.

        Args:
            case_id: Case identifier
            wsi_processor: WSI Processor instance to handle patch extraction

        Returns:
            True if successful
        """
        try:
            # Check if already optimized
            status = await self.get_case_status(case_id)
            if status and status.get("optimized"):
                logger.info(f"Case {case_id} is already optimized")
                return True

            # Load processing result to get patches
            result = await self.load_processing_result(case_id)
            if not result:
                logger.error(f"Cannot optimize case {case_id}: No processing result found")
                return False

            # Load ROI result to prioritize ROI patches (optional, currently we save all tissue patches)
            # For now, we save all patches identified in processing result (which are tissue patches usually)

            # Define output directory
            patches_dir = self.get_case_dir(case_id) / "patches"
            patches_dir.mkdir(exist_ok=True)

            # Save patch images
            slide_path = self.get_slide_path(case_id)
            if not slide_path:
                logger.warning(f"No slide file found for case {case_id}, might be already deleted")
            else:
                # Save all patches
                logger.info(f"Extracting and saving {len(result.patches)} patch images for optimization...")
                count = await wsi_processor.save_patches(case_id, slide_path, result.patches, patches_dir)
                logger.info(f"Saved {count} patch images")

                # Delete original slide file
                logger.info(f"Deleting original slide file: {slide_path}")
                slide_path.unlink()

            # Update status to optimized
            await self.update_case_status(
                case_id,
                CaseStatus.OPTIMIZED, # You might need to add this status enum if it doesn't exist, or reuse COMPLETED
                "Storage optimized (WSI deleted, patches saved)"
            )
            
            # Update metadata to reflect optimized state
            metadata = await self.load_metadata(case_id)
            if metadata:
                # specific field for optimized? using status for now.
                pass

            # Hack: Update status.json specifically with the 'optimized' flag
            status_file = self.get_case_dir(case_id) / "status.json"
            if status_file.exists():
                async with aiofiles.open(status_file, "r") as f:
                    current_status = json.loads(await f.read())
                
                current_status["optimized"] = True
                
                async with aiofiles.open(status_file, "w") as f:
                    await f.write(json.dumps(current_status, indent=2))

            return True

        except Exception as e:
            logger.error(f"Failed to optimize case {case_id}: {e}")
            return False

    async def save_uploaded_file(self, case_id: str, file_path: Path, original_filename: str) -> Path:
        """
        Move uploaded file to case directory.

        Args:
            case_id: Case identifier
            file_path: Temporary file path
            original_filename: Original filename

        Returns:
            Path to saved file
        """
        case_dir = self.create_case(case_id)
        dest_path = case_dir / f"slide_{original_filename}"

        # Move file
        shutil.move(str(file_path), str(dest_path))

        logger.info(f"Saved slide file: {dest_path}")
        return dest_path

    async def save_metadata(self, metadata: SlideMetadata) -> None:
        """
        Save slide metadata.

        Args:
            metadata: Slide metadata
        """
        case_dir = self.get_case_dir(metadata.case_id)
        metadata_file = case_dir / "metadata.json"

        async with aiofiles.open(metadata_file, "w") as f:
            await f.write(metadata.model_dump_json(indent=2))

        logger.info(f"Saved metadata for case {metadata.case_id}")

    async def load_metadata(self, case_id: str) -> Optional[SlideMetadata]:
        """
        Load slide metadata.

        Args:
            case_id: Case identifier

        Returns:
            Slide metadata or None if not found
        """
        metadata_file = self.get_case_dir(case_id) / "metadata.json"

        if not metadata_file.exists():
            return None

        async with aiofiles.open(metadata_file, "r") as f:
            data = await f.read()
            return SlideMetadata.model_validate_json(data)

    async def save_processing_result(self, result: WSIProcessingResult) -> None:
        """
        Save WSI processing result.

        Args:
            result: Processing result
        """
        case_dir = self.get_case_dir(result.case_id)
        result_file = case_dir / "results" / "processing.json"

        async with aiofiles.open(result_file, "w") as f:
            await f.write(result.model_dump_json(indent=2))

        logger.info(f"Saved processing result for case {result.case_id}")

    async def load_processing_result(self, case_id: str) -> Optional[WSIProcessingResult]:
        """
        Load WSI processing result.

        Args:
            case_id: Case identifier

        Returns:
            Processing result or None if not found
        """
        result_file = self.get_case_dir(case_id) / "results" / "processing.json"

        if not result_file.exists():
            return None

        async with aiofiles.open(result_file, "r") as f:
            data = await f.read()
            return WSIProcessingResult.model_validate_json(data)

    async def save_roi_result(self, result: ROIResult) -> None:
        """
        Save ROI selection result.

        Args:
            result: ROI result
        """
        case_dir = self.get_case_dir(result.case_id)
        result_file = case_dir / "results" / "roi.json"

        async with aiofiles.open(result_file, "w") as f:
            await f.write(result.model_dump_json(indent=2))

        logger.info(f"Saved ROI result for case {result.case_id}")

    async def load_roi_result(self, case_id: str) -> Optional[ROIResult]:
        """
        Load ROI selection result.

        Args:
            case_id: Case identifier

        Returns:
            ROI result or None if not found
        """
        result_file = self.get_case_dir(case_id) / "results" / "roi.json"

        if not result_file.exists():
            return None

        async with aiofiles.open(result_file, "r") as f:
            data = await f.read()
            return ROIResult.model_validate_json(data)

    async def save_analysis_result(self, result: AnalysisResult) -> None:
        """
        Save AI analysis result.

        Args:
            result: Analysis result
        """
        case_dir = self.get_case_dir(result.case_id)
        result_file = case_dir / "results" / "analysis.json"

        async with aiofiles.open(result_file, "w") as f:
            await f.write(result.model_dump_json(indent=2))

        logger.info(f"Saved analysis result for case {result.case_id}")

    async def load_analysis_result(self, case_id: str) -> Optional[AnalysisResult]:
        """
        Load AI analysis result.

        Args:
            case_id: Case identifier

        Returns:
            Analysis result or None if not found
        """
        result_file = self.get_case_dir(case_id) / "results" / "analysis.json"

        if not result_file.exists():
            return None

        async with aiofiles.open(result_file, "r") as f:
            data = await f.read()
            return AnalysisResult.model_validate_json(data)

    async def save_report(self, report: StructuredReport) -> None:
        """
        Save structured report.

        Args:
            report: Structured report
        """
        case_dir = self.get_case_dir(report.case_id)
        report_file = case_dir / "results" / "report.json"

        async with aiofiles.open(report_file, "w") as f:
            await f.write(report.model_dump_json(indent=2))

        logger.info(f"Saved report for case {report.case_id}")

    async def load_report(self, case_id: str) -> Optional[StructuredReport]:
        """
        Load structured report.

        Args:
            case_id: Case identifier

        Returns:
            Structured report or None if not found
        """
        report_file = self.get_case_dir(case_id) / "results" / "report.json"

        if not report_file.exists():
            return None

        async with aiofiles.open(report_file, "r") as f:
            data = await f.read()
            return StructuredReport.model_validate_json(data)

    async def update_case_status(self, case_id: str, status: CaseStatus, message: Optional[str] = None) -> None:
        """
        Update case status.

        Args:
            case_id: Case identifier
            status: New status
            message: Optional status message
        """
        case_dir = self.get_case_dir(case_id)
        status_file = case_dir / "status.json"

        status_data = {
            "case_id": case_id,
            "status": status.value,
            "message": message,
            "updated_at": datetime.utcnow().isoformat(),
        }

        async with aiofiles.open(status_file, "w") as f:
            await f.write(json.dumps(status_data, indent=2))

        logger.info(f"Updated case {case_id} status to {status.value}")

    async def get_case_status(self, case_id: str) -> Optional[Dict[str, Any]]:
        """
        Get case status.

        Args:
            case_id: Case identifier

        Returns:
            Status data or None if not found
        """
        status_file = self.get_case_dir(case_id) / "status.json"

        if not status_file.exists():
            return None

        async with aiofiles.open(status_file, "r") as f:
            data = await f.read()
            try:
                if not data.strip():
                    return None
                return json.loads(data)
            except json.JSONDecodeError:
                return None

    async def list_cases(self) -> List[Dict[str, Any]]:
        """
        List all cases.

        Returns:
            List of case summaries
        """
        cases = []

        for case_dir in self.cases_dir.iterdir():
            if not case_dir.is_dir():
                continue

            case_id = case_dir.name
            status = await self.get_case_status(case_id)
            metadata = await self.load_metadata(case_id)

            case_summary = {
                "case_id": case_id,
                "status": status.get("status") if status else "unknown",
                "filename": metadata.filename if metadata else None,
                "created_at": metadata.created_at.isoformat() if metadata else None,
            }

            cases.append(case_summary)

        # Sort by creation date (newest first)
        cases.sort(key=lambda x: x.get("created_at") or "", reverse=True)

        return cases

    def delete_case(self, case_id: str) -> bool:
        """
        Delete a case and all associated data.

        Args:
            case_id: Case identifier

        Returns:
            True if deleted successfully
        """
        case_dir = self.get_case_dir(case_id)

        if not case_dir.exists():
            return False

        shutil.rmtree(case_dir)
        logger.info(f"Deleted case {case_id}")

        return True

    def get_slide_path(self, case_id: str) -> Optional[Path]:
        """
        Get path to slide file.

        Args:
            case_id: Case identifier

        Returns:
            Path to slide file or None if not found
        """
        case_dir = self.get_case_dir(case_id)

        # Look for slide file (starts with "slide_")
        for file_path in case_dir.glob("slide_*"):
            if file_path.is_file():
                return file_path

    async def get_raw_context_content(self, case_id: str) -> Optional[str]:
        """
        Retrieve raw content of the first found context file (JSON/TXT/PDF).
        Excludes system files like metadata.json, results/*.
        
        Args:
            case_id: Case identifier
            
        Returns:
            Raw content string or None
        """
        case_dir = self.get_case_dir(case_id)
        if not case_dir.exists():
            return None
            
        # Candidates: Generic search for non-system files
        excluded_names = ["metadata.json", "status.json"]
        
        # 1. Check for specific extensions in root case dir
        for ext in ["*.json", "*.txt"]:
            for file_path in case_dir.glob(ext):
                if file_path.name not in excluded_names and not file_path.name.startswith("slide_"):
                    # Found a candidate
                    try:
                        async with aiofiles.open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            return await f.read()
                    except Exception as e:
                        logger.warning(f"Failed to read context file {file_path}: {e}")
                        
        return None
