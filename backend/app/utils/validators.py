"""
Validation utilities for PathoAssist backend.
"""
import re
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, UploadFile

from ..config import settings


# Supported WSI file extensions
SUPPORTED_WSI_FORMATS = {".svs", ".tif", ".tiff", ".ndpi", ".mrxs"}

# Maximum file size (5GB)
MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024


def validate_wsi_file(file: UploadFile) -> None:
    """
    Validate uploaded WSI file.

    Args:
        file: Uploaded file

    Raises:
        HTTPException: If validation fails
    """
    # Check filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in SUPPORTED_WSI_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported formats: {', '.join(SUPPORTED_WSI_FORMATS)}",
        )

    # Check content type (if provided)
    if file.content_type and not (
        file.content_type.startswith("image/") or file.content_type == "application/octet-stream"
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type: {file.content_type}",
        )


def validate_case_id(case_id: str) -> None:
    """
    Validate case ID format.

    Args:
        case_id: Case identifier

    Raises:
        HTTPException: If validation fails
    """
    # Case ID should be alphanumeric with hyphens
    if not re.match(r"^[a-zA-Z0-9\-_]+$", case_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid case ID format. Use only alphanumeric characters, hyphens, and underscores.",
        )

    # Check if case directory exists
    case_dir = settings.CASES_DIR / case_id
    if not case_dir.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Case {case_id} not found",
        )


def validate_patch_ids(patch_ids: list[str], case_id: str) -> None:
    """
    Validate patch IDs for a case.

    Args:
        patch_ids: List of patch identifiers
        case_id: Case identifier

    Raises:
        HTTPException: If validation fails
    """
    if not patch_ids:
        raise HTTPException(
            status_code=400,
            detail="No patch IDs provided",
        )

    if len(patch_ids) > settings.MAX_PATCHES_PER_SLIDE:
        raise HTTPException(
            status_code=400,
            detail=f"Too many patches. Maximum: {settings.MAX_PATCHES_PER_SLIDE}",
        )

    # Each patch ID should be in format: case_id_x_y_level
    pattern = re.compile(rf"^{re.escape(case_id)}_\d+_\d+_\d+$")
    invalid_ids = [pid for pid in patch_ids if not pattern.match(pid)]

    if invalid_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid patch IDs: {', '.join(invalid_ids[:5])}",
        )


def validate_clinical_context(text: Optional[str]) -> None:
    """
    Validate clinical context text.

    Args:
        text: Clinical context text

    Raises:
        HTTPException: If validation fails
    """
    if not text:
        return

    # Check length
    max_length = 2000
    if len(text) > max_length:
        raise HTTPException(
            status_code=400,
            detail=f"Clinical context too long. Maximum: {max_length} characters",
        )

    # Check for potentially harmful content (basic check)
    forbidden_patterns = [
        r"<script",
        r"javascript:",
        r"onerror=",
    ]

    for pattern in forbidden_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            raise HTTPException(
                status_code=400,
                detail="Clinical context contains invalid content",
            )


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = Path(filename).name

    # Replace spaces and special characters
    filename = re.sub(r"[^\w\-.]", "_", filename)

    # Limit length
    if len(filename) > 255:
        name = Path(filename).stem[:200]
        ext = Path(filename).suffix
        filename = name + ext

    return filename


def check_storage_space(required_bytes: int) -> bool:
    """
    Check if sufficient storage space is available.

    Args:
        required_bytes: Required storage in bytes

    Returns:
        True if sufficient space available
    """
    import shutil

    try:
        stat = shutil.disk_usage(settings.DATA_DIR)
        available = stat.free

        # Require 10% buffer
        return available > (required_bytes * 1.1)
    except Exception:
        # If we can't check, assume it's OK
        return True
