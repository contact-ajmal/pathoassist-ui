import { ZoomIn, ZoomOut, Move, RotateCcw, Layers, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

interface ViewerScreenProps {
  onProceed: () => void;
}

export function ViewerScreen({ onProceed }: ViewerScreenProps) {
  const [zoom, setZoom] = useState([25]);

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
              40x
            </div>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-muted/30">
          {/* Slide Placeholder */}
          <div className="absolute inset-4 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-50 rounded-lg border shadow-inner flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-48 mx-auto mb-4 bg-gradient-to-br from-pink-200/50 via-purple-100/50 to-pink-100/50 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Whole Slide Image Viewer</p>
                  <p className="text-xs mt-1">specimen_lung_biopsy_001.svs</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Pan and zoom to explore the tissue sample
              </p>
            </div>
          </div>

          {/* Minimap */}
          <div className="slide-minimap">
            <div className="w-full h-full bg-gradient-to-br from-pink-100/50 to-purple-50/50 relative">
              <div className="absolute top-2 left-2 w-8 h-6 border-2 border-primary rounded-sm" />
            </div>
          </div>

          {/* Coordinates */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur rounded border text-xs font-mono">
            X: 24,512 | Y: 16,384
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-72 border-l bg-card shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Slide Information</h3>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
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
                  <span className="font-medium">78%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-primary rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="text-lg font-semibold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Tissue Regions</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="text-lg font-semibold text-foreground">847</p>
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
                <span className="text-muted-foreground">Focus Score</span>
                <span className="font-medium text-success">Excellent</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Staining Quality</span>
                <span className="font-medium text-success">Good</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Artifacts</span>
                <span className="font-medium text-warning">Minimal</span>
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
                <span className="text-muted-foreground">Format</span>
                <span className="font-mono text-xs">Aperio SVS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Levels</span>
                <span>4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base MPP</span>
                <span className="font-mono text-xs">0.2500</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action */}
        <div className="p-4 border-t">
          <Button className="w-full" onClick={onProceed}>
            Proceed to ROI Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
