import { ZoomIn, ZoomOut, Move, RotateCcw, Layers, Info, AlertCircle, Maximize2, Undo2, Redo2, MousePointer2, Square, Circle, Ruler, ArrowUpRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useRef, useEffect } from 'react';
import { useCase } from '@/contexts/CaseContext';
import { getThumbnailUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ViewerScreenProps {
  onProceed: () => void;
}

// --- Types ---

type ToolType = 'pan' | 'point' | 'rect' | 'circle' | 'line' | 'arrow' | 'freehand';

interface Annotation {
  id: string;
  type: Exclude<ToolType, 'pan'>;
  points: { x: number, y: number }[]; // Percentages 0-100 relative to image
  properties?: {
    color: string;
    strokeWidth: number;
    fill?: string;
    label?: string;
  };
}

// --- Components ---

// --- Renderer Component ---

// --- Renderer Component ---

interface RendererProps {
  annotation: Annotation;
  zoom: number;
  isPreview?: boolean;
  resolution?: number; // microns per pixel
  imageDimensions?: [number, number]; // [width, height]
}

function AnnotationRenderer({ annotation, zoom, isPreview = false, resolution, imageDimensions }: RendererProps) {
  const { type, points, properties } = annotation;
  if (!points || points.length === 0) return null;

  const color = properties?.color || '#ef4444';
  const baseStrokeWidth = (0.5 / zoom) * 25;
  const strokeWidth = baseStrokeWidth * (properties?.strokeWidth || 1);

  if (type === 'point') {
    const p = points[0];
    const r = (5 / zoom) * 25;
    return (
      <g>
        <circle cx={p.x} cy={p.y} r={r} fill={color} fillOpacity={0.5} stroke={color} strokeWidth={strokeWidth / 2} />
        <line x1={p.x - r} y1={p.y} x2={p.x + r} y2={p.y} stroke={color} strokeWidth={strokeWidth / 2} />
        <line x1={p.x} y1={p.y - r} x2={p.x} y2={p.y + r} stroke={color} strokeWidth={strokeWidth / 2} />
      </g>
    );
  }

  if (type === 'rect') {
    const start = points[0];
    const end = points[points.length - 1];
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    return (
      <rect
        x={x} y={y} width={width} height={height}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={isPreview ? "1 1" : undefined}
      />
    );
  }

  if (type === 'circle') {
    const start = points[0];
    const end = points[points.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const r = Math.sqrt(dx * dx + dy * dy);

    return (
      <circle
        cx={start.x} cy={start.y} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={isPreview ? "1 1" : undefined}
      />
    );
  }

  if (type === 'line') {
    const start = points[0];
    const end = points[points.length - 1];

    // Calculate distance
    let label = '';
    if (imageDimensions && resolution) {
      const dxPx = (end.x - start.x) / 100 * imageDimensions[0];
      const dyPx = (end.y - start.y) / 100 * imageDimensions[1];
      const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
      const distUm = distPx * resolution;

      if (distUm > 1000) {
        label = `${(distUm / 1000).toFixed(2)} mm`;
      } else {
        label = `${Math.round(distUm)} μm`;
      }
    }

    return (
      <g>
        <line
          x1={start.x} y1={start.y} x2={end.x} y2={end.y}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {label && (
          <text
            x={(start.x + end.x) / 2}
            y={(start.y + end.y) / 2}
            dy={-5}
            fill={color}
            fontSize={(1.2 / zoom) * 100} // Scale text 
            fontWeight="bold"
            textAnchor="middle"
            style={{ textShadow: '0px 0px 2px black' }}
          >
            {label}
          </text>
        )}
      </g>
    );
  }

  if (type === 'arrow') {
    const start = points[0];
    const end = points[points.length - 1];
    return (
      <line
        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
        stroke={color}
        strokeWidth={strokeWidth}
        markerEnd="url(#arrowhead)"
      />
    );
  }

  if (type === 'freehand') {
    if (points.length < 2) return null;
    const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    return (
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  return null;
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
  const { caseId, metadata, processingResult, filename } = useCase();

  // Viewer State
  const [zoom, setZoom] = useState([1]);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Interaction State
  const [activeTool, setActiveTool] = useState<ToolType>('pan');
  const [strokeWidth, setStrokeWidth] = useState([2]); // Default stroke scale factor
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Screen coordinates

  // Drawing State
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const [interactionStart, setInteractionStart] = useState<{ x: number, y: number } | null>(null); // Image coordinates %

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const tissuePatches = processingResult?.tissue_patches ?? 0;
  const totalPatches = processingResult?.total_patches ?? 0;
  const tissueCoverage = totalPatches > 0
    ? Math.round((tissuePatches / totalPatches) * 100)
    : 0;

  const thumbnailUrl = caseId ? getThumbnailUrl(caseId, true) : null;

  // --- Actions ---

  const handleZoomIn = () => setZoom(prev => [Math.min(prev[0] + 1, 40)]);
  const handleZoomOut = () => setZoom(prev => [Math.max(prev[0] - 1, 1)]);

  const handleReset = () => {
    setZoom([1]);
    setPan({ x: 0, y: 0 });
    setActiveTool('pan');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setAnnotations(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setAnnotations([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setAnnotations(history[historyIndex + 1]);
    }
  };

  // History helper
  const addToHistory = (newAnnotations: Annotation[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // --- Coordinate Helpers ---

  const getRelativeCoords = (e: React.MouseEvent) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  // --- Mouse Interactions ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // Start drawing
    const coords = getRelativeCoords(e);
    if (!coords) return;

    setInteractionStart(coords);

    if (activeTool === 'point') {
      // Points are instant
      const newAnn: Annotation = {
        id: Date.now().toString(),
        type: 'point',
        points: [coords],
        properties: {
          color: '#ef4444',
          strokeWidth: strokeWidth[0]
        }
      };
      const next = [...annotations, newAnn];
      setAnnotations(next);
      addToHistory(next);
    } else {
      // Start shape
      setCurrentAnnotation({
        id: Date.now().toString(),
        type: activeTool,
        points: [coords], // Start point
        properties: {
          color: '#ef4444',
          strokeWidth: strokeWidth[0]
        }
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeTool === 'pan' && isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    if (currentAnnotation && interactionStart) {
      const coords = getRelativeCoords(e);
      if (!coords) return;

      if (activeTool === 'freehand') {
        setCurrentAnnotation(prev => ({
          ...prev,
          points: [...(prev?.points || []), coords]
        }));
      } else {
        // For rect, circle, line - we just update dragging end point
        // We store Start and Current as the two points
        setCurrentAnnotation(prev => ({
          ...prev,
          points: [interactionStart, coords]
        }));
      }
    }
  };

  const handleMouseUp = () => {
    if (activeTool === 'pan') {
      setIsDragging(false);
    } else if (currentAnnotation) {
      // Finalize annotation
      const completedAnn = currentAnnotation as Annotation; // Helper: validate strictly if needed
      const next = [...annotations, completedAnn];
      setAnnotations(next);
      addToHistory(next);
      setCurrentAnnotation(null);
      setInteractionStart(null);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    // Handled in MouseDown/Up now
  };

  // Prevent drag when annotating
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);


  return (
    <div className="h-full flex animate-fade-in">
      {/* Main Viewer */}
      <div className="flex-1 flex flex-col" ref={containerRef}>
        {/* Toolbar */}
        <div className="h-12 border-b bg-card px-4 flex items-center justify-between shrink-0 z-10 w-full">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant={activeTool === 'pan' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTool('pan')}
              title="Pan Tool"
            >
              <Move className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Annotation Tools */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border">
              <Button
                variant={activeTool === 'point' ? "secondary" : "ghost"}
                size="icon"
                className="w-6 h-6"
                onClick={() => setActiveTool('point')}
                title="Point"
              >
                <MousePointer2 className="w-3 h-3" />
              </Button>
              <Button
                variant={activeTool === 'rect' ? "secondary" : "ghost"}
                size="icon"
                className="w-6 h-6"
                onClick={() => setActiveTool('rect')}
                title="Rectangle"
              >
                <Square className="w-3 h-3" />
              </Button>
              <Button
                variant={activeTool === 'circle' ? "secondary" : "ghost"}
                size="icon"
                className="w-6 h-6"
                onClick={() => setActiveTool('circle')}
                title="Circle"
              >
                <Circle className="w-3 h-3" />
              </Button>
              <Button
                variant={activeTool === 'line' ? "secondary" : "ghost"}
                size="icon"
                className="w-6 h-6"
                onClick={() => setActiveTool('line')}
                title="Line / Measure"
              >
                <Ruler className="w-3 h-3" />
              </Button>
              <Button
                variant={activeTool === 'arrow' ? "secondary" : "ghost"}
                size="icon"
                className="w-6 h-6"
                onClick={() => setActiveTool('arrow')}
                title="Arrow"
              >
                <ArrowUpRight className="w-3 h-3" />
              </Button>
              <Button
                variant={activeTool === 'freehand' ? "secondary" : "ghost"}
                size="icon"
                className="w-6 h-6"
                onClick={() => setActiveTool('freehand')}
                title="Freehand"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </div>

            {/* Stroke Width Control - Only show when drawing tools are active */}
            {activeTool !== 'pan' && (
              <div className="flex items-center gap-1 mx-2" title="Stroke Width">
                <div className="w-1 h-1 rounded-full bg-foreground/50" />
                <div className="w-16">
                  <Slider
                    value={strokeWidth}
                    onValueChange={setStrokeWidth}
                    min={0.5}
                    max={10}
                    step={0.1}
                  />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-foreground/50" />
              </div>
            )}

            <div className="w-px h-6 bg-border mx-1" />

            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex < 0} title="Undo">
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo">
              <Redo2 className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button variant="ghost" size="sm" onClick={handleReset} title="Reset View">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} title="Fullscreen">
              <Maximize2 className="w-4 h-4" />
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
                  max={40}
                  step={1}
                />
              </div>
              <span className="font-mono text-xs w-12">{zoom[0]}x</span>
            </div>
            {metadata?.magnification && (
              <div className="px-2 py-1 bg-muted rounded text-xs font-mono" title="Native Magnification">
                Base: {metadata.magnification}x
              </div>
            )}
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-muted/30 overflow-hidden cursor-crosshair">
          {/* Slide Image Container */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center overflow-hidden",
              activeTool === 'pan' ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {thumbnailUrl ? (
              <div
                className="relative transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom[0]})`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  ref={imageRef}
                  src={thumbnailUrl}
                  alt="Slide HD Thumbnail"
                  className="max-w-[80%] max-h-[80vh] object-contain shadow-2xl rounded-sm"
                  draggable={false}
                  onClick={handleImageClick}
                  style={{ imageRendering: zoom[0] >= 10 ? 'pixelated' : 'auto' }}
                />

                {/* SVG Overlay for Annotations */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                    </marker>
                  </defs>

                  {/* Render Saved Annotations */}
                  {annotations.map(ann => (
                    <AnnotationRenderer
                      key={ann.id}
                      annotation={ann}
                      zoom={zoom[0] * 25}
                      resolution={metadata?.resolution}
                      imageDimensions={metadata?.dimensions}
                    />
                  ))}

                  {/* Render Current Drawing */}
                  {currentAnnotation && currentAnnotation.points && currentAnnotation.points.length > 0 && (
                    <AnnotationRenderer
                      annotation={currentAnnotation as Annotation}
                      zoom={zoom[0] * 25}
                      isPreview
                      resolution={metadata?.resolution}
                      imageDimensions={metadata?.dimensions}
                    />
                  )}
                </svg>
              </div>
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
              <div className="relative w-full h-full">
                <img
                  src={thumbnailUrl}
                  alt="Minimap"
                  className="w-full h-full object-contain opacity-50"
                />
                {/* Viewport Indicator (Approximate) */}
                <div
                  className="absolute border-2 border-primary bg-primary/10"
                  style={{
                    left: `${50 - (pan.x / 10)}%`, // Simplified mapping logic
                    top: `${50 - (pan.y / 10)}%`,
                    width: `${3000 / (zoom[0] * 25)}%`,
                    height: `${3000 / (zoom[0] * 25)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-100/50 to-purple-50/50 relative">
                <div className="absolute top-2 left-2 w-8 h-6 border-2 border-primary rounded-sm" />
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur rounded border text-xs font-mono select-none">
            <div className="flex items-center gap-3">
              <span>Tool: <span className="font-semibold text-primary">{activeTool.toUpperCase()}</span></span>
              <span>Zoom: {zoom[0]}x</span>
              <span>Pan: {Math.round(pan.x)},{Math.round(pan.y)}</span>
              {currentAnnotation && (
                <span className="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-1 rounded">
                  Drawing...
                </span>
              )}
            </div>
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

          {/* Clinical Context */}
          {metadata && (metadata.patient_age || metadata.body_site || metadata.stain_type) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Clinical Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {metadata.patient_age && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="font-medium">
                      {metadata.patient_age}Y {metadata.patient_gender ? `(${metadata.patient_gender})` : ''}
                    </span>
                  </div>
                )}
                {metadata.body_site && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Body Site</span>
                    <span className="font-medium text-right max-w-[120px] truncate" title={metadata.body_site}>
                      {metadata.body_site}
                    </span>
                  </div>
                )}
                {metadata.procedure_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Procedure</span>
                    <span className="font-medium">{metadata.procedure_type}</span>
                  </div>
                )}
                {metadata.stain_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stain</span>
                    <span className="font-medium">{metadata.stain_type}</span>
                  </div>
                )}
                {metadata.clinical_history && (
                  <div className="pt-2 border-t mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Clinical History</p>
                    <p className="text-xs bg-muted p-2 rounded line-clamp-3">
                      {metadata.clinical_history}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
