import { useState, useEffect } from 'react';
import { Filter, Grid3X3, Check, Square, CheckSquare, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useCase } from '@/contexts/CaseContext';
import { confirmROISelection, getPatchThumbnailUrl } from '@/lib/api';
import type { PatchInfo } from '@/types/api';

interface ROIScreenProps {
  onProceed: () => void;
}

interface DisplayPatch extends PatchInfo {
  selected: boolean;
  patchType: 'high_variance' | 'medium_variance' | 'low_variance';
}

function getPatchType(patch: PatchInfo): DisplayPatch['patchType'] {
  if (patch.variance_score >= 0.7) return 'high_variance';
  if (patch.variance_score >= 0.4) return 'medium_variance';
  return 'low_variance';
}

function getTypeColor(type: DisplayPatch['patchType']) {
  switch (type) {
    case 'high_variance':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    case 'medium_variance':
      return 'bg-warning/10 text-warning border-warning/30';
    case 'low_variance':
      return 'bg-success/10 text-success border-success/30';
  }
}

function getTypeLabel(type: DisplayPatch['patchType']) {
  switch (type) {
    case 'high_variance':
      return 'High Interest';
    case 'medium_variance':
      return 'Medium';
    case 'low_variance':
      return 'Low';
  }
}

export function ROIScreen({ onProceed }: ROIScreenProps) {
  const { caseId, processingResult, setRoiResult } = useCase();
  const [patches, setPatches] = useState<DisplayPatch[]>([]);
  const [autoSelect, setAutoSelect] = useState(true);
  const [filterHighVariance, setFilterHighVariance] = useState(true);
  const [filterMediumVariance, setFilterMediumVariance] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize patches from processing result
  useEffect(() => {
    if (processingResult?.patches) {
      // Filter to only tissue patches and sort by variance score
      const tissuePatches = processingResult.patches
        .filter((p) => !p.is_background)
        .sort((a, b) => b.variance_score - a.variance_score)
        .slice(0, 100) // Limit to top 100 for display
        .map((patch) => ({
          ...patch,
          selected: patch.variance_score >= 0.5, // Auto-select high variance patches
          patchType: getPatchType(patch),
        }));
      setPatches(tissuePatches);
    }
  }, [processingResult]);

  const togglePatch = (patchId: string) => {
    setPatches((prev) =>
      prev.map((p) =>
        p.patch_id === patchId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const selectAll = () => {
    setPatches((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const deselectAll = () => {
    setPatches((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  const handleAutoSelect = (checked: boolean) => {
    setAutoSelect(checked);
    if (checked) {
      // Auto-select top patches by variance
      setPatches((prev) =>
        prev.map((p) => ({
          ...p,
          selected: p.variance_score >= 0.5,
        }))
      );
    }
  };

  const handleConfirmROI = async () => {
    if (!caseId) {
      setError('No case ID available');
      return;
    }

    const selectedPatchIds = patches.filter((p) => p.selected).map((p) => p.patch_id);

    if (selectedPatchIds.length === 0) {
      setError('Please select at least one patch');
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      const result = await confirmROISelection({
        case_id: caseId,
        selected_patch_ids: selectedPatchIds,
        auto_select: autoSelect,
        top_k: 50,
      });

      setRoiResult(result);
      onProceed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm ROI selection');
    } finally {
      setIsConfirming(false);
    }
  };

  const filteredPatches = patches.filter((patch) => {
    if (patch.patchType === 'high_variance' && !filterHighVariance) return false;
    if (patch.patchType === 'medium_variance' && !filterMediumVariance) return false;
    return true;
  });

  const selectedCount = patches.filter((p) => p.selected).length;
  const highVarianceSelected = patches.filter(
    (p) => p.selected && p.patchType === 'high_variance'
  ).length;
  const mediumVarianceSelected = patches.filter(
    (p) => p.selected && p.patchType === 'medium_variance'
  ).length;
  const lowVarianceSelected = patches.filter(
    (p) => p.selected && p.patchType === 'low_variance'
  ).length;

  return (
    <div className="h-full flex animate-fade-in">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-semibold">Region of Interest Selection</h2>
            <p className="text-xs text-muted-foreground">
              Select tissue patches for AI analysis
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Clear
            </Button>
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold text-primary">{selectedCount}</span>
                <span className="text-muted-foreground"> / {patches.length} selected</span>
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Patches Grid */}
        <div className="flex-1 overflow-auto p-6">
          {filteredPatches.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {patches.length === 0
                ? 'No tissue patches available'
                : 'No patches match the current filter'}
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPatches.map((patch) => (
                <div
                  key={patch.patch_id}
                  onClick={() => togglePatch(patch.patch_id)}
                  className={cn(
                    'patch-card cursor-pointer',
                    patch.selected && 'patch-card-selected'
                  )}
                >
                  {/* Patch Image */}
                  <div className="aspect-square bg-muted relative overflow-hidden group">
                    <img
                      src={getPatchThumbnailUrl(caseId!, patch.patch_id)}
                      alt={`Patch ${patch.patch_id}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Selection checkbox */}
                    <div className="absolute top-2 right-2">
                      {patch.selected ? (
                        <CheckSquare className="w-5 h-5 text-primary bg-background/80 rounded" />
                      ) : (
                        <Square className="w-5 h-5 text-white/50 bg-black/20 rounded" />
                      )}
                    </div>
                    {/* Type badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge
                        variant="secondary"
                        className={cn('text-xs opacity-90', getTypeColor(patch.patchType))}
                      >
                        {getTypeLabel(patch.patchType)}
                      </Badge>
                    </div>
                    {/* Variance score */}
                    <div className="absolute bottom-2 right-2 text-xs font-mono bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {(patch.variance_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  {/* Patch Info */}
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium truncate">
                        {patch.patch_id.split('_').slice(-3).join('_')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {patch.magnification}x
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      ({patch.x}, {patch.y})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-72 border-l bg-card shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Selection Controls</h3>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Auto Select */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Automatic Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-select ROIs</p>
                  <p className="text-xs text-muted-foreground">High-variance regions</p>
                </div>
                <Switch checked={autoSelect} onCheckedChange={handleAutoSelect} />
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Region Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/30" />
                  <span className="text-sm">High Interest</span>
                </div>
                <Switch
                  checked={filterHighVariance}
                  onCheckedChange={setFilterHighVariance}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning/30" />
                  <span className="text-sm">Medium</span>
                </div>
                <Switch
                  checked={filterMediumVariance}
                  onCheckedChange={setFilterMediumVariance}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Selection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High Interest</span>
                  <span className="font-medium">{highVarianceSelected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medium</span>
                  <span className="font-medium">{mediumVarianceSelected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low</span>
                  <span className="font-medium">{lowVarianceSelected}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total selected</span>
                  <span className="text-primary">{selectedCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action */}
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={handleConfirmROI}
            disabled={selectedCount === 0 || isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirm ROIs & Analyze
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
