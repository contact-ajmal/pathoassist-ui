import { useState, useEffect } from 'react';
import {
  Download,
  FileJson,
  FileText,
  File,
  Check,
  ImageIcon,
  Search,
  Calendar,
  Archive,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useCase } from '@/contexts/CaseContext';
import { exportReport, downloadExport, listCases } from '@/lib/api';
import type { ExportFormat, CaseSummary } from '@/types/api';

interface ExportScreenProps {
  onSave: () => void;
}

export function ExportScreen({ onSave }: ExportScreenProps) {
  const { caseId, report, roiResult, metadata } = useCase();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [includeROI, setIncludeROI] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archivedCases, setArchivedCases] = useState<CaseSummary[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // Load archived cases on mount
  useEffect(() => {
    loadArchivedCases();
  }, []);

  const loadArchivedCases = async () => {
    setIsLoadingCases(true);
    try {
      const cases = await listCases();
      setArchivedCases(cases);
    } catch (err) {
      console.warn('Failed to load archived cases:', err);
    } finally {
      setIsLoadingCases(false);
    }
  };

  const formats: {
    id: ExportFormat;
    label: string;
    icon: typeof File;
    description: string;
  }[] = [
    { id: 'pdf', label: 'PDF Report', icon: File, description: 'Formatted pathology report' },
    { id: 'json', label: 'JSON Data', icon: FileJson, description: 'Structured data export' },
    { id: 'txt', label: 'Plain Text', icon: FileText, description: 'Simple text format' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            Completed
          </Badge>
        );
      case 'analyzing':
      case 'processing':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };

  const handleExport = async () => {
    if (!caseId) {
      setError('No case ID available');
      return;
    }

    setIsExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      // First, export the report to generate the file
      await exportReport({
        case_id: caseId,
        format: selectedFormat,
        include_images: includeROI,
      });

      // Then download it
      const blob = await downloadExport(caseId, selectedFormat);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseId}_report.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);

      // Refresh the cases list
      loadArchivedCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCase = async (caseSummary: CaseSummary) => {
    try {
      const blob = await downloadExport(caseSummary.case_id, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caseSummary.case_id}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const filteredCases = archivedCases.filter(
    (c) =>
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.filename && c.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const confidenceScore = report?.confidence_score
    ? Math.round(report.confidence_score * 100)
    : 0;

  return (
    <div className="h-full flex animate-fade-in">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b bg-card px-6 flex items-center shrink-0">
          <div>
            <h2 className="font-semibold">Export & Archive</h2>
            <p className="text-xs text-muted-foreground">
              Save report and manage case archive
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl space-y-6">
            {/* Error/Success Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {exportSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Report exported successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  Export Current Case
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Format Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    {formats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all',
                          selectedFormat === format.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <format.icon
                            className={cn(
                              'w-5 h-5',
                              selectedFormat === format.id
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          />
                          <div>
                            <p className="font-medium text-sm">{format.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {format.description}
                            </p>
                          </div>
                          {selectedFormat === format.id && (
                            <Check className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Include ROI Thumbnails</p>
                      <p className="text-xs text-muted-foreground">
                        Attach selected patch images to export
                      </p>
                    </div>
                  </div>
                  <Switch checked={includeROI} onCheckedChange={setIncludeROI} />
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    size="lg"
                    className="px-8"
                    onClick={handleExport}
                    disabled={isExporting || !caseId}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export as {formats.find((f) => f.id === selectedFormat)?.label}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Archive Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Archive className="w-4 h-4 text-primary" />
                    Local Archive
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCases ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredCases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No cases match your search' : 'No archived cases yet'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCases.map((caseItem) => (
                        <TableRow key={caseItem.case_id}>
                          <TableCell className="font-mono text-sm font-medium">
                            {caseItem.case_id.slice(0, 16)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(caseItem.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="truncate max-w-[200px]">
                            {caseItem.filename || 'N/A'}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(caseItem.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadCase(caseItem)}
                              disabled={caseItem.status !== 'completed'}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Panel - Current Case Summary */}
      <div className="w-72 border-l bg-card shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Current Case</h3>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div>
                <label className="report-card-label text-xs text-muted-foreground">
                  Case ID
                </label>
                <p className="font-mono text-sm font-medium">
                  {caseId?.slice(0, 16) || 'N/A'}
                </p>
              </div>
              <div>
                <label className="report-card-label text-xs text-muted-foreground">
                  Date
                </label>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <label className="report-card-label text-xs text-muted-foreground">
                  Tissue Type
                </label>
                <p className="text-sm capitalize">{report?.tissue_type || 'N/A'}</p>
              </div>
              <div>
                <label className="report-card-label text-xs text-muted-foreground">
                  Overall Confidence
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        confidenceScore >= 80
                          ? 'bg-success'
                          : confidenceScore >= 60
                            ? 'bg-warning'
                            : 'bg-destructive'
                      )}
                      style={{ width: `${confidenceScore}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      confidenceScore >= 80
                        ? 'text-success'
                        : confidenceScore >= 60
                          ? 'text-warning'
                          : 'text-destructive'
                    )}
                  >
                    {confidenceScore}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ROIs Analyzed</span>
                <span className="font-medium">
                  {roiResult?.selected_patches.length ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slide File</span>
                <span className="font-mono text-xs truncate max-w-[100px]">
                  {metadata?.filename || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono text-xs">MedGemma</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Action */}
        <div className="p-4 border-t">
          <Button className="w-full" onClick={onSave}>
            <Archive className="w-4 h-4 mr-2" />
            Complete & New Case
          </Button>
        </div>
      </div>
    </div>
  );
}
