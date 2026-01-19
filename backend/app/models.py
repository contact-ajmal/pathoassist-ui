"""
Pydantic models for request/response schemas.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


# ============================================================================
# ENUMS
# ============================================================================

class CaseStatus(str, Enum):
    """Case processing status."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    ROI_PENDING = "roi_pending"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class TissueType(str, Enum):
    """Tissue type classification."""
    EPITHELIAL = "epithelial"
    CONNECTIVE = "connective"
    MUSCLE = "muscle"
    NERVOUS = "nervous"
    BLOOD = "blood"
    MIXED = "mixed"
    UNKNOWN = "unknown"


class ConfidenceLevel(str, Enum):
    """Confidence level for findings."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ExportFormat(str, Enum):
    """Export format options."""
    PDF = "pdf"
    JSON = "json"
    TXT = "txt"


# ============================================================================
# WSI MODELS
# ============================================================================

class SlideMetadata(BaseModel):
    """Metadata extracted from WSI file."""
    case_id: str
    filename: str
    file_size: int
    dimensions: tuple[int, int]
    magnification: Optional[float] = None
    resolution: Optional[float] = None  # microns per pixel
    vendor: Optional[str] = None
    objective_power: Optional[int] = None
    level_count: int
    level_dimensions: List[tuple[int, int]]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Clinical Data
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    body_site: Optional[str] = None
    procedure_type: Optional[str] = None
    stain_type: str = "H&E"
    clinical_history: Optional[str] = None


class CaseMetadataUpdate(BaseModel):
    """Request to update case metadata."""
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    body_site: Optional[str] = None
    procedure_type: Optional[str] = None
    stain_type: Optional[str] = None
    clinical_history: Optional[str] = None


class PatchInfo(BaseModel):
    """Information about a single image patch."""
    patch_id: str
    x: int
    y: int
    level: int
    magnification: float
    tissue_ratio: float
    variance_score: float
    is_background: bool
    coordinates: Dict[str, int]  # {x, y, width, height}


class WSIProcessingResult(BaseModel):
    """Result of WSI processing."""
    case_id: str
    total_patches: int
    tissue_patches: int
    background_patches: int
    patches: List[PatchInfo]
    processing_time: float
    thumbnail_path: Optional[str] = None


# ============================================================================
# ROI MODELS
# ============================================================================

class ROISelection(BaseModel):
    """ROI selection request."""
    case_id: str
    selected_patch_ids: List[str]
    auto_select: bool = True
    top_k: int = 50


class ROIResult(BaseModel):
    """ROI selection result."""
    case_id: str
    selected_patches: List[PatchInfo]
    auto_selected_count: int
    manual_override_count: int


# ============================================================================
# INFERENCE MODELS
# ============================================================================

class AnalysisRequest(BaseModel):
    """Request for AI analysis."""
    case_id: str
    patch_ids: List[str]
    clinical_context: Optional[str] = None
    include_confidence: bool = True


class PathologyFinding(BaseModel):
    """Individual pathology finding."""
    category: str
    finding: str
    confidence: ConfidenceLevel
    confidence_score: float = Field(ge=0.0, le=1.0)
    details: Optional[str] = None


class AnalysisResult(BaseModel):
    """Result of AI analysis."""
    case_id: str
    findings: List[PathologyFinding]
    narrative_summary: str
    tissue_type: TissueType
    overall_confidence: float = Field(ge=0.0, le=1.0)
    warnings: List[str] = []
    processing_time: float
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# REPORT MODELS
# ============================================================================

class StructuredReport(BaseModel):
    """Structured pathology report."""
    case_id: str
    patient_context: Optional[str] = None

    # Metadata
    slide_metadata: SlideMetadata
    analysis_date: datetime

    # Findings
    tissue_type: TissueType
    cellularity: Optional[str] = None
    nuclear_atypia: Optional[str] = None
    mitotic_activity: Optional[str] = None
    necrosis: Optional[str] = None
    inflammation: Optional[str] = None
    other_findings: List[PathologyFinding] = []

    # Summary
    narrative_summary: str
    confidence_score: float = Field(ge=0.0, le=1.0)

    # Recommendations
    suggested_tests: List[str] = []
    follow_up_notes: Optional[str] = None

    # Safety
    disclaimer: str
    warnings: List[str] = []


class ReportExportRequest(BaseModel):
    """Request to export report."""
    case_id: str
    format: ExportFormat
    include_images: bool = False


class ReportExportResult(BaseModel):
    """Result of report export."""
    case_id: str
    format: ExportFormat
    file_path: str
    file_size: int
    exported_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# API RESPONSE MODELS
# ============================================================================

class UploadResponse(BaseModel):
    """Response for file upload."""
    case_id: str
    filename: str
    file_size: int
    status: CaseStatus
    message: str


class ProgressUpdate(BaseModel):
    """Progress update for long-running operations."""
    case_id: str
    status: CaseStatus
    progress: float = Field(ge=0.0, le=1.0)
    message: str
    current_step: str


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    detail: Optional[str] = None
    case_id: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    model_loaded: bool
    storage_available: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SystemSettings(BaseModel):
    """Application system settings."""
    model_name: str
    inference_mode: str  # 'cpu', 'gpu', or 'auto'
    remote_inference_url: Optional[str] = None
    remote_api_key: Optional[str] = None
    max_tokens: int
    temperature: float
    report_template: str
    confidence_threshold: float

