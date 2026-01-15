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

        return None
