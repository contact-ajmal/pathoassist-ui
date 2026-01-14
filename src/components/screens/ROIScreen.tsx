import { useState } from 'react';
import { Filter, Grid3X3, Check, Square, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ROIPatch } from '@/types/workflow';

interface ROIScreenProps {
  onProceed: () => void;
}

const mockPatches: ROIPatch[] = [
  { id: 'P001', magnification: '40x', coordinates: { x: 1024, y: 512 }, selected: true, type: 'tumor' },
  { id: 'P002', magnification: '40x', coordinates: { x: 2048, y: 512 }, selected: true, type: 'tumor' },
  { id: 'P003', magnification: '40x', coordinates: { x: 3072, y: 512 }, selected: false, type: 'inflammatory' },
  { id: 'P004', magnification: '40x', coordinates: { x: 1024, y: 1024 }, selected: true, type: 'tumor' },
  { id: 'P005', magnification: '40x', coordinates: { x: 2048, y: 1024 }, selected: false, type: 'normal' },
  { id: 'P006', magnification: '40x', coordinates: { x: 3072, y: 1024 }, selected: true, type: 'inflammatory' },
  { id: 'P007', magnification: '40x', coordinates: { x: 1024, y: 1536 }, selected: false, type: 'normal' },
  { id: 'P008', magnification: '40x', coordinates: { x: 2048, y: 1536 }, selected: true, type: 'tumor' },
  { id: 'P009', magnification: '40x', coordinates: { x: 3072, y: 1536 }, selected: false, type: 'inflammatory' },
];

export function ROIScreen({ onProceed }: ROIScreenProps) {
  const [patches, setPatches] = useState<ROIPatch[]>(mockPatches);
  const [autoSelect, setAutoSelect] = useState(true);
  const [filterTumor, setFilterTumor] = useState(true);
  const [filterInflammatory, setFilterInflammatory] = useState(true);

  const togglePatch = (id: string) => {
    setPatches(patches.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const selectedCount = patches.filter(p => p.selected).length;

  const getTypeColor = (type: ROIPatch['type']) => {
    switch (type) {
      case 'tumor': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'inflammatory': return 'bg-warning/10 text-warning border-warning/30';
      case 'normal': return 'bg-success/10 text-success border-success/30';
    }
  };

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
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold text-primary">{selectedCount}</span>
                <span className="text-muted-foreground"> / {patches.length} selected</span>
              </span>
            </div>
          </div>
        </div>

        {/* Patches Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-4 max-w-4xl">
            {patches.map((patch) => (
              <div
                key={patch.id}
                onClick={() => togglePatch(patch.id)}
                className={cn(
                  'patch-card cursor-pointer',
                  patch.selected && 'patch-card-selected'
                )}
              >
                {/* Patch Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-pink-100 via-purple-50 to-blue-50 relative">
                  {/* Selection checkbox */}
                  <div className="absolute top-2 right-2">
                    {patch.selected ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {/* Type badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className={cn('text-xs capitalize', getTypeColor(patch.type))}>
                      {patch.type}
                    </Badge>
                  </div>
                </div>
                {/* Patch Info */}
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">{patch.id}</span>
                    <span className="text-xs text-muted-foreground">{patch.magnification}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    ({patch.coordinates.x}, {patch.coordinates.y})
                  </p>
                </div>
              </div>
            ))}
          </div>
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
                  <p className="text-xs text-muted-foreground">AI-suggested regions</p>
                </div>
                <Switch checked={autoSelect} onCheckedChange={setAutoSelect} />
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
                  <span className="text-sm">Tumor-like</span>
                </div>
                <Switch checked={filterTumor} onCheckedChange={setFilterTumor} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning/30" />
                  <span className="text-sm">Inflammatory</span>
                </div>
                <Switch checked={filterInflammatory} onCheckedChange={setFilterInflammatory} />
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
                  <span className="text-muted-foreground">Tumor regions</span>
                  <span className="font-medium">{patches.filter(p => p.selected && p.type === 'tumor').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inflammatory</span>
                  <span className="font-medium">{patches.filter(p => p.selected && p.type === 'inflammatory').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Normal tissue</span>
                  <span className="font-medium">{patches.filter(p => p.selected && p.type === 'normal').length}</span>
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
            onClick={onProceed}
            disabled={selectedCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm ROIs & Analyze
          </Button>
        </div>
      </div>
    </div>
  );
}
