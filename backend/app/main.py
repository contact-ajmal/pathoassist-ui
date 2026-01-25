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
from fastapi.responses import FileResponse, JSONResponse

from .config import settings, init_directories
from .models import (
    UploadResponse,
    SlideMetadata,
    CaseMetadataUpdate,
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
    ErrorResponse,
    SystemSettings,
    ChatRequest,
    ChatResponse,
)
from .wsi import WSIProcessor
from .roi import ROISelector
from .inference import InferenceEngine
from .report import ReportGenerator
from .export import ReportExporter
from .storage import StorageManager
from .utils import get_logger, validate_wsi_file, validate_case_id, sanitize_filename
from .utils.metadata_parser import MetadataParser


logger = get_logger(__name__)

# Define base directory and template directory
BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = BASE_DIR / "data" / "templates"
TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)



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


@app.get("/health/detailed")
async def health_check_detailed():
    """Detailed health check for system capability validation."""
    import psutil
    import torch
    
    # System Stats
    mem = psutil.virtual_memory()
    total_ram_gb = round(mem.total / (1024**3), 2)
    available_ram_gb = round(mem.available / (1024**3), 2)
    
    # Accelerator Stats
    accelerator = "CPU"
    vram_gb = 0
    if torch.backends.mps.is_available():
        accelerator = "Apple Silicon (MPS)"
        # MPS doesn't expose VRAM easily, assume unified memory
        vram_gb = total_ram_gb 
    elif torch.cuda.is_available():
        accelerator = f"CUDA ({torch.cuda.get_device_name(0)})"
        vram_gb = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)

    return {
        "status": "healthy",
        "system": {
            "os": "macOS" if settings.DEVICE == "mps" else "Linux/Windows",
            "ram_total_gb": total_ram_gb,
            "ram_available_gb": available_ram_gb,
            "accelerator": accelerator,
            "vram_gb": vram_gb,
            "quantization_support": True # MedGemma 4B fits in 8GB
        },
        "model": {
            "loaded": inference_engine.is_loaded,
            "name": settings.MODEL_NAME,
            "device": inference_engine.device,
            "quantized": settings.USE_QUANTIZATION
        }
    }


# ============================================================================
# SETTINGS
# ============================================================================

@app.get("/settings", response_model=SystemSettings)
async def get_settings():
    """Get current system settings."""
    return SystemSettings(
        model_name=settings.MODEL_NAME,
        inference_mode=settings.DEVICE,
        remote_inference_url=settings.REMOTE_INFERENCE_URL,
        remote_api_key=settings.REMOTE_API_KEY,
        max_tokens=settings.MAX_TOKENS,
        temperature=settings.TEMPERATURE,
        report_template=settings.REPORT_TEMPLATE,
        confidence_threshold=settings.CONFIDENCE_THRESHOLD,
    )


@app.put("/settings", response_model=SystemSettings)
async def update_settings(new_settings: SystemSettings):
    """
    Update system settings.
    Triggers model reload if inference settings change.
    """
    # Track changes requiring reload
    reload_required = (
        new_settings.model_name != settings.MODEL_NAME or
        new_settings.inference_mode != settings.DEVICE or
        new_settings.remote_inference_url != settings.REMOTE_INFERENCE_URL
    )

    # Update global settings
    settings.MODEL_NAME = new_settings.model_name
    settings.DEVICE = new_settings.inference_mode
    settings.REMOTE_INFERENCE_URL = new_settings.remote_inference_url
    settings.REMOTE_API_KEY = new_settings.remote_api_key
    settings.MAX_TOKENS = new_settings.max_tokens
    settings.TEMPERATURE = new_settings.temperature
    settings.REPORT_TEMPLATE = new_settings.report_template
    settings.CONFIDENCE_THRESHOLD = new_settings.confidence_threshold

    if reload_required:
        logger.info("Settings changed detected, reloading model...")
        inference_engine.unload_model()
        success = inference_engine.load_model()
        if not success:
            logger.warning("Failed to reload model with new settings")
    
    return new_settings


# ============================================================================
# TEMPLATES
# ============================================================================

@app.get("/templates", response_model=list[str])
async def list_templates():
    """List available report templates."""
    templates = [f.stem for f in TEMPLATE_DIR.glob("*.txt")]
    return sorted(templates)



