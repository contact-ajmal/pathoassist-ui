import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Edit3, Info, History, RefreshCw, Loader2, Brain, FileText, MessageSquare, GripVertical } from 'lucide-react';
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
import { FindingsViewer } from '@/components/report/FindingsViewer';
import { PathoCopilot } from '@/components/copilot/PathoCopilot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReviewScreenProps {
  onProceed: () => void;
}

interface ReportField {
  id: string;
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  visual_evidence?: string | null;
}

export function ReviewScreen({ onProceed }: ReviewScreenProps) {
  const { caseId, report, analysisResult, setReport } = useCase();
  const [fields, setFields] = useState<ReportField[]>([]);
  const [narrative, setNarrative] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeROIIndex, setActiveROIIndex] = useState<number | null>(null);

  // Resizable Panel State
  const [panelSize, setPanelSize] = useState(450); // Represents Width (desktop) or Height (mobile)
  const isResizing = useRef(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Check orientation/size
  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768); // lg breakpoint lowered to md
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      if (isDesktop) {
        // Horizontal Resize (Width from right)
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < 800) {
          setPanelSize(newWidth);
        }
      } else {
        // Vertical Resize (Height from bottom)
        // Use window.innerHeight - clientY
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight > 200 && newHeight < window.innerHeight - 100) {
          setPanelSize(newHeight);
        }
      }
    }
  }, [isDesktop]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);


  // Initialize from report or fetch it
  useEffect(() => {
    if (report) {
      initializeFromReport();
    } else if (caseId) {
      fetchReport();
    }
  }, [report, caseId]);

  // Auto-select first ROI when analysis is ready
  useEffect(() => {
    if (analysisResult?.findings && activeROIIndex === null) {
      // Default to first patch so heatmap is available immediately
      setActiveROIIndex(0);
    }
  }, [analysisResult, activeROIIndex]);

  const getConfidence = (value: string): ConfidenceLevel => {
    if (!value || value.toLowerCase() === 'not assessed' || value.toLowerCase() === 'unknown') {
      return 'low';
    }
    return 'high';
  };

  const initializeFromReport = () => {
    if (!report) return;

    const reportFields: ReportField[] = [
      {
        id: 'tissue',
        label: 'Tissue Type',
        value: report.tissue_type || 'Unknown',
        confidence: getConfidence(report.tissue_type || 'Unknown'),
      },
      {
        id: 'cellularity',
        label: 'Cellularity',
        value: report.cellularity || 'Not assessed',
        confidence: getConfidence(report.cellularity || 'Not assessed'),
      },
      {
        id: 'atypia',
        label: 'Nuclear Atypia',
        value: report.nuclear_atypia || 'Not assessed',
        confidence: getConfidence(report.nuclear_atypia || 'Not assessed'),
      },
      {
        id: 'mitotic',
        label: 'Mitotic Activity',
        value: report.mitotic_activity || 'Not assessed',
        confidence: getConfidence(report.mitotic_activity || 'Not assessed'),
      },
      {
        id: 'necrosis',
        label: 'Necrosis',
        value: report.necrosis || 'Not assessed',
        confidence: getConfidence(report.necrosis || 'Not assessed'),
      },
      {
        id: 'inflammation',
        label: 'Inflammation',
        value: report.inflammation || 'Not assessed',
        confidence: getConfidence(report.inflammation || 'Not assessed'),
      },
      {
        id: 'followup',
        label: 'Suggested Follow-up',
        value: report.suggested_tests?.join(', ') || 'None specified',
        confidence: getConfidence(report.suggested_tests?.join(', ') || 'None specified'),
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
        confidence: getConfidence(analysisResult.tissue_type || 'Unknown'),
      },
    ];

    // Add findings as fields
    analysisResult.findings.forEach((finding, index) => {
      reportFields.push({
        id: `finding_${index}`,
        label: finding.category,
        value: finding.finding,
        confidence: finding.confidence,
        visual_evidence: finding.visual_evidence,
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
        return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'low':
        return 'bg-red-500/10 text-red-700 border-red-500/30';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const updateField = (id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const handleReanalyze = () => {
    setReport(null as any);
    fetchReport();
  };

  const handleFieldClick = (field: ReportField) => {
    setEditingField(field.id);

    // Parse ROI index from visual evidence
    if (field.visual_evidence) {
      // Support ROI #1, ROI 1, Region 1, Patch 1
      const match = field.visual_evidence.match(/(?:ROI|Region|Patch)\s*#?(\d+)/i);
      if (match) {
        const index = parseInt(match[1]) - 1; // 1-based to 0-based
        setActiveROIIndex(index);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
          <p className="text-slate-500 font-medium">Synthesizing multimodal report...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full grid animate-fade-in bg-slate-50 overflow-hidden"
      style={{
        gridTemplateColumns: isDesktop ? `320px 1fr 4px ${panelSize}px` : '1fr',
        gridTemplateRows: isDesktop ? '1fr' : `1fr 4px ${panelSize}px`,
      }}
    >

      {/* LEFT PANEL: Findings Navigation */}
      <div className="bg-white border-r flex flex-col overflow-hidden">
        <div className="h-14 border-b px-4 flex items-center justify-between shrink-0 bg-slate-50">
          <span className="font-semibold text-sm text-slate-700">Detailed Findings</span>
          {report && <Badge variant="secondary" className="text-xs">{((report.confidence_score || 0) * 100).toFixed(0)}% Conf.</Badge>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {fields.map((field) => (
            <div
              key={field.id}
              onClick={() => handleFieldClick(field)}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                editingField === field.id ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500/20" : "border-slate-200 bg-white hover:border-teal-200"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{field.label}</span>
                <Badge variant="outline" className={cn("text-[10px] h-5", getConfidenceBadge(field.confidence))}>
                  {field.confidence}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-800">{field.value}</p>

              {field.visual_evidence && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-600 bg-white/50 px-2 py-1 rounded border border-teal-100">
                  <span className="font-bold">Evid:</span>
                  <span className="truncate">{field.visual_evidence}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANEL: Interactive Evidence Viewer */}
      <div className="flex flex-col bg-slate-100 p-4 border-r overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 text-white p-1 rounded">
              <Brain className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-800">Visual Evidence Grounding</h2>
          </div>
          <Badge variant="outline" className="bg-white">
            Interactive Mode Active
          </Badge>
        </div>

        <FindingsViewer
          activePatchIndex={activeROIIndex}
          className="flex-1 shadow-sm border-slate-300"
        />

        {/* Diagnostic Reasoning (Contextual below viewer) */}
        {analysisResult?.differential_diagnosis && (
          <div className="mt-4 h-48 overflow-y-auto bg-white rounded-lg border border-slate-200 p-4 shadow-sm shrink-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Diagnostic Reasoning Engine</h3>
            <div className="space-y-3">
              {analysisResult.differential_diagnosis.map((dd, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-16 shrink-0 pt-0.5">
                    <span className="font-medium text-slate-900 block">{dd.likelihood_score * 100}%</span>
                    <span className="text-[10px] text-slate-500">{dd.likelihood}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-teal-700">{dd.condition}</span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">"{dd.reasoning}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESIZE HANDLE */}
      <div
        className={cn(
          "bg-slate-200 hover:bg-teal-500 flex items-center justify-center transition-colors group z-50",
          isDesktop ? "w-1 cursor-col-resize h-full" : "h-1 cursor-row-resize w-full"
        )}
        onMouseDown={startResizing}
      >
        <div className={cn(
          "rounded-full bg-slate-300 group-hover:bg-teal-600 transition-colors",
          isDesktop ? "h-8 w-1" : "w-8 h-1"
        )} />
      </div>

      {/* RIGHT PANEL: Final Narrative & Copilot (Resizable) */}
      <div className="flex flex-col h-full bg-white border-l shadow-xl z-20 overflow-hidden">
        <Tabs defaultValue="copilot" className="flex flex-col h-full flex-1">
          <div className="h-14 border-b px-2 flex items-center justify-between shrink-0 bg-slate-50">
            <TabsList className="grid w-[260px] grid-cols-2">
              <TabsTrigger value="narrative" className="text-xs">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Report
              </TabsTrigger>
              <TabsTrigger value="copilot" className="text-xs">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                PathoAssist AI Bot
              </TabsTrigger>
            </TabsList>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-500">
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
          </div>

          <TabsContent value="narrative" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex overflow-hidden h-full">
            <div className="flex-1 relative">
              <Textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="w-full h-full resize-none border-0 focus-visible:ring-0 rounded-none p-6 font-mono text-sm leading-relaxed absolute inset-0"
                placeholder="Generating narrative..."
              />
            </div>
            <div className="p-4 border-t bg-slate-50 space-y-3 shrink-0">
              <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 text-xs rounded border border-amber-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{report?.disclaimer || "AI-generated. Verify before signing out."}</p>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={onProceed}>
                Approve & Export Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="copilot" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex overflow-hidden bg-slate-50 h-full">
            <PathoCopilot
              className="border-0 h-full"
              onUpdateReport={(text) => {
                setNarrative(prev => prev + "\n" + text);
              }}
              onViewRoi={(index) => setActiveROIIndex(index)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
