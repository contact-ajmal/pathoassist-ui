/**
 * API Types - Matching backend Pydantic models
 */

// Enums
export type CaseStatus =
  | 'uploaded'
  | 'processing'
  | 'roi_pending'
  | 'analyzing'
  | 'completed'
  | 'failed';

export type TissueType =
  | 'epithelial'
  | 'connective'
  | 'muscle'
  | 'nervous'
  | 'blood'
  | 'mixed'
  | 'unknown';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ExportFormat = 'pdf' | 'json' | 'txt';

// WSI Models
export interface SlideMetadata {
  case_id: string;
  filename: string;
  file_size: number;
  dimensions: [number, number];
  magnification: number | null;
  resolution: number | null;
  vendor: string | null;
  objective_power: number | null;
  level_count: number;
  level_dimensions: [number, number][];
  created_at: string;
  // Clinical Data
  patient_age?: number | null;
  patient_gender?: string | null;
  body_site?: string | null;
  procedure_type?: string | null;
  stain_type?: string;
  clinical_history?: string | null;
}

export interface CaseMetadataUpdate {
  patient_age?: number | null;
  patient_gender?: string | null;
  body_site?: string | null;
  procedure_type?: string | null;
  stain_type?: string | null;
  clinical_history?: string | null;
}

export interface PatchInfo {
  patch_id: string;
  x: number;
  y: number;
  level: number;
  magnification: number;
  tissue_ratio: number;
  variance_score: number;
  is_background: boolean;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WSIProcessingResult {
  case_id: string;
  total_patches: number;
  tissue_patches: number;
  background_patches: number;
  patches: PatchInfo[];
  processing_time: number;
  thumbnail_path: string | null;
}

// ROI Models
export interface ROISelection {
  case_id: string;
  selected_patch_ids: string[];
  auto_select?: boolean;
  top_k?: number;
}

export interface ROIResult {
  case_id: string;
  selected_patches: PatchInfo[];
  auto_selected_count: number;
  manual_override_count: number;
}

// Inference Models
export interface AnalysisRequest {
  case_id: string;
  patch_ids: string[];
  clinical_context?: string;
  include_confidence?: boolean;
}

export interface PathologyFinding {
  category: string;
  finding: string;
  confidence: ConfidenceLevel;
  confidence_score: number;
  details: string | null;
}

export interface DifferentialDiagnosis {
  condition: string;
  likelihood: ConfidenceLevel;
  likelihood_score: number;
  reasoning: string;
}

export interface AnalysisResult {
  case_id: string;
  findings: PathologyFinding[];
  differential_diagnosis: DifferentialDiagnosis[];
  narrative_summary: string;
  tissue_type: TissueType;
  overall_confidence: number;
  warnings: string[];
  processing_time: number;
  analyzed_at: string;
}

// Report Models
export interface StructuredReport {
  case_id: string;
  patient_context: string | null;
  slide_metadata: SlideMetadata;
  analysis_date: string;
  tissue_type: TissueType;
  cellularity: string | null;
  nuclear_atypia: string | null;
  mitotic_activity: string | null;
  necrosis: string | null;
  inflammation: string | null;
  other_findings: PathologyFinding[];
  narrative_summary: string;
  confidence_score: number;
  suggested_tests: string[];
  follow_up_notes: string | null;
  disclaimer: string;
  warnings: string[];
}

export interface ReportExportRequest {
  case_id: string;
  format: ExportFormat;
  include_images?: boolean;
}

export interface ReportExportResult {
  case_id: string;
  format: ExportFormat;
  file_path: string;
  file_size: number;
  exported_at: string;
}

// API Response Models
export interface UploadResponse {
  case_id: string;
  filename: string;
  file_size: number;
  status: CaseStatus;
  message: string;
}

export interface ProgressUpdate {
  case_id: string;
  status: CaseStatus;
  progress: number;
  message: string;
  current_step: string;
}

export interface CaseStatusResponse {
  case_id: string;
  status: CaseStatus;
  message: string;
  updated_at: string;
}

export interface CaseSummary {
  case_id: string;
  filename: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  model_loaded: boolean;
  storage_available: boolean;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  detail: string | null;
  case_id: string | null;
}

export interface SystemSettings {
  model_name: string;
  inference_mode: string;
  remote_inference_url?: string | null;
  remote_api_key?: string | null;
  max_tokens: number;
  temperature: number;
  report_template: string;
  confidence_threshold: number;
}
