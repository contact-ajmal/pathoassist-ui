import { useState, useRef } from 'react';
import { Upload, FileImage, Info, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useCase } from '@/contexts/CaseContext';
import { uploadSlide, getCaseStatus, getMetadata, getPatches, updateMetadata } from '@/lib/api';
import type { CaseStatus } from '@/types/api';

interface UploadScreenProps {
  onProceed: () => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

const SUPPORTED_FORMATS = ['.svs', '.tif', '.tiff', '.ndpi', '.mrxs'];

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export function UploadScreen({ onProceed }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contextFile, setContextFile] = useState<File | null>(null);

  // Clinical Metadata State
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('');
  const [bodySite, setBodySite] = useState('');
  const [procedure, setProcedure] = useState('');
  const [stainType, setStainType] = useState('H&E');
  const [clinicalContext, setClinicalContext] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [priorTreatments, setPriorTreatments] = useState('');

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCaseId, setFilename, setStatus, setMetadata, setProcessingResult } = useCase();

  const isFormValid = () => {
    return (
      selectedFile !== null &&
      patientAge.trim() !== '' &&
      patientGender !== '' &&
      bodySite.trim() !== '' &&
      procedure !== '' &&
      clinicalContext.trim() !== ''
    );
  };

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_FORMATS.includes(ext)) {
      setError(`Unsupported file format. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    if (validateFile(file)) {
      setSelectedFile(file);
      setUploadState('idle');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const pollForProcessing = async (caseId: string) => {
    const targetStatuses: CaseStatus[] = ['roi_pending', 'completed'];
    let attempts = 0;
    const maxAttempts = 120; // 4 minutes max

    while (attempts < maxAttempts) {
      try {
        const status = await getCaseStatus(caseId);
        setStatusMessage(status.message);

        // Update progress based on status
        if (status.status === 'processing') {
          setProgress(Math.min(30 + attempts, 80));
        }

        if (targetStatuses.includes(status.status)) {
          setProgress(100);
          setStatus(status.status);
          return status;
        }

        if (status.status === 'failed') {
          throw new Error(status.message);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (err) {
        throw err;
      }
    }

    throw new Error('Processing timed out');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a WSI slide to upload.");
      return;
    }

    if (!isFormValid()) {
      setError("Please fill in all mandatory Clinical Case Information fields (marked with *) before proceeding.");
      return;
    }

    setError(null);
    setUploadState('uploading');
    setProgress(0);
    setStatusMessage('Uploading files...');

    try {
      // Upload file with context
      setProgress(10);
      const uploadResponse = await uploadSlide(selectedFile, contextFile || undefined);

      setCaseId(uploadResponse.case_id);
      setFilename(uploadResponse.filename);
      setStatus(uploadResponse.status);

      // Submit Metadata immediately after upload
      try {
        await updateMetadata(uploadResponse.case_id, {
          patient_age: patientAge ? parseInt(patientAge) : null,
          patient_gender: patientGender || null,
          body_site: bodySite || null,
          procedure_type: procedure || null,
          stain_type: stainType || null,
          clinical_history: clinicalContext || null,
          provisional_diagnosis: provisionalDiagnosis || null,
          prior_treatments: priorTreatments || null
        });
      } catch (metaErr) {
        console.warn("Failed to update metadata, proceeding with basic info", metaErr);
      }

      setProgress(30);
      setUploadState('processing');
      setStatusMessage('Processing slide...');

      // Poll for processing completion
      await pollForProcessing(uploadResponse.case_id);

      // Fetch metadata and patches
      setStatusMessage('Loading metadata...');
      const [metadata, patches] = await Promise.all([
        getMetadata(uploadResponse.case_id),
        getPatches(uploadResponse.case_id),
      ]);

      setMetadata(metadata);
      setProcessingResult(patches);

      setUploadState('ready');
      setStatusMessage('Slide ready for viewing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadState('error');
      setStatusMessage('');
    }
  };

  const handleProceed = () => {
    onProceed();
  };

  return (
    <div className="h-full p-6 overflow-auto animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Upload Slide</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a whole slide image and provide clinical context for AI-assisted analysis
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'upload-zone cursor-pointer',
            isDragging && 'upload-zone-active',
            uploadState !== 'idle' && uploadState !== 'error' && 'pointer-events-none opacity-50'
          )}
          onClick={handleBrowse}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_FORMATS.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Drag and drop your slide here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              <FileImage className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {SUPPORTED_FORMATS.map((fmt) => (
                <span key={fmt} className="px-2 py-0.5 bg-muted rounded font-mono uppercase">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <Card className="animate-slide-in-right">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileImage className="w-4 h-4 text-primary" />
                Selected File
                {uploadState === 'ready' && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="report-card-label">File Name</label>
                  <p className="text-sm font-medium mt-0.5 truncate">{selectedFile.name}</p>
                </div>
                <div>
                  <label className="report-card-label">File Size</label>
                  <p className="text-sm font-medium mt-0.5">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>

              {/* Upload Progress */}
              {(uploadState === 'uploading' || uploadState === 'processing') && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {statusMessage}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Success Status */}
              {uploadState === 'ready' && (
                <div className="mt-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {statusMessage}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Case Information Form */}
        <Card className="border-teal-100">
          <CardHeader className="pb-3 bg-teal-50/50">
            <CardTitle className="text-base flex items-center gap-2 text-teal-900">
              <Info className="w-4 h-4" />
              Required Clinical Context
              <span className="text-xs font-normal text-teal-600">(Mandatory for AI accuracy)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Body Site */}
              <div className="space-y-2">
                <Label htmlFor="bodySite">Body Site <span className="text-red-500">*</span></Label>
                <Input
                  id="bodySite"
                  placeholder="e.g. Lung, Breast"
                  value={bodySite}
                  onChange={(e) => setBodySite(e.target.value)}
                  disabled={uploadState === 'uploading' || uploadState === 'processing'}
                  className={!bodySite && uploadState === 'error' ? 'border-red-500' : ''}
                />
              </div>

              {/* Procedure */}
              <div className="space-y-2">
                <Label htmlFor="procedure">Procedure <span className="text-red-500">*</span></Label>
                <Select value={procedure} onValueChange={setProcedure} disabled={uploadState === 'uploading' || uploadState === 'processing'}>
                  <SelectTrigger id="procedure" className={!procedure && uploadState === 'error' ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Biopsy">Biopsy</SelectItem>
                    <SelectItem value="Resection">Resection</SelectItem>
                    <SelectItem value="Cytology">Cytology</SelectItem>
                    <SelectItem value="Autopsy">Autopsy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Patient Age <span className="text-red-500">*</span></Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Years"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  disabled={uploadState === 'uploading' || uploadState === 'processing'}
                  className={!patientAge && uploadState === 'error' ? 'border-red-500' : ''}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                <Select value={patientGender} onValueChange={setPatientGender} disabled={uploadState === 'uploading' || uploadState === 'processing'}>
                  <SelectTrigger id="gender" className={!patientGender && uploadState === 'error' ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stain Type */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="stain">Stain Type</Label>
                <Select value={stainType} onValueChange={setStainType} disabled={uploadState === 'uploading' || uploadState === 'processing'}>
                  <SelectTrigger id="stain">
                    <SelectValue placeholder="Select stain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H&E">Hematoxylin & Eosin (H&E)</SelectItem>
                    <SelectItem value="IHC">Immunohistochemistry (IHC)</SelectItem>
                    <SelectItem value="PAS">PAS</SelectItem>
                    <SelectItem value="Silver">Silver Stain</SelectItem>
                    <SelectItem value="Giemsa">Giemsa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Context: Provisional Diagnosis & Treatments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provisionalDiagnosis">Provisional / Suspected Diagnosis</Label>
                <Input
                  id="provisionalDiagnosis"
                  placeholder="e.g. Suspected Adenocarcinoma"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  disabled={uploadState === 'uploading' || uploadState === 'processing'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priorTreatments">Prior / Neoadjuvant Treatments</Label>
                <Input
                  id="priorTreatments"
                  placeholder="e.g. Chemotherapy, Radiation"
                  value={priorTreatments}
                  onChange={(e) => setPriorTreatments(e.target.value)}
                  disabled={uploadState === 'uploading' || uploadState === 'processing'}
                />
              </div>
            </div>

            {/* Clinical History */}
            <div className="space-y-2">
              <Label htmlFor="history">Clinical History / Notes <span className="text-red-500">*</span></Label>
              <Textarea
                id="history"
                value={clinicalContext}
                onChange={(e) => setClinicalContext(e.target.value)}
                placeholder="Required: Provide symptoms, relevant history, leading diagnosis..."
                className={cn('min-h-[80px] resize-none', !clinicalContext && uploadState === 'error' && 'border-red-500')}
                disabled={uploadState === 'uploading' || uploadState === 'processing'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinical Context File Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileImage className="w-4 h-4 text-primary" />
              Additional Context File (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".json,.txt,.pdf"
                className="hidden"
                id="context-file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setContextFile(e.target.files[0]);
                  }
                }}
                disabled={uploadState === 'uploading' || uploadState === 'processing'}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('context-file')?.click()}
                disabled={uploadState === 'uploading' || uploadState === 'processing'}
              >
                {contextFile ? 'Change File' : 'Select File'}
              </Button>
              {contextFile && (
                <span className="text-sm font-medium">{contextFile.name}</span>
              )}
              {!contextFile && (
                <span className="text-sm text-muted-foreground">e.g. clinical_report.json</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 pb-8">
          {uploadState === 'idle' || uploadState === 'error' ? (
            <Button
              size="lg"
              onClick={handleUpload}
              disabled={!selectedFile || !isFormValid()}
              className="px-8"
              title={!isFormValid() ? "Please fill in all mandatory clinical context fields" : ""}
            >
              {uploadState === 'error' ? 'Retry Upload' : 'Upload Slide & Start'}
            </Button>
          ) : uploadState === 'ready' ? (
            <Button
              size="lg"
              onClick={handleProceed}
              className="px-8"
            >
              Load Slide
            </Button>
          ) : (
            <Button size="lg" disabled className="px-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
        </div>
      </div>
    </div >
  );
}

