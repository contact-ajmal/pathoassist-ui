import { useState } from 'react';
import { Download, FileJson, FileText, File, Check, ImageIcon, Search, Calendar, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ArchivedCase } from '@/types/workflow';

interface ExportScreenProps {
  onSave: () => void;
}

const archivedCases: ArchivedCase[] = [
  { id: 'CASE-2024-0142', date: '2024-01-14', tissueType: 'Lung adenocarcinoma', confidenceScore: 94, exportStatus: 'exported' },
  { id: 'CASE-2024-0141', date: '2024-01-13', tissueType: 'Breast carcinoma', confidenceScore: 89, exportStatus: 'exported' },
  { id: 'CASE-2024-0140', date: '2024-01-12', tissueType: 'Colorectal adenocarcinoma', confidenceScore: 91, exportStatus: 'pending' },
  { id: 'CASE-2024-0139', date: '2024-01-11', tissueType: 'Thyroid papillary carcinoma', confidenceScore: 96, exportStatus: 'exported' },
  { id: 'CASE-2024-0138', date: '2024-01-10', tissueType: 'Prostate adenocarcinoma', confidenceScore: 88, exportStatus: 'not_exported' },
];

type ExportFormat = 'pdf' | 'json' | 'txt';

export function ExportScreen({ onSave }: ExportScreenProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [includeROI, setIncludeROI] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const formats: { id: ExportFormat; label: string; icon: typeof File; description: string }[] = [
    { id: 'pdf', label: 'PDF Report', icon: File, description: 'Formatted pathology report' },
    { id: 'json', label: 'JSON Data', icon: FileJson, description: 'Structured data export' },
    { id: 'txt', label: 'Plain Text', icon: FileText, description: 'Simple text format' },
  ];

  const getStatusBadge = (status: ArchivedCase['exportStatus']) => {
    switch (status) {
      case 'exported':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Exported</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Pending</Badge>;
      case 'not_exported':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Not Exported</Badge>;
    }
  };

  const filteredCases = archivedCases.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tissueType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex animate-fade-in">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b bg-card px-6 flex items-center shrink-0">
          <div>
            <h2 className="font-semibold">Export & Archive</h2>
            <p className="text-xs text-muted-foreground">Save report and manage case archive</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl space-y-6">
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
                          <format.icon className={cn(
                            'w-5 h-5',
                            selectedFormat === format.id ? 'text-primary' : 'text-muted-foreground'
                          )} />
                          <div>
                            <p className="font-medium text-sm">{format.label}</p>
                            <p className="text-xs text-muted-foreground">{format.description}</p>
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
                      <p className="text-xs text-muted-foreground">Attach selected patch images to export</p>
                    </div>
                  </div>
                  <Switch checked={includeROI} onCheckedChange={setIncludeROI} />
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button size="lg" className="px-8">
                    <Download className="w-4 h-4 mr-2" />
                    Export as {formats.find(f => f.id === selectedFormat)?.label}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Tissue Type</TableHead>
                      <TableHead className="text-center">Confidence</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-mono text-sm font-medium">{caseItem.id}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {caseItem.date}
                          </div>
                        </TableCell>
                        <TableCell>{caseItem.tissueType}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            'font-medium',
                            caseItem.confidenceScore >= 90 ? 'text-success' : 
                            caseItem.confidenceScore >= 80 ? 'text-warning' : 'text-destructive'
                          )}>
                            {caseItem.confidenceScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(caseItem.exportStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <label className="report-card-label">Case ID</label>
                <p className="font-mono text-sm font-medium">CASE-2024-0143</p>
              </div>
              <div>
                <label className="report-card-label">Date</label>
                <p className="text-sm">January 14, 2024</p>
              </div>
              <div>
                <label className="report-card-label">Tissue Type</label>
                <p className="text-sm">Lung adenocarcinoma</p>
              </div>
              <div>
                <label className="report-card-label">Overall Confidence</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-success rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-success">94%</span>
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
                <span className="font-medium">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="font-mono text-xs">2:34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model Version</span>
                <span className="font-mono text-xs">v2.1</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Action */}
        <div className="p-4 border-t">
          <Button className="w-full" onClick={onSave}>
            <Archive className="w-4 h-4 mr-2" />
            Save Case Locally
          </Button>
        </div>
      </div>
    </div>
  );
}
