import { useState } from 'react';
import { AlertTriangle, Edit3, Info, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ReviewScreenProps {
  onProceed: () => void;
}

interface ReportField {
  id: string;
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

const initialFields: ReportField[] = [
  { id: 'tissue', label: 'Tissue Type', value: 'Pulmonary adenocarcinoma', confidence: 'high' },
  { id: 'cellularity', label: 'Cellularity', value: 'High (>70%)', confidence: 'high' },
  { id: 'atypia', label: 'Nuclear Atypia', value: 'Moderate', confidence: 'medium' },
  { id: 'mitotic', label: 'Mitotic Activity', value: '8 mitoses/10 HPF', confidence: 'high' },
  { id: 'necrosis', label: 'Necrosis', value: 'Present, focal (<10%)', confidence: 'medium' },
  { id: 'inflammation', label: 'Inflammation', value: 'Mild lymphocytic infiltrate', confidence: 'high' },
  { id: 'followup', label: 'Suggested Follow-up', value: 'PD-L1 immunohistochemistry, molecular testing', confidence: 'medium' },
];

const narrativeReport = `PATHOLOGY REPORT

SPECIMEN: Lung, right lower lobe, wedge resection

CLINICAL HISTORY: 55-year-old male with chronic cough, 30 pack-year smoking history. CT scan revealed 2.3cm peripheral nodule.

GROSS DESCRIPTION: Wedge resection of lung tissue measuring 4.5 x 3.2 x 2.1 cm. Cut surface reveals a tan-white, firm nodule measuring 2.4 cm in greatest dimension with irregular borders.

MICROSCOPIC DESCRIPTION:
Sections demonstrate a moderately differentiated adenocarcinoma with acinar and papillary growth patterns. The tumor cells exhibit moderate nuclear atypia with prominent nucleoli. Mitotic activity is increased (8 mitoses/10 HPF). Focal areas of necrosis are present, comprising less than 10% of the tumor volume.

The tumor demonstrates invasion into visceral pleura. Lymphovascular invasion is identified. Surgical margins are negative (closest margin: 1.2 cm).

Background lung parenchyma shows mild emphysematous changes and focal anthracosis.

DIAGNOSIS:
- Lung, right lower lobe, wedge resection:
  ADENOCARCINOMA, MODERATELY DIFFERENTIATED
  - Tumor size: 2.4 cm
  - Visceral pleural invasion: Present
  - Lymphovascular invasion: Present
  - Margins: Negative

AI CONFIDENCE NOTE: This analysis was generated with high confidence based on morphological features. ~Uncertainty exists~ regarding the exact grade classification, which may benefit from additional review.`;

export function ReviewScreen({ onProceed }: ReviewScreenProps) {
  const [fields, setFields] = useState<ReportField[]>(initialFields);
  const [narrative, setNarrative] = useState(narrativeReport);
  const [editingField, setEditingField] = useState<string | null>(null);

  const getConfidenceStyle = (confidence: ReportField['confidence']) => {
    switch (confidence) {
      case 'high': return 'confidence-high';
      case 'medium': return 'confidence-medium';
      case 'low': return 'confidence-low';
    }
  };

  const getConfidenceBadge = (confidence: ReportField['confidence']) => {
    switch (confidence) {
      case 'high': return 'bg-success/10 text-success border-success/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'low': return 'bg-destructive/10 text-destructive border-destructive/30';
    }
  };

  const updateField = (id: string, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f));
  };

  return (
    <div className="h-full flex animate-fade-in">
      {/* Left Panel - Structured Report */}
      <div className="flex-1 flex flex-col border-r">
        <div className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-semibold">Structured Findings</h2>
            <p className="text-xs text-muted-foreground">AI-generated analysis results</p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <History className="w-4 h-4 mr-1.5" />
                  Version History
                </Button>
              </TooltipTrigger>
              <TooltipContent>View previous versions</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-3 max-w-xl">
            {fields.map((field) => (
              <Card key={field.id} className="report-card">
                <div className="report-card-header">
                  <span className="report-card-label">{field.label}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className={cn('text-xs', getConfidenceBadge(field.confidence))}>
                        {field.confidence} confidence
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">AI confidence level for this finding</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {editingField === field.id ? (
                  <Input
                    value={field.value}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    autoFocus
                    className="mt-1"
                  />
                ) : (
                  <div 
                    className="flex items-center justify-between group cursor-pointer"
                    onClick={() => setEditingField(field.id)}
                  >
                    <p className="font-medium">{field.value}</p>
                    <Edit3 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Narrative Report */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-semibold">Narrative Report</h2>
            <p className="text-xs text-muted-foreground">Editable pathology report</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5" />
            <span>~Highlighted~ text indicates uncertainty</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <Textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            className="min-h-full font-mono text-sm resize-none"
          />
        </div>

        {/* Footer */}
        <div className="border-t p-4 space-y-4">
          {/* Disclaimer */}
          <div className="disclaimer-banner flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">AI-Assisted Output</p>
              <p className="text-sm opacity-80">
                Final interpretation and diagnosis require review and validation by a licensed pathologist. 
                This system is intended for decision support only.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Request Re-analysis
            </Button>
            <Button onClick={onProceed}>
              Approve & Continue to Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
