import { useState, useEffect } from 'react';
import { AlertTriangle, Edit3, Info, History, RefreshCw, Loader2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCase } from '@/contexts/CaseContext';
import { getReport } from '@/lib/api';
import type { ConfidenceLevel } from '@/types/api';

interface ReviewScreenProps {
  onProceed: () => void;
}

interface ReportField {
  id: string;
  label: string;
  value: string;
  confidence: ConfidenceLevel;
}

export function ReviewScreen({ onProceed }: ReviewScreenProps) {
  const { caseId, report, analysisResult, setReport } = useCase();
  const [fields, setFields] = useState<ReportField[]>([]);
  const [narrative, setNarrative] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from report or fetch it
  useEffect(() => {
    if (report) {
      initializeFromReport();
    } else if (caseId) {
      fetchReport();
    }
  }, [report, caseId]);

  const initializeFromReport = () => {
    if (!report) return;

    const reportFields: ReportField[] = [
      {
        id: 'tissue',
        label: 'Tissue Type',
        value: report.tissue_type || 'Unknown',
        confidence: 'high',
      },
      {
        id: 'cellularity',
        label: 'Cellularity',
        value: report.cellularity || 'Not assessed',
        confidence: 'high',
      },
      {
        id: 'atypia',
        label: 'Nuclear Atypia',
        value: report.nuclear_atypia || 'Not assessed',
        confidence: 'medium',
      },
      {
        id: 'mitotic',
        label: 'Mitotic Activity',
        value: report.mitotic_activity || 'Not assessed',
        confidence: 'high',
      },
      {
        id: 'necrosis',
        label: 'Necrosis',
        value: report.necrosis || 'Not assessed',
        confidence: 'medium',
      },
      {
        id: 'inflammation',
        label: 'Inflammation',
        value: report.inflammation || 'Not assessed',
        confidence: 'high',
      },
      {
        id: 'followup',
        label: 'Suggested Follow-up',
        value: report.suggested_tests?.join(', ') || 'None specified',
        confidence: 'medium',
      },
    ];

    setFields(reportFields);
    setNarrative(report.narrative_summary || '');
  };

  const initializeFromAnalysis = () => {
    if (!analysisResult) return;

    const reportFields: ReportField[] = [
      {
        id: 'tissue',
        label: 'Tissue Type',
        value: analysisResult.tissue_type || 'Unknown',
        confidence: 'high',
      },
    ];

    // Add findings as fields
    analysisResult.findings.forEach((finding, index) => {
      reportFields.push({
        id: `finding_${index}`,
        label: finding.category,
        value: finding.finding,
        confidence: finding.confidence,
      });
    });

    setFields(reportFields);
    setNarrative(analysisResult.narrative_summary || '');
  };

  const fetchReport = async () => {
    if (!caseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const clinicalContext = localStorage.getItem('clinicalContext') || undefined;
      const fetchedReport = await getReport(caseId, clinicalContext);
      setReport(fetchedReport);
    } catch (err) {
      // Fallback to analysis result if report fetch fails
      console.warn('Failed to fetch report, using analysis result:', err);
      if (analysisResult) {
        initializeFromAnalysis();
      } else {
        setError('Unable to load report data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'high':
        return 'bg-success/10 text-success border-success/30';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'low':
        return 'bg-destructive/10 text-destructive border-destructive/30';
    }
  };

  const updateField = (id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const handleReanalyze = () => {
    // Clear the report and refetch
    setReport(null as any);
    fetchReport();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

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
            {report && (
              <Badge variant="outline" className="text-xs">
                Confidence: {((report.confidence_score || 0) * 100).toFixed(0)}%
              </Badge>
            )}
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

        <div className="flex-1 overflow-auto p-6 scrollbar-hide">
          {/* Diagnostic Reasoning Section (HAI-DEF Feature) */}
          {analysisResult?.differential_diagnosis && analysisResult.differential_diagnosis.length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-sm text-teal-900">Diagnostic Reasoning</h3>
              </div>
              {analysisResult.differential_diagnosis.map((dd, idx) => (
                <Card key={`dd-${idx}`} className="p-4 border-l-4 border-l-teal-500 bg-teal-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{dd.condition}</span>
                    <Badge variant="outline" className={cn("text-xs uppercase", getConfidenceBadge(dd.likelihood))}>
                      {dd.likelihood} Likelihood
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={dd.likelihood_score * 100} className="h-1.5 bg-teal-100" />
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{dd.reasoning}"
                    </p>
                  </div>
                </Card>
              ))}
              <div className="h-px bg-border my-4" />
            </div>
          )}

          {fields.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No findings available
            </div>
          ) : (
            <div className="space-y-3 max-w-xl">
              {fields.map((field) => (
                <Card key={field.id} className="report-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="report-card-label text-xs text-muted-foreground uppercase tracking-wide">
                      {field.label}
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', getConfidenceBadge(field.confidence))}
                        >
                          {field.confidence}
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
          )}
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
            <span>Case: {caseId?.slice(0, 16) || 'N/A'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <Textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="No narrative report available..."
            className="min-h-full font-mono text-sm resize-none"
          />
        </div>

        {/* Footer */}
        <div className="border-t p-4 space-y-4">
          {/* Warnings */}
          {report?.warnings && report.warnings.length > 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm">
              <p className="font-medium text-warning">Warnings:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {report.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer-banner flex items-start gap-3 bg-muted/50 rounded-lg p-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-warning" />
            <div>
              <p className="font-medium">AI-Assisted Output</p>
              <p className="text-sm text-muted-foreground">
                {report?.disclaimer ||
                  'Final interpretation and diagnosis require review and validation by a licensed pathologist. This system is intended for decision support only.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleReanalyze}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-analyze
            </Button>
            <Button onClick={onProceed}>Approve & Continue to Export</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
