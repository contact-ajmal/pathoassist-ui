"""
FastAPI main application for PathoAssist backend.
"""
import uuid
import shutil
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .config import settings, init_directories
from .models import (
    UploadResponse,
    SlideMetadata,
    WSIProcessingResult,
    ROISelection,
    ROIResult,
    AnalysisRequest,
    AnalysisResult,
    StructuredReport,
    ReportExportRequest,
    ReportExportResult,
    HealthResponse,
    CaseStatus,
    ErrorResponse,
)
from .wsi import WSIProcessor
from .roi import ROISelector
from .inference import InferenceEngine
from .report import ReportGenerator
from .export import ReportExporter
from .storage import StorageManager
from .utils import get_logger, validate_wsi_file, validate_case_id, sanitize_filename

logger = get_logger(__name__)


# Global instances
wsi_processor = WSIProcessor()
roi_selector = ROISelector()
inference_engine = InferenceEngine()
report_generator = ReportGenerator()
report_exporter = ReportExporter()
storage_manager = StorageManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    # Startup
    logger.info("🚀 Starting PathoAssist backend...")

    # Initialize directories
    init_directories()

    # Load AI model
    logger.info("Loading AI model...")
    model_loaded = inference_engine.load_model()

    if model_loaded:
        logger.info("✓ Model loaded successfully")
    else:
        logger.warning("⚠ Model failed to load - inference will not be available")

    yield

    # Shutdown
    logger.info("Shutting down PathoAssist backend...")
    inference_engine.unload_model()
    logger.info("✓ Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="PathoAssist Backend API",
    description="Offline WSI Pathology Report Generator - Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# HEALTH & STATUS
# ============================================================================

@app.get("/", response_model=dict)
async def root():
    """Root endpoint."""
    return {
        "service": "PathoAssist Backend API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        model_loaded=inference_engine.is_loaded,
        storage_available=settings.DATA_DIR.exists(),
    )


# ============================================================================
# FILE UPLOAD
# ============================================================================

@app.post("/upload", response_model=UploadResponse)
async def upload_slide(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """
    Upload a WSI file.

    Args:
        file: Uploaded WSI file

    Returns:
        Upload response with case ID
    """
    try:
        # Validate file
        validate_wsi_file(file)

        # Generate case ID
        case_id = f"case_{uuid.uuid4().hex[:12]}"

        logger.info(f"Processing upload for case {case_id}: {file.filename}")

        # Save file temporarily
        temp_path = settings.UPLOAD_DIR / f"temp_{case_id}_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Sanitize filename
        safe_filename = sanitize_filename(file.filename)

        # Move to case directory
        await storage_manager.save_uploaded_file(case_id, temp_path, safe_filename)

        # Update status
        await storage_manager.update_case_status(
            case_id,
            CaseStatus.UPLOADED,
            "File uploaded successfully",
        )

        # Schedule background processing
        background_tasks.add_task(process_slide_background, case_id)

        return UploadResponse(
            case_id=case_id,
            filename=safe_filename,
            file_size=temp_path.stat().st_size,
            status=CaseStatus.UPLOADED,
            message="File uploaded successfully. Processing started.",
        )

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_slide_background(case_id: str):
    """
    Background task to process uploaded slide.

    Args:
        case_id: Case identifier
    """
    try:
        logger.info(f"Background processing started for case {case_id}")

        # Update status
        await storage_manager.update_case_status(
            case_id,
            CaseStatus.PROCESSING,
            "Processing slide...",
        )

        # Get slide path
        slide_path = storage_manager.get_slide_path(case_id)
        if not slide_path:
            raise FileNotFoundError(f"Slide file not found for case {case_id}")

        # Process slide
        case_dir = storage_manager.get_case_dir(case_id)
        thumbnail_dir = case_dir / "thumbnails"

        result = await wsi_processor.process_slide(
            case_id=case_id,
            slide_path=slide_path,
            thumbnail_dir=thumbnail_dir,
        )

        # Save processing result
        await storage_manager.save_processing_result(result)

        # Extract and save metadata
        metadata = wsi_processor.extract_metadata(case_id, slide_path)
        await storage_manager.save_metadata(metadata)

        # Update status
        await storage_manager.update_case_status(
            case_id,
            CaseStatus.ROI_PENDING,
            "Slide processed. Ready for ROI selection.",
        )

        logger.info(f"✓ Background processing complete for case {case_id}")

    except Exception as e:
        logger.error(f"Background processing failed for case {case_id}: {e}")
        await storage_manager.update_case_status(
            case_id,
            CaseStatus.FAILED,
            f"Processing failed: {str(e)}",
        )


# ============================================================================
# METADATA
# ============================================================================

@app.get("/metadata/{case_id}", response_model=SlideMetadata)
async def get_metadata(case_id: str):
    """
    Get slide metadata for a case.

    Args:
        case_id: Case identifier

    Returns:
        Slide metadata
    """
    validate_case_id(case_id)

    metadata = await storage_manager.load_metadata(case_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")

    return metadata


# ============================================================================
# PATCHES
# ============================================================================

@app.get("/patches/{case_id}", response_model=WSIProcessingResult)
async def get_patches(case_id: str):
    """
    Get patch information for a case.

    Args:
        case_id: Case identifier

    Returns:
        Processing result with patches
    """
    validate_case_id(case_id)

    result = await storage_manager.load_processing_result(case_id)
    if not result:
        raise HTTPException(status_code=404, detail="Processing result not found")

    return result


# ============================================================================
# ROI SELECTION
# ============================================================================

@app.post("/roi/confirm", response_model=ROIResult)
async def confirm_roi_selection(selection: ROISelection):
    """
    Confirm ROI selection.

    Args:
        selection: ROI selection request

    Returns:
        ROI selection result
    """
    validate_case_id(selection.case_id)

    # Load patches
    processing_result = await storage_manager.load_processing_result(selection.case_id)
    if not processing_result:
        raise HTTPException(status_code=404, detail="Processing result not found")

    # Confirm selection
    roi_result = roi_selector.confirm_roi_selection(
        all_patches=processing_result.patches,
        selected_patch_ids=selection.selected_patch_ids,
        auto_select=selection.auto_select,
        top_k=selection.top_k,
    )

    # Save ROI result
    await storage_manager.save_roi_result(roi_result)

    # Update status
    await storage_manager.update_case_status(
        selection.case_id,
        CaseStatus.ROI_PENDING,
        f"ROI selection confirmed: {len(roi_result.selected_patches)} patches",
    )

    return roi_result


# ============================================================================
# AI ANALYSIS
# ============================================================================

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_case(request: AnalysisRequest):
    """
    Perform AI analysis on selected patches.

    Args:
        request: Analysis request

    Returns:
        Analysis result
    """
    validate_case_id(request.case_id)

    if not inference_engine.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="AI model not loaded. Inference unavailable.",
        )

    # Update status
    await storage_manager.update_case_status(
        request.case_id,
        CaseStatus.ANALYZING,
        "Running AI analysis...",
    )

    try:
        # Load processing result
        processing_result = await storage_manager.load_processing_result(request.case_id)
        if not processing_result:
            raise HTTPException(status_code=404, detail="Processing result not found")

        # Get selected patches
        patch_lookup = {p.patch_id: p for p in processing_result.patches}
        selected_patches = [
            patch_lookup[pid]
            for pid in request.patch_ids
            if pid in patch_lookup
        ]

        if not selected_patches:
            raise HTTPException(status_code=400, detail="No valid patches found")

        # Run analysis
        result = inference_engine.analyze_patches(
            case_id=request.case_id,
            patches=selected_patches,
            clinical_context=request.clinical_context,
        )

        # Save result
        await storage_manager.save_analysis_result(result)

        # Update status
        await storage_manager.update_case_status(
            request.case_id,
            CaseStatus.COMPLETED,
            "Analysis complete",
        )

        return result

    except Exception as e:
        logger.error(f"Analysis failed for case {request.case_id}: {e}")
        await storage_manager.update_case_status(
            request.case_id,
            CaseStatus.FAILED,
            f"Analysis failed: {str(e)}",
        )
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# REPORT
# ============================================================================

@app.get("/report/{case_id}", response_model=StructuredReport)
async def get_report(case_id: str, patient_context: Optional[str] = None):
    """
    Generate or retrieve structured report.

    Args:
        case_id: Case identifier
        patient_context: Optional patient context

    Returns:
        Structured report
    """
    validate_case_id(case_id)

    # Try to load existing report
    report = await storage_manager.load_report(case_id)

    if not report:
        # Generate new report
        metadata = await storage_manager.load_metadata(case_id)
        analysis_result = await storage_manager.load_analysis_result(case_id)

        if not metadata or not analysis_result:
            raise HTTPException(
                status_code=404,
                detail="Required data not found. Ensure analysis is complete.",
            )

        report = report_generator.generate_report(
            case_id=case_id,
            slide_metadata=metadata,
            analysis_result=analysis_result,
            patient_context=patient_context,
        )

        # Save report
        await storage_manager.save_report(report)

    return report


# ============================================================================
# EXPORT
# ============================================================================

@app.post("/export", response_model=ReportExportResult)
async def export_report(request: ReportExportRequest):
    """
    Export report to specified format.

    Args:
        request: Export request

    Returns:
        Export result
    """
    validate_case_id(request.case_id)

    # Load report
    report = await storage_manager.load_report(request.case_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Export
    try:
        result = report_exporter.export_report(
            report=report,
            format=request.format,
            include_images=request.include_images,
        )

        return result

    except Exception as e:
        logger.error(f"Export failed for case {request.case_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/export/{case_id}/download")
async def download_export(case_id: str, format: str = "pdf"):
    """
    Download exported report.

    Args:
        case_id: Case identifier
        format: Export format (pdf, json, txt)

    Returns:
        File response
    """
    validate_case_id(case_id)

    # Get export path
    from .models import ExportFormat
    try:
        export_format = ExportFormat(format.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid format: {format}")

    export_path = report_exporter.get_export_path(case_id, export_format)

    if not export_path or not export_path.exists():
        raise HTTPException(status_code=404, detail="Export not found")

    # Determine media type
    media_types = {
        "pdf": "application/pdf",
        "json": "application/json",
        "txt": "text/plain",
    }

    return FileResponse(
        path=str(export_path),
        media_type=media_types.get(format, "application/octet-stream"),
        filename=export_path.name,
    )


# ============================================================================
# CASE MANAGEMENT
# ============================================================================

@app.get("/cases", response_model=list[dict])
async def list_cases():
    """
    List all cases.

    Returns:
        List of case summaries
    """
    cases = await storage_manager.list_cases()
    return cases


@app.get("/cases/{case_id}/status")
async def get_case_status(case_id: str):
    """
    Get case status.

    Args:
        case_id: Case identifier

    Returns:
        Case status
    """
    validate_case_id(case_id)

    status = await storage_manager.get_case_status(case_id)
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")

    return status


@app.delete("/cases/{case_id}")
async def delete_case(case_id: str):
    """
    Delete a case and all associated data.

    Args:
        case_id: Case identifier

    Returns:
        Success message
    """
    validate_case_id(case_id)

    success = storage_manager.delete_case(case_id)

    if not success:
        raise HTTPException(status_code=404, detail="Case not found")

    return {"message": f"Case {case_id} deleted successfully"}


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return ErrorResponse(
        error=exc.detail,
        detail=str(exc),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return ErrorResponse(
        error="Internal server error",
        detail=str(exc),
    )


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
