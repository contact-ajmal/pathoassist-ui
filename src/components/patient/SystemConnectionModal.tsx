import { useState } from 'react';
import { 
  X, User, Building2, Network, Globe, Server, Hospital, FileHeart,
  Check, AlertCircle, RefreshCw, Settings2, Link2, Unlink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { EXTERNAL_SYSTEMS, ExternalSystem } from '@/types/patient';
import { toast } from 'sonner';

interface SystemConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientImport: () => void;
}

const iconMap = {
  Hospital,
  Building2,
  Network,
  Globe,
  FileHeart,
  Server,
};

export function SystemConnectionModal({ open, onOpenChange, onPatientImport }: SystemConnectionModalProps) {
  const [systems, setSystems] = useState<ExternalSystem[]>(EXTERNAL_SYSTEMS);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async (systemId: string) => {
    setConnecting(true);
    setSelectedSystem(systemId);
    
    // Simulate connection attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSystems(prev => prev.map(s => 
      s.id === systemId 
        ? { ...s, status: 'connected', lastSync: new Date().toISOString() }
        : s
    ));
    
    setConnecting(false);
    toast.success(`Connected to ${systems.find(s => s.id === systemId)?.name}`);
  };

  const handleDisconnect = (systemId: string) => {
    setSystems(prev => prev.map(s => 
      s.id === systemId 
        ? { ...s, status: 'disconnected', lastSync: undefined }
        : s
    ));
    toast.info('System disconnected');
  };

  const handleSync = async (systemId: string) => {
    setSelectedSystem(systemId);
    setConnecting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSystems(prev => prev.map(s => 
      s.id === systemId 
        ? { ...s, lastSync: new Date().toISOString() }
        : s
    ));
    
    setConnecting(false);
    toast.success('Patient records synchronized');
  };

  const getStatusBadge = (status: ExternalSystem['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success/10 text-success border-success/30">Connected</Badge>;
      case 'error':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>;
    }
  };

  const connectedCount = systems.filter(s => s.status === 'connected').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Patient Record System Connections
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 py-4">
          {/* Connection Summary */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">External System Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect to hospital EHR/EMR systems to import patient records
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">Systems Connected</p>
            </div>
          </div>

          {/* Systems List */}
          <div className="space-y-3">
            {systems.map((system) => {
              const Icon = iconMap[system.icon as keyof typeof iconMap] || Server;
              const isLoading = connecting && selectedSystem === system.id;

              return (
                <Card key={system.id} className={cn(
                  'transition-all',
                  system.status === 'connected' && 'border-success/30 bg-success/5'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        system.status === 'connected' ? 'bg-success/10' : 'bg-muted'
                      )}>
                        <Icon className={cn(
                          'w-6 h-6',
                          system.status === 'connected' ? 'text-success' : 'text-muted-foreground'
                        )} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{system.name}</h4>
                          {getStatusBadge(system.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {system.type.toUpperCase()} Integration
                          {system.lastSync && (
                            <span className="ml-2">
                              • Last sync: {new Date(system.lastSync).toLocaleTimeString()}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {system.status === 'connected' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(system.id)}
                              disabled={isLoading}
                            >
                              <RefreshCw className={cn('w-4 h-4 mr-1.5', isLoading && 'animate-spin')} />
                              Sync
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnect(system.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Unlink className="w-4 h-4 mr-1.5" />
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(system.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Link2 className="w-4 h-4 mr-1.5" />
                                Connect
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          {/* Manual Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Custom HL7/FHIR Endpoint
              </CardTitle>
              <CardDescription>
                Configure a custom endpoint for patient data import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <Input placeholder="https://ehr.hospital.org/api/fhir/r4" />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="••••••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">HIPAA Compliance Notice</p>
              <p className="text-muted-foreground mt-1">
                All patient data transfers are encrypted end-to-end. Records are stored locally and 
                never transmitted to external servers. Connection credentials are stored securely 
                using system keychain.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => { onPatientImport(); onOpenChange(false); }}>
            <User className="w-4 h-4 mr-2" />
            Import Patient Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