@app.post("/templates/upload")
async def upload_template(file: UploadFile = File(...)):
    """Upload a new report template."""
    filename = sanitize_filename(file.filename)
    if not filename.endswith(".txt"):
        filename += ".txt"
        
    file_path = TEMPLATE_DIR / filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"message": "Template uploaded successfully", "filename": file_path.stem}
    except Exception as e:
        logger.error(f"Template upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.delete("/templates/{name}")
async def delete_template(name: str):
    """Delete a custom template."""
    if name.lower() in ["clinical", "research", "brief"]:
        raise HTTPException(status_code=400, detail="Cannot delete default templates")
        
    template_path = TEMPLATE_DIR / f"{name}.txt"
    if template_path.exists():
        template_path.unlink()
        return {"message": "Template deleted"}
        
    raise HTTPException(status_code=404, detail="Template not found")


@app.get("/thumbnail/{case_id}")
async def get_thumbnail(case_id: str):
    """
    Get slide thumbnail for a case.
    
    Args:
        case_id: Case identifier
        
    Returns:
        Thumbnail image file
    """
    # Don't validate case_id existence for thumbnail as it might not have metadata yet
    case_dir = settings.CASES_DIR / case_id
    thumbnail_path = case_dir / "thumbnails" / "thumbnail.png"
    
    if not thumbnail_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    return FileResponse(
        path=str(thumbnail_path),
        media_type="image/png",
        filename=f"{case_id}_thumbnail.png"
    )


# ============================================================================
# FILE UPLOAD
# ============================================================================

@app.post("/upload", response_model=UploadResponse)
async def upload_slide(
    file: UploadFile = File(...),
    context_file: Optional[UploadFile] = File(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """
    Upload a WSI file and optional context file.

    Args:
        file: Uploaded WSI file
        context_file: Optional clinical context file (JSON, TXT, PDF)

    Returns:
        Upload response with case ID
    """
    try:
        # Validate file
        validate_wsi_file(file)

        # Generate case ID
        case_id = f"case_{uuid.uuid4().hex[:12]}"

        # Sanitize filename first
        safe_filename = sanitize_filename(file.filename)

        # Ensure upload directory exists
        logger.info(f"Checking UPLOAD_DIR: {settings.UPLOAD_DIR}")
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        # logger.info(f"Created UPLOAD_DIR: {settings.UPLOAD_DIR.exists()}")

        # Save file temporarily using safe filename
        temp_path = settings.UPLOAD_DIR / f"temp_{case_id}_{safe_filename}"
        
        # DEBUG DIAGNOSTICS
        # ... (removed for cleanliness, can re-add if needed) ...

        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            print(f"CRITICAL WRITE ERROR: {e}")
            raise e

        # Get file size while it exists
        file_size = temp_path.stat().st_size

        # Move to case directory
        dest_path = await storage_manager.save_uploaded_file(case_id, temp_path, safe_filename)

        # --- PROCESS CONTEXT FILE ---
        initial_metadata = {}
        if context_file:
            try:
                # Read context file content
                content = await context_file.read()
                
                # Parse metadata
                initial_metadata = MetadataParser.parse_context_file(content, context_file.filename)
                logger.info(f"Parsed metadata from context file: {initial_metadata}")
                
                # Save context file to case directory
                safe_context_name = sanitize_filename(context_file.filename)
                context_dest = storage_manager.get_case_dir(case_id) / safe_context_name
                try:
                    async with aiofiles.open(context_dest, "wb") as f:
                        await f.write(content)
                except NameError:
                    # Fallback if aiofiles not imported locally (it is used in StorageManager but maybe not main scope?)
                    # check imports, aiofiles is not imported in main.py yet
                    with open(context_dest, "wb") as f:
                        f.write(content)
                        
            except Exception as e:
                logger.warning(f"Failed to process context file: {e}")

        # --- INITIAL METADATA SAVE ---
        # Populate basic metadata from file + parsed context
        wsi_metadata = SlideMetadata(
            case_id=case_id,
            filename=safe_filename,
            file_size=file_size,
            dimensions=(0, 0), # Placeholder, will be updated by processor
            level_count=0,
            level_dimensions=[],
            **initial_metadata # Merge parsed clinical data
        )
        await storage_manager.save_metadata(wsi_metadata)

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
            file_size=file_size,
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


@app.post("/cases/{case_id}/optimize", response_model=dict)
async def optimize_case_storage(case_id: str):
    """
    Optimize storage for a case by deleting the original WSI file.
    Retains only the extracted patches and metadata.
    WARNING: Irreversible operation.
    """
    validate_case_id(case_id)
    
    # Check if case exists
    slide_path = storage_manager.get_slide_path(case_id)
    # If no slide path, it might be already optimized or missing. 
    # Check status to confirm.
    status = await storage_manager.get_case_status(case_id)
    
    if status and status.get("optimized"):
        return {"message": "Case is already optimized", "status": "optimized"}
    
    if not slide_path or not slide_path.exists():
         # If not optimized but no slide, something is wrong, or it was manually deleted
         if not status:
             raise HTTPException(status_code=404, detail="Case not found")
         # Proceed to try optimization (it checks existence internally too) or just mark it?
         # StorageManager.optimize_case handles missing slide gracefully if result exists.
    
    success = await storage_manager.optimize_case(case_id, wsi_processor)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to optimize case storage")
        
    return {"message": "Case storage optimized successfully", "status": "optimized"}

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


@app.put("/metadata/{case_id}", response_model=SlideMetadata)
async def update_metadata(case_id: str, update: CaseMetadataUpdate):
    """
    Update case metadata with clinical information.
    """
    validate_case_id(case_id)
    
    # Load existing metadata
    metadata = await storage_manager.load_metadata(case_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
        
    # Update fields
    update_data = update.model_dump(exclude_unset=True)
    updated_metadata = metadata.model_copy(update=update_data)
    
    # Save back
    await storage_manager.save_metadata(updated_metadata)
    
    return updated_metadata


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


@app.get("/patches/{case_id}/{patch_id}/thumbnail")
async def get_patch_thumbnail(case_id: str, patch_id: str):
    """
    Get thumbnail for a specific patch.
    Generates on-the-fly if not cached.
    """
    # 1. Check cache (Check PNG first as that's what we save, then JPG)
    patch_dir = settings.CASES_DIR / case_id / "patches"
    
    # prioritized list of extensions to check
    for ext in [".png", ".jpg", ".jpeg"]:
        patch_file = patch_dir / f"{patch_id}{ext}"
        if patch_file.exists():
            media_type = "image/png" if ext == ".png" else "image/jpeg"
            return FileResponse(patch_file, media_type=media_type)
        
    # 2. Load context to generate
    result = await storage_manager.load_processing_result(case_id)
    if not result:
        raise HTTPException(status_code=404, detail="Processing result not found")
        
    patch = next((p for p in result.patches if p.patch_id == patch_id), None)
    if not patch:
        raise HTTPException(status_code=404, detail="Patch not found")
        
    # Find slide file
    slide_dir = settings.CASES_DIR / case_id
    # Simple search for common formats
    slide_files = [
        f for f in slide_dir.iterdir() 
        if f.suffix.lower() in ['.svs', '.tiff', '.ndpi', '.mrxs']
    ]
    
    if not slide_files:
        # If optimized, slide is gone, and if patch wasn't in patches dir, we can't generate it.
        # But wait, optimize_case saves ALL patches from result.patches.
        # So if we are here, it means the patch wasn't saved or the request is for a patch NOT in result.patches?
        # result.patches contains ALL generated patches. 
        # So this should theoretically not happen for optimized cases if optimization worked correctly.
        raise HTTPException(status_code=404, detail="Thumbnail not found and original slide is missing (Case optimized?)")
        
    slide_path = slide_files[0]
    
    try:
        from fastapi.concurrency import run_in_threadpool
        
        # Extract region (blocking)
        region = await run_in_threadpool(
            wsi_processor.get_slide_region,
            slide_path=slide_path,
            x=patch.x,
            y=patch.y,
            level=0, # Patches usually extracted at level 0 (highest res) or as specified in patch info?
                     # Processor generates at specific level but patch.level might be 0.
                     # WSIProcessor.process_slide uses magnification to determine level?
                     # Let's assume level 0 for high res patch used for analysis
            size=(settings.PATCH_SIZE, settings.PATCH_SIZE)
        )
        
        # Resize if needed? No, 224x224 is standard.
        
        # Save to cache
        patch_dir.mkdir(parents=True, exist_ok=True)
        await run_in_threadpool(region.save, patch_file, "JPEG")
        
        return FileResponse(patch_file, media_type="image/jpeg")
        
    except Exception as e:
        logger.error(f"Failed to generate patch thumbnail {patch_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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


@app.get("/patches/{case_id}/{patch_id}/heatmap")
async def get_patch_heatmap(case_id: str, patch_id: str):
    """
    Get attention heatmap for a specific patch.
    """
    heatmap_b64 = inference_engine.get_attention_heatmap(case_id, patch_id)
    if not heatmap_b64:
        # Return 404 or a default placeholder since we only have a stub stub
        raise HTTPException(status_code=404, detail="Heatmap generation not supported or failed")
    
    # Return as direct image response? Or JSON with base64?
    # Let's return JSON to handle metadata overlay info if needed
    return {"heatmap": heatmap_b64}


@app.post("/atlas/similar")
async def find_similar_cases(request: dict): # Request body with embedding or patch_id
    """
    Find similar cases from the atlas.
    """
    # Stub implementation for the "Comparative Atlas"
    # In a real app, this would use inference_engine.atlas_store.search()
    
    # Mock response
    import time
    time.sleep(1) # Simulate search lag
    
    return {
        "results": [
            {
                "case_id": "case_mock_1",
                "diagnosis": "Invasive Ductal Carcinoma",
                "similarity": 0.92,
                "thumbnail_url": "/thumbnails/case_mock_1_thumb.png", # Hypothetical
                "description": "Similar nuclear pleomorphism observed in region 2."
            },
            {
                "case_id": "case_mock_2",
                "diagnosis": "High Grade DCIS",
                "similarity": 0.85,
                "thumbnail_url": "/thumbnails/case_mock_2_thumb.png",
                "description": "Comparable cellular density and architectural distortion."
            }
        ]
    }




# ============================================================================
# AI ANALYSIS
# ============================================================================

# ============================================================================
# CHAT
# ============================================================================

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat with the AI assistant.
    """
    validate_case_id(request.case_id)

    if not inference_engine.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="AI model not loaded. Chat unavailable.",
        )

    try:
        # Convert Pydantic models to dicts for engine
        messages_dicts = [m.model_dump() for m in request.messages]
        context_dict = request.context
        
        # --- INJECT RAW CONTEXT FILE ---
        # Ensure chat also sees the full raw context file
        raw_context = await storage_manager.get_raw_context_content(request.case_id)
        if raw_context:
            if not context_dict:
                context_dict = {}
            # We append it to a specific key or merge it. 
            # engine.chat looks for specific keys like "patient", "findings"
            # Let's add a new key "raw_record" and update engine.py to use it
            context_dict["raw_record"] = raw_context

        response_dict = inference_engine.chat(
            case_id=request.case_id,
            messages=messages_dicts,
            context=context_dict
        )
        
        return response_dict
        
    except Exception as e:
        logger.error(f"Chat failed for case {request.case_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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

        # Load metadata for enhanced context
        metadata = await storage_manager.load_metadata(request.case_id)
        
        # Build comprehensive clinical context
        context_parts = []
        
        if metadata:
            # Demographics
            if metadata.patient_age or metadata.patient_gender:
                age = str(metadata.patient_age) if metadata.patient_age else "?"
                gender = metadata.patient_gender or "?"
                context_parts.append(f"PATIENT: {age} years, {gender}")
            
            # Specimen info
            if metadata.body_site:
                context_parts.append(f"BODY SITE: {metadata.body_site}")
            
            if metadata.procedure_type:
                context_parts.append(f"PROCEDURE: {metadata.procedure_type}")
                
            if metadata.stain_type:
                context_parts.append(f"STAIN: {metadata.stain_type}")
                
            # History
            if metadata.clinical_history:
                context_parts.append(f"CLINICAL HISTORY: {metadata.clinical_history}")

        # Add any ephemeral context from request
        if request.clinical_context:
            context_parts.append(f"ADDITIONAL NOTES: {request.clinical_context}")
            
        # --- NEW: Append Full Raw Context File if available ---
        # The user specifically requested all details from the uploaded JSON to be sent
        raw_context = await storage_manager.get_raw_context_content(request.case_id)
        if raw_context:
            context_parts.append(f"\n--- DETAILED CLINICAL RECORD (RAW) ---\n{raw_context}\n-------------------------------------")
            
        full_context = "\n".join(context_parts)

        # Load template content
        template_name = settings.REPORT_TEMPLATE
        if not template_name.endswith(".txt"):
            template_name += ".txt"
            
        template_path = TEMPLATE_DIR / template_name
        template_content = None
        
        if template_path.exists():
            try:
                with open(template_path, "r") as f:
                    template_content = f.read()
            except Exception as e:
                logger.warning(f"Failed to read template {template_name}: {e}")
        else:
            logger.warning(f"Template {template_name} not found. Using default.")

        # Run analysis
        result = inference_engine.analyze_patches(
            case_id=request.case_id,
            patches=selected_patches,
            clinical_context=full_context,
            template_content=template_content,
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
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "detail": str(exc),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
        },
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
