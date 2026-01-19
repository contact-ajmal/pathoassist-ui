import { Settings, Download, MonitorDot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientRecord } from '@/types/patient';

interface HeaderProps {
  onSettingsClick: () => void;
  onExportClick: () => void;
  onPatientClick: () => void;
  selectedPatient?: PatientRecord | null;
}

export function Header({ onSettingsClick, onExportClick, onPatientClick, selectedPatient }: HeaderProps) {
  return (
    <header className="h-14 bg-header text-header-foreground border-b border-sidebar-border flex items-center justify-between px-4 shrink-0">
      {/* Logo and App Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <MonitorDot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight">PathoAssist</h1>
          <p className="text-[10px] text-header-foreground/60 -mt-0.5">Offline WSI Pathology Report Generator</p>
        </div>
      </div>

      {/* Center - Status & Patient */}
      <div className="flex items-center gap-6">

        {/* Patient Indicator */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPatientClick}
          className="h-9 px-3 text-header-foreground/90 hover:text-header-foreground hover:bg-header-foreground/10 border border-header-foreground/20"
        >
          <User className="w-4 h-4 mr-2" />
          {selectedPatient ? (
            <span className="font-medium">
              {selectedPatient.lastName}, {selectedPatient.firstName}
              <span className="ml-2 text-xs text-header-foreground/60 font-mono">
                {selectedPatient.mrn}
              </span>
            </span>
          ) : (
            <span>Select Patient</span>
          )}
        </Button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportClick}
          className="text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Report
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10"
        >
          <Settings className="w-4 h-4 mr-1.5" />
          Settings
        </Button>
      </div>
    </header>
  );
}
