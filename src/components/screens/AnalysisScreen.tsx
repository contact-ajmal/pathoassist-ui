import { useState, useEffect } from 'react';
import { Brain, Cpu, HardDrive, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AnalysisScreenProps {
  onProceed: () => void;
}

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
  message: string;
}

const initialSteps: AnalysisStep[] = [
  { id: 'preprocessing', label: 'Preprocessing', status: 'completed', progress: 100, message: 'Patches normalized' },
  { id: 'morphology', label: 'Tissue Morphology Analysis', status: 'completed', progress: 100, message: 'Cellular structures identified' },
  { id: 'features', label: 'Feature Extraction', status: 'active', progress: 65, message: 'Analyzing cellular features...' },
  { id: 'reasoning', label: 'Multimodal Reasoning', status: 'pending', progress: 0, message: 'Waiting...' },
  { id: 'report', label: 'Report Generation', status: 'pending', progress: 0, message: 'Waiting...' },
];

export function AnalysisScreen({ onProceed }: AnalysisScreenProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>(initialSteps);
  const [elapsedTime, setElapsedTime] = useState(47);

  // Simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setSteps(prev => {
        const activeIndex = prev.findIndex(s => s.status === 'active');
        if (activeIndex === -1) return prev;

        const updated = [...prev];
        const current = updated[activeIndex];
        
        if (current.progress < 100) {
          updated[activeIndex] = { ...current, progress: Math.min(current.progress + 5, 100) };
        } else if (activeIndex < updated.length - 1) {
          updated[activeIndex] = { ...current, status: 'completed' };
          updated[activeIndex + 1] = { ...updated[activeIndex + 1], status: 'active', progress: 10 };
        }
        
        return updated;
      });
    }, 500);
    return () => clearInterval(progressTimer);
  }, []);

  const overallProgress = Math.round(steps.reduce((acc, s) => acc + s.progress, 0) / steps.length);
  const isComplete = steps.every(s => s.status === 'completed');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex animate-fade-in">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className={cn('w-8 h-8 text-primary', !isComplete && 'animate-pulse-subtle')} />
            </div>
            <h2 className="text-2xl font-semibold">AI Analysis in Progress</h2>
            <p className="text-muted-foreground mt-1">
              Processing selected regions of interest
            </p>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Timeline */}
          <div className="progress-timeline space-y-0">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'progress-timeline-step',
                  step.status === 'active' && 'progress-timeline-step-active',
                  step.status === 'completed' && 'progress-timeline-step-completed'
                )}
              >
                <div className="ml-4">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      'font-medium',
                      step.status === 'pending' && 'text-muted-foreground'
                    )}>
                      {step.label}
                    </h4>
                    {step.status === 'active' && (
                      <span className="text-xs font-mono text-primary">{step.progress}%</span>
                    )}
                    {step.status === 'completed' && (
                      <span className="text-xs text-success">Complete</span>
                    )}
                  </div>
                  <p className={cn(
                    'text-sm mt-0.5',
                    step.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {step.message}
                  </p>
                  {step.status === 'active' && (
                    <Progress value={step.progress} className="h-1.5 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Status Messages */}
          {!isComplete && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground animate-pulse-subtle">
                {steps.find(s => s.status === 'active')?.message}
              </p>
            </div>
          )}

          {/* Action */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={onProceed}
              disabled={!isComplete}
              className="px-8"
            >
              {isComplete ? 'View Analysis Results' : 'Analysis in Progress...'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Hardware Stats */}
      <div className="w-72 border-l bg-card shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">System Resources</h3>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* Elapsed Time */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-mono font-semibold">{formatTime(elapsedTime)}</p>
                  <p className="text-xs text-muted-foreground">Elapsed Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CPU Usage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-mono">87%</span>
                </div>
                <Progress value={87} className="h-2" />
                <p className="text-xs text-muted-foreground">8 / 8 cores active</p>
              </div>
            </CardContent>
          </Card>

          {/* GPU Usage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                GPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-mono">92%</span>
                </div>
                <Progress value={92} className="h-2" />
                <p className="text-xs text-muted-foreground">VRAM: 7.2 / 8 GB</p>
              </div>
            </CardContent>
          </Card>

          {/* Memory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">RAM Usage</span>
                  <span className="font-mono">6.8 GB</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Info */}
        <div className="p-4 border-t text-xs text-muted-foreground">
          <p><span className="font-medium">Model:</span> PathoLLM v2.1</p>
          <p className="mt-1"><span className="font-medium">Mode:</span> GPU Inference</p>
        </div>
      </div>
    </div>
  );
}
