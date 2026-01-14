import { Check, Upload, Microscope, Grid3X3, Brain, FileText, Archive } from 'lucide-react';
import { WorkflowStep, WORKFLOW_STEPS } from '@/types/workflow';
import { cn } from '@/lib/utils';

interface WorkflowSidebarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick: (step: WorkflowStep) => void;
}

const iconMap = {
  Upload,
  Microscope,
  Grid3X3,
  Brain,
  FileText,
  Archive,
};

export function WorkflowSidebar({ currentStep, completedSteps, onStepClick }: WorkflowSidebarProps) {
  const getStepStatus = (stepId: WorkflowStep) => {
    if (stepId === currentStep) return 'active';
    if (completedSteps.includes(stepId)) return 'completed';
    return 'pending';
  };

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Navigation Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider">Workflow</h2>
      </div>

      {/* Steps */}
      <nav className="flex-1 p-3 space-y-1">
        {WORKFLOW_STEPS.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = iconMap[step.icon as keyof typeof iconMap];

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={cn(
                'workflow-step w-full',
                status === 'active' && 'workflow-step-active',
                status === 'completed' && 'workflow-step-completed'
              )}
            >
              {/* Step Number / Check */}
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                status === 'active' && 'bg-sidebar-primary text-sidebar-primary-foreground',
                status === 'completed' && 'bg-sidebar-primary/20 text-sidebar-primary',
                status === 'pending' && 'bg-sidebar-accent text-sidebar-muted'
              )}>
                {status === 'completed' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  step.number
                )}
              </div>

              {/* Icon */}
              <Icon className={cn(
                'w-4 h-4 shrink-0',
                status === 'active' && 'text-sidebar-primary',
                status === 'completed' && 'text-sidebar-primary',
                status === 'pending' && 'text-sidebar-muted'
              )} />

              {/* Label */}
              <span className="text-sm truncate">{step.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-muted">
          <p className="font-medium text-sidebar-foreground/60">PathoAssist v1.0</p>
          <p className="mt-0.5">Decision Support Only</p>
        </div>
      </div>
    </aside>
  );
}
