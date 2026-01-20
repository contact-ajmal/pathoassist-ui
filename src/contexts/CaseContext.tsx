/**
 * Case Context - Manages current case state across the application
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  CaseStatus,
  SlideMetadata,
  WSIProcessingResult,
  ROIResult,
  AnalysisResult,
  StructuredReport,
} from '@/types/api';
import { PatientRecord } from '@/types/patient';

interface CaseState {
  caseId: string | null;
  status: CaseStatus | null;
  filename: string | null;
  metadata: SlideMetadata | null;
  processingResult: WSIProcessingResult | null;
  roiResult: ROIResult | null;
  analysisResult: AnalysisResult | null;
  report: StructuredReport | null;
  patientData: PatientRecord | null;
  clinicalContext: string | null;
}

interface CaseContextType extends CaseState {
  // Actions
  setCaseId: (caseId: string | null) => void;
  setStatus: (status: CaseStatus) => void;
  setFilename: (filename: string) => void;
  setMetadata: (metadata: SlideMetadata) => void;
  setProcessingResult: (result: WSIProcessingResult) => void;
  setRoiResult: (result: ROIResult) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setReport: (report: StructuredReport) => void;
  setPatientData: (patient: PatientRecord | null) => void;
  setClinicalContext: (context: string | null) => void;
  resetCase: () => void;
}

const initialState: CaseState = {
  caseId: null,
  status: null,
  filename: null,
  metadata: null,
  processingResult: null,
  roiResult: null,
  analysisResult: null,
  report: null,
  patientData: null,
  clinicalContext: null,
};

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CaseState>(initialState);

  const setCaseId = useCallback((caseId: string | null) => {
    setState((prev) => ({ ...prev, caseId }));
  }, []);

  const setStatus = useCallback((status: CaseStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const setFilename = useCallback((filename: string) => {
    setState((prev) => ({ ...prev, filename }));
  }, []);

  const setMetadata = useCallback((metadata: SlideMetadata) => {
    setState((prev) => ({ ...prev, metadata }));
  }, []);

  const setProcessingResult = useCallback((processingResult: WSIProcessingResult) => {
    setState((prev) => ({ ...prev, processingResult }));
  }, []);

  const setRoiResult = useCallback((roiResult: ROIResult) => {
    setState((prev) => ({ ...prev, roiResult }));
  }, []);

  const setAnalysisResult = useCallback((analysisResult: AnalysisResult) => {
    setState((prev) => ({ ...prev, analysisResult }));
  }, []);

  const setReport = useCallback((report: StructuredReport) => {
    setState((prev) => ({ ...prev, report }));
  }, []);

  const setPatientData = useCallback((patientData: PatientRecord | null) => {
    setState((prev) => ({ ...prev, patientData }));
  }, []);

  const setClinicalContext = useCallback((clinicalContext: string | null) => {
    setState((prev) => ({ ...prev, clinicalContext }));
  }, []);

  const resetCase = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <CaseContext.Provider
      value={{
        ...state,
        setCaseId,
        setStatus,
        setFilename,
        setMetadata,
        setProcessingResult,
        setRoiResult,
        setAnalysisResult,
        setReport,
        setPatientData,
        setClinicalContext,
        resetCase,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
}
