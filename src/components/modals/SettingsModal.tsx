
import { X, Shield, Cpu, FileText, AlertTriangle, Save, Loader2, Server, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getSettings, updateSettings, listTemplates, uploadTemplate } from '@/lib/api';
import { SystemSettings } from '@/types/api';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modelName, setModelName] = useState('google/medgemma-1.5-4b-it');
  const [inferenceMode, setInferenceMode] = useState('cpu');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [maxTokens, setMaxTokens] = useState([4096]);
  const [temperature, setTemperature] = useState([0.7]);
  const [template, setTemplate] = useState('clinical');
  const [availableTemplates, setAvailableTemplates] = useState<string[]>(['clinical']);
  const [confidenceThreshold, setConfidenceThreshold] = useState([60]);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Load Settings
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [settings, templates] = await Promise.all([
        getSettings(),
        listTemplates()
      ]);

      setAvailableTemplates(templates);

      setModelName(settings.model_name);

      // Determine mode logic
      if (settings.remote_inference_url) {
        setInferenceMode('remote');
        setRemoteUrl(settings.remote_inference_url);
      } else {
        setInferenceMode(settings.inference_mode);
        setRemoteUrl('');
      }

      setMaxTokens([settings.max_tokens]);
      setTemperature([settings.temperature]);
      setTemplate(settings.report_template);
      setConfidenceThreshold([Math.round(settings.confidence_threshold * 100)]);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load configuration. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare payload
      const payload: SystemSettings = {
        model_name: modelName,
        inference_mode: inferenceMode === 'remote' ? 'cpu' : inferenceMode, // Remote uses CPU locally for request handling
        remote_inference_url: inferenceMode === 'remote' ? remoteUrl : null,
        remote_api_key: null,
        max_tokens: maxTokens[0],
        temperature: temperature[0],
        report_template: template,
        confidence_threshold: confidenceThreshold[0] / 100,
      };

      await updateSettings(payload);
      toast.success('Settings saved successfully');
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast.error('Only .txt template files are supported');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadTemplate(file);
      toast.success(`Template "${result.filename}" uploaded`);

      // Refresh list and select new template
      const templates = await listTemplates();
      setAvailableTemplates(templates);
      setTemplate(result.filename);

    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload template');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure AI model, inference backend, and report parameters.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            <p>{error}</p>
            <Button variant="link" onClick={loadData} className="mt-2">Retry</Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">

            {/* AI Backend Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                <Server className="w-4 h-4 text-primary" />
                Inference Backend
              </h3>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Execution Mode</Label>
                  <Select value={inferenceMode} onValueChange={setInferenceMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu">Local CPU (Universal)</SelectItem>
                      <SelectItem value="gpu">Local GPU (Requires CUDA)</SelectItem>
                      <SelectItem value="remote">Remote Service (Colab/Ngrok)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inferenceMode === 'remote' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Remote API URL</Label>
                    <Input
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value)}
                      placeholder="https://....ngrok-free.app"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the public URL of your remote Google MedGemma instance.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Model Parameters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                <Cpu className="w-4 h-4 text-primary" />
                Model Parameters
              </h3>

              <div className="space-y-2">
                <Label>Model Name</Label>
                <Select value={modelName} onValueChange={setModelName}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google/medgemma-1.5-4b-it">Google MedGemma 4B (Default)</SelectItem>
                    <SelectItem value="google/gemma-2b-it">Gemma 2B (Faster)</SelectItem>
                    <SelectItem value="google/gemma-7b-it">Gemma 7B (High VRAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Temperature (Creativity)</Label>
                  <span className="text-xs font-mono">{temperature[0]}</span>
                </div>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Max Tokens (Length)</Label>
                  <span className="text-xs font-mono">{maxTokens[0]}</span>
                </div>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  min={512}
                  max={8192}
                  step={512}
                />
              </div>
            </div>

            <Separator />

            {/* Report Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                <FileText className="w-4 h-4 text-primary" />
                Report Configuration
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Template Format</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-3 h-3" />
                    {uploading ? 'Uploading...' : 'Upload .txt'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t} Report
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose a template or upload a custom .txt file.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Confidence Threshold</Label>
                  <span className="text-xs font-mono">{confidenceThreshold[0]}%</span>
                </div>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  min={10}
                  max={90}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum confidence required to include a finding in the report.
                </p>
              </div>
            </div>

            <Separator />

            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Changing Model or Inference Mode will trigger a reload of the AI engine.
                This may take a few moments.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

