import { Settings, Download, Cpu, MonitorDot, HardDrive, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSettingsClick: () => void;
  onExportClick: () => void;
}

export function Header({ onSettingsClick, onExportClick }: HeaderProps) {
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

      {/* Center - Status */}
      <div className="flex items-center gap-6">
        {/* Offline Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 rounded-full">
            <Wifi className="w-3 h-3 text-primary-foreground/80" />
            <span className="text-xs font-medium">Offline Mode</span>
          </div>
          <span className="text-xs text-header-foreground/60">Local AI Ready</span>
        </div>

        {/* Hardware Status */}
        <div className="flex items-center gap-3">
          <div className="hardware-indicator">
            <Cpu className="w-3.5 h-3.5 text-success" />
            <span className="text-header-foreground/80">CPU 24%</span>
          </div>
          <div className="hardware-indicator">
            <HardDrive className="w-3.5 h-3.5 text-success" />
            <span className="text-header-foreground/80">GPU 0%</span>
          </div>
          <div className="hardware-indicator">
            <MonitorDot className="w-3.5 h-3.5 text-warning" />
            <span className="text-header-foreground/80">RAM 4.2GB</span>
          </div>
        </div>
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
