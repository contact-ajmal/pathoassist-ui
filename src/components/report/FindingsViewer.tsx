import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCase } from '@/contexts/CaseContext';
import { getThumbnailUrl } from '@/lib/api';
import type { PatchInfo } from '@/types/api';

interface FindingsViewerProps {
    activePatchIndex: number | null;
    className?: string;
}

export function FindingsViewer({ activePatchIndex, className }: FindingsViewerProps) {
    const { caseId, metadata, roiResult } = useCase();
    const [zoom, setZoom] = useState(25);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const thumbnailUrl = caseId ? getThumbnailUrl(caseId) : null;
    const patches = roiResult?.selected_patches || [];

    // Auto-focus on active patch
    // Auto-focus on active patch
    useEffect(() => {
        if (activePatchIndex !== null && patches[activePatchIndex] && metadata?.dimensions && containerRef.current && imageRef.current) {
            const patch = patches[activePatchIndex];
            const { coordinates } = patch;

            // Target center in percentage (0-1)
            const targetX = (coordinates.x + coordinates.width / 2) / metadata.dimensions[0];
            const targetY = (coordinates.y + coordinates.height / 2) / metadata.dimensions[1];

            // Dimensions of the displayed image at 1x scale (zoom=25)
            const imgRect = imageRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            // Set Zoom
            const targetZoom = 125; // 5x zoom
            setZoom(targetZoom);

            // Calculate Pan
            // We want the target point to be at the center of the container
            // Current position of target point relative to image center: (target - 0.5) * imgDims

            // At zoom=125 (scale 5), the image is 5x larger
            const scale = targetZoom / 25;

            // Offset needed to center the target point
            // Pan = (0.5 - targetPct) * (OriginalImageSize * Scale)
            const panX = (0.5 - targetX) * (imgRect.width * scale);
            const panY = (0.5 - targetY) * (imgRect.height * scale);

            setPan({ x: panX, y: panY });
        }
    }, [activePatchIndex, patches, metadata]);


    // Reuse Pan/Zoom Logic from ViewerScreen (Simplified)
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className={cn("flex flex-col border rounded-lg bg-slate-900 overflow-hidden shadow-2xl h-[500px]", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-slate-800 border-b border-slate-700">
                <span className="text-xs text-slate-400 font-medium px-2">
                    {activePatchIndex !== null ? `Focusing: ROI #${activePatchIndex + 1}` : 'Slide Overview'}
                </span>
                <div className="flex bg-slate-700 rounded-md">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white" onClick={() => setZoom(z => Math.min(z + 10, 200))}>
                        <ZoomIn className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white" onClick={() => setZoom(z => Math.max(z - 10, 10))}>
                        <ZoomOut className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white" onClick={() => { setZoom(25); setPan({ x: 0, y: 0 }); }}>
                        <RotateCcw className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Viewport */}
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {thumbnailUrl ? (
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 25})`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                            }}
                            className="relative"
                        >
                            <img
                                ref={imageRef}
                                src={thumbnailUrl}
                                className="max-w-[90%] max-h-[90%] shadow-lg object-contain pointer-events-none"
                            />

                            {/* ROI Overlay */}
                            {metadata?.dimensions && patches.map((patch, idx) => {
                                const isTarget = activePatchIndex === idx;
                                // Convert coordinates to %
                                const top = (patch.coordinates.y / metadata.dimensions[1]) * 100;
                                const left = (patch.coordinates.x / metadata.dimensions[0]) * 100;
                                const width = (patch.coordinates.width / metadata.dimensions[0]) * 100;
                                const height = (patch.coordinates.height / metadata.dimensions[1]) * 100;

                                return (
                                    <div
                                        key={patch.patch_id}
                                        className={cn(
                                            "absolute border-2 transition-all duration-300",
                                            isTarget ? "border-amber-400 border-4 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-10" : "border-teal-500/30 hover:border-teal-400/80 z-0"
                                        )}
                                        style={{
                                            top: `${top}%`,
                                            left: `${left}%`,
                                            width: `${width}%`,
                                            height: `${height}%`,
                                        }}
                                    >
                                        {isTarget && (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                                ROI #{idx + 1}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        No Image Data
                    </div>
                )}
            </div>
        </div>
    );
}
