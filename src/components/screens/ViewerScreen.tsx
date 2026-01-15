import { ZoomIn, ZoomOut, Move, RotateCcw, Layers, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { useCase } from '@/contexts/CaseContext';
import { getThumbnailUrl } from '@/lib/api';

interface ViewerScreenProps {
  onProceed: () => void;
}

function formatDimensions(dims: [number, number] | undefined): string {
  if (!dims) return 'N/A';
  return `${dims[0].toLocaleString()} x ${dims[1].toLocaleString()} px`;
}

function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return 'N/A';
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export function ViewerScreen({ onProceed }: ViewerScreenProps) {
  const [zoom, setZoom] = useState([25]);
  const { caseId, metadata, processingResult, filename } = useCase();

  const tissuePatches = processingResult?.tissue_patches ?? 0;
  const totalPatches = processingResult?.total_patches ?? 0;
  const tissueCoverage = totalPatches > 0
    ? Math.round((tissuePatches / totalPatches) * 100)
    : 0;

  const thumbnailUrl = caseId ? getThumbnailUrl(caseId) : null;

  return (
    <div className="h-full flex animate-fade-in">
      {/* Main Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b bg-card px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="sm">
              <Move className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="sm">
              <Layers className="w-4 h-4 mr-1.5" />
              Annotations
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Zoom:</span>
              <div className="w-32">
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
              <span className="font-mono text-xs w-12">{zoom[0]}%</span>
            </div>
            <div className="px-2 py-1 bg-muted rounded text-xs font-mono">
              {metadata?.magnification ? `${metadata.magnification}x` : '40x'}
            </div>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-muted/30 overflow-hidden">
          {/* Slide Image */}
          <div className="absolute inset-4 rounded-lg border shadow-inner flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Slide Thumbnail"
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom[0] / 25})` }}
              />
            ) : (
              <div className="text-center">
                <div className="w-64 h-48 mx-auto mb-4 bg-gradient-to-br from-pink-200/50 via-purple-100/50 to-pink-100/50 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Whole Slide Image Viewer</p>
                    <p className="text-xs mt-1 truncate max-w-[200px]">
                      {filename || metadata?.filename || 'No slide loaded'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pan and zoom to explore the tissue sample
                </p>
              </div>
            )}
          </div>

          {/* Minimap */}
          <div className="slide-minimap">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Minimap"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-100/50 to-purple-50/50 relative">
                <div className="absolute top-2 left-2 w-8 h-6 border-2 border-primary rounded-sm" />
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur rounded border text-xs font-mono">
            X: 0 | Y: 0
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-72 border-l bg-card shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Slide Information</h3>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {!processingResult && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Slide data is loading or unavailable.
              </AlertDescription>
            </Alert>
          )}

          {/* Tissue Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Tissue Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tissue Coverage</span>
                  <span className="font-medium">{tissueCoverage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${tissueCoverage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="text-lg font-semibold text-foreground">
                    {tissuePatches}
                  </p>
                  <p className="text-xs text-muted-foreground">Tissue Patches</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="text-lg font-semibold text-foreground">
                    {totalPatches}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Patches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="font-medium">
                  {processingResult?.processing_time
                    ? `${processingResult.processing_time.toFixed(2)}s`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Background Patches</span>
                <span className="font-medium">
                  {processingResult?.background_patches ?? 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Slide Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Slide Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-mono text-xs">
                  {formatDimensions(metadata?.dimensions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-mono text-xs">
                  {formatFileSize(metadata?.file_size)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Levels</span>
                <span>{metadata?.level_count ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resolution</span>
                <span className="font-mono text-xs">
                  {metadata?.resolution
                    ? `${metadata.resolution.toFixed(4)} μm/px`
                    : 'N/A'}
                </span>
              </div>
              {metadata?.vendor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor</span>
                  <span className="font-mono text-xs">{metadata.vendor}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action */}
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={onProceed}
            disabled={!processingResult}
          >
            Proceed to ROI Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
