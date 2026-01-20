/**
 * API Client for PathoAssist Backend
 */
import type {
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
  CaseStatusResponse,
  CaseSummary,
  HealthResponse,
} from '@/types/api';

export const API_BASE_URL = 'http://127.0.0.1:8007';

/**
 * Get thumbnail URL for a case (direct URL, not API call)
 */
export function getThumbnailUrl(caseId: string): string {
  return `${API_BASE_URL}/thumbnail/${caseId}`;
}

/**
 * Get patch thumbnail URL
 */
export function getPatchThumbnailUrl(caseId: string, patchId: string): string {
  return `${API_BASE_URL}/patches/${caseId}/${patchId}/thumbnail`;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public detail?: string
  ) {
    super(detail || statusText);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const errorData = await response.json();
      detail = errorData.detail || errorData.error;
    } catch {
      detail = response.statusText;
    }
    throw new ApiError(response.status, response.statusText, detail);
  }
  return response.json();
}

/**
 * Health check
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthResponse>(response);
}

/**
 * Upload a WSI file
 */
export async function uploadSlide(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
}

/**
 * Get slide metadata
 */
export async function getMetadata(caseId: string): Promise<SlideMetadata> {
  const response = await fetch(`${API_BASE_URL}/metadata/${caseId}`);
  return handleResponse<SlideMetadata>(response);
}

/**
 * Update case metadata
 */
export async function updateMetadata(
  caseId: string,
  update: import('../types/api').CaseMetadataUpdate
): Promise<SlideMetadata> {
  const response = await fetch(`${API_BASE_URL}/metadata/${caseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });

  return handleResponse<SlideMetadata>(response);
}

/**
 * Get patches/processing result
 */
export async function getPatches(caseId: string): Promise<WSIProcessingResult> {
  const response = await fetch(`${API_BASE_URL}/patches/${caseId}`);
  return handleResponse<WSIProcessingResult>(response);
}

/**
 * Confirm ROI selection
 */
export async function confirmROISelection(
  selection: ROISelection
): Promise<ROIResult> {
  const response = await fetch(`${API_BASE_URL}/roi/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(selection),
  });

  return handleResponse<ROIResult>(response);
}

/**
 * Run AI analysis
 */
export async function analyzeCase(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<AnalysisResult>(response);
}

/**
 * Get or generate report
 */
export async function getReport(
  caseId: string,
  patientContext?: string
): Promise<StructuredReport> {
  const params = new URLSearchParams();
  if (patientContext) {
    params.append('patient_context', patientContext);
  }

  const url = `${API_BASE_URL}/report/${caseId}${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  return handleResponse<StructuredReport>(response);
}

/**
 * Export report
 */
export async function exportReport(
  request: ReportExportRequest
): Promise<ReportExportResult> {
  const response = await fetch(`${API_BASE_URL}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<ReportExportResult>(response);
}

/**
 * Download exported report
 */
export async function downloadExport(
  caseId: string,
  format: 'pdf' | 'json' | 'txt' = 'pdf'
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/export/${caseId}/download?format=${format}`
  );

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  return response.blob();
}

/**
 * List all cases
 */
export async function listCases(): Promise<CaseSummary[]> {
  const response = await fetch(`${API_BASE_URL}/cases`);
  return handleResponse<CaseSummary[]>(response);
}

/**
 * Get case status
 */
export async function getCaseStatus(caseId: string): Promise<CaseStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/status`);
  return handleResponse<CaseStatusResponse>(response);
}

/**
 * Delete a case
 */
export async function deleteCase(caseId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string }>(response);
}

/**
 * Poll case status until it reaches target status or fails
 */
export async function pollCaseStatus(
  caseId: string,
  targetStatuses: string[],
  intervalMs = 2000,
  maxAttempts = 60
): Promise<CaseStatusResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await getCaseStatus(caseId);

    if (targetStatuses.includes(status.status)) {
      return status;
    }

    if (status.status === 'failed') {
      throw new ApiError(500, 'Processing failed', status.message);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new ApiError(408, 'Timeout', 'Polling timed out');
}


/**
 * Get system settings
 */
export async function getSettings(): Promise<import('../types/api').SystemSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`);
  return handleResponse<import('../types/api').SystemSettings>(response);
}

/**
 * Update system settings
 */
export async function updateSettings(
  settings: import('../types/api').SystemSettings
): Promise<import('../types/api').SystemSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  return handleResponse<import('../types/api').SystemSettings>(response);
}

/**
 * List available report templates
 */
export async function listTemplates(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/templates`);
  return handleResponse<string[]>(response);
}

/**
 * Upload a new report template
 */
export async function uploadTemplate(file: File): Promise<{ message: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/templates/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<{ message: string; filename: string }>(response);
}

export { ApiError };
