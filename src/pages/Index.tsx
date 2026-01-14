import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { WorkflowSidebar } from '@/components/layout/WorkflowSidebar';
import { UploadScreen } from '@/components/screens/UploadScreen';
import { ViewerScreen } from '@/components/screens/ViewerScreen';
import { ROIScreen } from '@/components/screens/ROIScreen';
import { AnalysisScreen } from '@/components/screens/AnalysisScreen';
import { ReviewScreen } from '@/components/screens/ReviewScreen';
import { ExportScreen } from '@/components/screens/ExportScreen';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { WorkflowStep } from '@/types/workflow';
import { toast } from 'sonner';

export default function Index() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const completeStep = (step: WorkflowStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const goToStep = (step: WorkflowStep) => {
    setCurrentStep(step);
  };

  const handleProceed = (from: WorkflowStep, to: WorkflowStep) => {
    completeStep(from);
    setCurrentStep(to);
  };

  const handleExportClick = () => {
    if (currentStep === 'export') {
      toast.success('Report exported successfully');
    } else {
      toast.info('Complete the workflow to export the report');
    }
  };

  const handleSaveCase = () => {
    toast.success('Case saved to local archive');
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 'upload':
        return <UploadScreen onProceed={() => handleProceed('upload', 'viewer')} />;
      case 'viewer':
        return <ViewerScreen onProceed={() => handleProceed('viewer', 'roi')} />;
      case 'roi':
        return <ROIScreen onProceed={() => handleProceed('roi', 'analysis')} />;
      case 'analysis':
        return <AnalysisScreen onProceed={() => handleProceed('analysis', 'review')} />;
      case 'review':
        return <ReviewScreen onProceed={() => handleProceed('review', 'export')} />;
      case 'export':
        return <ExportScreen onSave={handleSaveCase} />;
      default:
        return <UploadScreen onProceed={() => handleProceed('upload', 'viewer')} />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header 
        onSettingsClick={() => setSettingsOpen(true)} 
        onExportClick={handleExportClick}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <WorkflowSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
        
        <main className="flex-1 overflow-hidden bg-background">
          {renderScreen()}
        </main>
      </div>

      <SettingsModal 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </div>
  );
}
