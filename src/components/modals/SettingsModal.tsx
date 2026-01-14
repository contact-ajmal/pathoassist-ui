import { X, Shield, Cpu, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [model, setModel] = useState('patho-llm-v2');
  const [inferenceMode, setInferenceMode] = useState('gpu');
  const [template, setTemplate] = useState('standard');
  const [confidenceThreshold, setConfidenceThreshold] = useState([75]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patho-llm-v2">PathoLLM v2.1 (Recommended)</SelectItem>
                <SelectItem value="patho-llm-v1">PathoLLM v1.5 (Legacy)</SelectItem>
                <SelectItem value="patho-llm-lite">PathoLLM Lite (Fast)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the AI model for tissue analysis
            </p>
          </div>

          <Separator />

          {/* Inference Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Inference Mode
            </Label>
            <Select value={inferenceMode} onValueChange={setInferenceMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpu">GPU (CUDA) - Faster</SelectItem>
                <SelectItem value="cpu">CPU - Universal</SelectItem>
                <SelectItem value="auto">Auto-detect</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              GPU acceleration requires compatible NVIDIA hardware
            </p>
          </div>

          <Separator />

          {/* Report Template */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Default Report Template
            </Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Pathology Report</SelectItem>
                <SelectItem value="synoptic">Synoptic Format (CAP)</SelectItem>
                <SelectItem value="concise">Concise Summary</SelectItem>
                <SelectItem value="research">Research Protocol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Confidence Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Confidence Threshold</Label>
              <span className="text-sm font-mono text-muted-foreground">{confidenceThreshold[0]}%</span>
            </div>
            <Slider
              value={confidenceThreshold}
              onValueChange={setConfidenceThreshold}
              min={50}
              max={95}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Findings below this threshold will be flagged for review
            </p>
          </div>

          <Separator />

          {/* Privacy Notice */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All processing occurs <strong className="text-foreground">offline on this device</strong>. 
                No patient data or images are transmitted externally. 
                Slide images and reports remain stored locally.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              PathoAssist is a decision support tool. All AI-generated findings 
              must be reviewed and validated by qualified medical professionals.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
