import { useState } from 'react';
import { Upload, FileImage, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UploadScreenProps {
  onProceed: () => void;
}

export function UploadScreen({ onProceed }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [clinicalContext, setClinicalContext] = useState('');

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
    // Simulate file upload
    setFile({ name: 'specimen_lung_biopsy_001.svs', size: '2.4 GB' });
  };

  const handleBrowse = () => {
    // Simulate file selection
    setFile({ name: 'specimen_lung_biopsy_001.svs', size: '2.4 GB' });
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

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'upload-zone cursor-pointer',
            isDragging && 'upload-zone-active'
          )}
          onClick={handleBrowse}
        >
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
            <Button variant="outline" size="sm">
              <FileImage className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 bg-muted rounded font-mono">.SVS</span>
              <span className="px-2 py-0.5 bg-muted rounded font-mono">.TIFF</span>
              <span className="px-2 py-0.5 bg-muted rounded font-mono">.NDPI</span>
              <span className="px-2 py-0.5 bg-muted rounded font-mono">.MRXS</span>
            </div>
          </div>
        </div>

        {/* Metadata Preview */}
        {file && (
          <Card className="animate-slide-in-right">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileImage className="w-4 h-4 text-primary" />
                Slide Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="report-card-label">File Name</label>
                  <p className="text-sm font-medium mt-0.5">{file.name}</p>
                </div>
                <div>
                  <label className="report-card-label">File Size</label>
                  <p className="text-sm font-medium mt-0.5">{file.size}</p>
                </div>
                <div>
                  <label className="report-card-label">Magnification</label>
                  <p className="text-sm font-medium mt-0.5">40x</p>
                </div>
                <div>
                  <label className="report-card-label">Resolution</label>
                  <p className="text-sm font-medium mt-0.5">0.25 μm/pixel</p>
                </div>
                <div>
                  <label className="report-card-label">Stain Type</label>
                  <p className="text-sm font-medium mt-0.5">H&E (Hematoxylin & Eosin)</p>
                </div>
                <div>
                  <label className="report-card-label">Dimensions</label>
                  <p className="text-sm font-medium mt-0.5">98,304 × 65,536 px</p>
                </div>
              </div>
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
            />
            <p className="text-xs text-muted-foreground mt-2">
              Providing clinical context helps improve AI analysis accuracy
            </p>
          </CardContent>
        </Card>

        {/* Action */}
        <div className="flex justify-end pt-4">
          <Button 
            size="lg" 
            onClick={onProceed}
            disabled={!file}
            className="px-8"
          >
            Load Slide
          </Button>
        </div>
      </div>
    </div>
  );
}
