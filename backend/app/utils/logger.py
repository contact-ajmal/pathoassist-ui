"""
Logging utilities for PathoAssist backend.
"""
import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from pythonjsonlogger import jsonlogger

from ..config import settings


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    # File handler (JSON format for compliance)
    log_file = settings.LOGS_DIR / f"{datetime.now().strftime('%Y%m%d')}_app.log"
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)

    json_format = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s",
        timestamp=True,
    )
    file_handler.setFormatter(json_format)
    logger.addHandler(file_handler)

    return logger


def log_inference(
    case_id: str,
    model_name: str,
    input_data: Dict[str, Any],
    output_data: Dict[str, Any],
    confidence: float,
    processing_time: float,
    warnings: Optional[list[str]] = None,
):
    """
    Log AI inference for compliance and audit trail.

    Args:
        case_id: Case identifier
        model_name: Model used for inference
        input_data: Input data (sanitized)
        output_data: Output data (sanitized)
        confidence: Overall confidence score
        processing_time: Time taken for inference
        warnings: Any warnings generated
    """
    if not settings.LOG_ALL_INFERENCES:
        return

    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "ai_inference",
        "case_id": case_id,
        "model_name": model_name,
        "input_summary": {
            "num_patches": input_data.get("num_patches", 0),
            "has_clinical_context": bool(input_data.get("clinical_context")),
        },
        "output_summary": {
            "num_findings": len(output_data.get("findings", [])),
            "tissue_type": output_data.get("tissue_type"),
        },
        "confidence": confidence,
        "processing_time_seconds": processing_time,
        "warnings": warnings or [],
    }

    # Write to dedicated inference log
    inference_log_file = settings.LOGS_DIR / f"{datetime.now().strftime('%Y%m%d')}_inference.jsonl"

    with open(inference_log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

    logger = get_logger("inference")
    logger.info(f"Inference logged for case {case_id}")


def log_error(
    error_type: str,
    error_message: str,
    case_id: Optional[str] = None,
    stack_trace: Optional[str] = None,
):
    """
    Log errors with context.

    Args:
        error_type: Type of error
        error_message: Error message
        case_id: Optional case ID
        stack_trace: Optional stack trace
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "error",
        "error_type": error_type,
        "error_message": error_message,
        "case_id": case_id,
        "stack_trace": stack_trace,
    }

    error_log_file = settings.LOGS_DIR / f"{datetime.now().strftime('%Y%m%d')}_errors.jsonl"

    with open(error_log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

    logger = get_logger("errors")
    logger.error(f"{error_type}: {error_message}")
