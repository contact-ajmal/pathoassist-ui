export type WorkflowStep = 
  | 'upload'
  | 'viewer'
  | 'roi'
  | 'analysis'
  | 'review'
  | 'export';

export interface WorkflowStepInfo {
  id: WorkflowStep;
  label: string;
  icon: string;
  number: number;
}

export const WORKFLOW_STEPS: WorkflowStepInfo[] = [
  { id: 'upload', label: 'Upload Slide', icon: 'Upload', number: 1 },
  { id: 'viewer', label: 'Slide Viewer', icon: 'Microscope', number: 2 },
  { id: 'roi', label: 'ROI Selection', icon: 'Grid3X3', number: 3 },
  { id: 'analysis', label: 'AI Analysis', icon: 'Brain', number: 4 },
  { id: 'review', label: 'Report Review', icon: 'FileText', number: 5 },
  { id: 'export', label: 'Export & Archive', icon: 'Archive', number: 6 },
];

export interface SlideMetadata {
  fileName: string;
  magnification: string;
  resolution: string;
  stainType: string;
  fileSize: string;
}

export interface ROIPatch {
  id: string;
  magnification: string;
  coordinates: { x: number; y: number };
  selected: boolean;
  type: 'tumor' | 'inflammatory' | 'normal';
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
}

export interface ReportField {
  id: string;
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  editable: boolean;
}

export interface ArchivedCase {
  id: string;
  date: string;
  tissueType: string;
  confidenceScore: number;
  exportStatus: 'exported' | 'pending' | 'not_exported';
}
