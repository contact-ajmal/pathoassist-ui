import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { WorkflowSidebar } from '@/components/layout/WorkflowSidebar';
import { UploadScreen } from '@/components/screens/UploadScreen';
import { ViewerScreen } from '@/components/screens/ViewerScreen';
import { ROIScreen } from '@/components/screens/ROIScreen';
import { AnalysisScreen } from '@/components/screens/AnalysisScreen';
import { ReviewScreen } from '@/components/screens/ReviewScreen';
import { ExportScreen } from '@/components/screens/ExportScreen';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { PatientManagementModal } from '@/components/patient/PatientManagementModal';
import { WorkflowStep } from '@/types/workflow';
import { PatientRecord } from '@/types/patient';
import { toast } from 'sonner';
import { useCase } from '@/contexts/CaseContext';
import { listCases, getMetadata, getPatches } from '@/lib/api';

export default function Index() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const { caseId, setCaseId, setFilename, setStatus, setMetadata, setProcessingResult } = useCase();

  // Auto-load the most recent case if none is selected
  useEffect(() => {
    const loadRecentCase = async () => {
      if (caseId) return; // Already have a case loaded

      try {
        const cases = await listCases();
        // Find a case that's ready for viewing (roi_pending or later)
        const readyCase = cases.find(c =>
          c.status === 'roi_pending' ||
          c.status === 'completed' ||
          c.status === 'analyzing'
        );

        if (readyCase) {
          console.log('Auto-loading recent case:', readyCase.case_id);
          setCaseId(readyCase.case_id);
          if (readyCase.filename) setFilename(readyCase.filename);
          setStatus(readyCase.status);

          // Load metadata and patches
          const [metadata, patches] = await Promise.all([
            getMetadata(readyCase.case_id),
            getPatches(readyCase.case_id),
          ]);

          setMetadata(metadata);
          setProcessingResult(patches);

          // Mark upload as complete and go to viewer
          setCompletedSteps(['upload']);
          setCurrentStep('viewer');

          toast.success(`Loaded recent case: ${readyCase.filename || readyCase.case_id}`);
        }
      } catch (err) {
        console.warn('Could not auto-load recent case:', err);
      }
    };

    loadRecentCase();
  }, [caseId, setCaseId, setFilename, setStatus, setMetadata, setProcessingResult]);

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

  const handlePatientSelect = (patient: PatientRecord) => {
    setSelectedPatient(patient);
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
        onPatientClick={() => setPatientModalOpen(true)}
        selectedPatient={selectedPatient}
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

      <PatientManagementModal
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
        onPatientSelect={handlePatientSelect}
        selectedPatient={selectedPatient}
      />
    </div>
  );
}
