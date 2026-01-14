import { useState, useRef } from 'react';
import { Upload, FileImage, Info, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useCase } from '@/contexts/CaseContext';
import { uploadSlide, getCaseStatus, getMetadata, getPatches } from '@/lib/api';
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
  const [clinicalContext, setClinicalContext] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCaseId, setFilename, setStatus, setMetadata, setProcessingResult } = useCase();

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
    if (!selectedFile) return;

    setError(null);
    setUploadState('uploading');
    setProgress(0);
    setStatusMessage('Uploading file...');

    try {
      // Upload file
      setProgress(10);
      const uploadResponse = await uploadSlide(selectedFile);

      setCaseId(uploadResponse.case_id);
      setFilename(uploadResponse.filename);
      setStatus(uploadResponse.status);

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
    // Store clinical context for later use in analysis
    localStorage.setItem('clinicalContext', clinicalContext);
    onProceed();
  };

  return (
    <div className="h-full p-6 overflow-auto animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Upload Slide</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a whole slide image for AI-assisted analysis
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

        {/* Clinical Context */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Clinical Context
              <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={clinicalContext}
              onChange={(e) => setClinicalContext(e.target.value)}
              placeholder="e.g., 55-year-old male, lung biopsy, chronic cough, 30 pack-year smoking history"
              className="min-h-[100px] resize-none"
              disabled={uploadState === 'uploading' || uploadState === 'processing'}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Providing clinical context helps improve AI analysis accuracy
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {uploadState === 'idle' || uploadState === 'error' ? (
            <Button
              size="lg"
              onClick={handleUpload}
              disabled={!selectedFile}
              className="px-8"
            >
              {uploadState === 'error' ? 'Retry Upload' : 'Upload Slide'}
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
    </div>
  );
}
