import { useState } from 'react';
import { format } from 'date-fns';
import { 
  User, UserPlus, Network, Search, Edit2, Trash2, 
  Phone, Mail, Calendar, Droplet, AlertTriangle, 
  Stethoscope, Shield, FileText, MoreVertical, X,
  ChevronRight, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PatientRecord } from '@/types/patient';
import { SystemConnectionModal } from './SystemConnectionModal';
import { ManualPatientEntry } from './ManualPatientEntry';
import { toast } from 'sonner';

interface PatientManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientSelect: (patient: PatientRecord) => void;
  selectedPatient?: PatientRecord | null;
}

// Mock patient data
const mockPatients: PatientRecord[] = [
  {
    id: '1',
    mrn: 'MRN-2024-0001',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1969-03-15',
    gender: 'male',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Latex'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    medicalHistory: ['Type 2 Diabetes', 'Hypertension'],
    primaryPhysician: 'Dr. Sarah Johnson',
    referringPhysician: 'Dr. Michael Chen',
    source: 'manual',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
  },
  {
    id: '2',
    mrn: 'MRN-2024-0002',
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: '1985-07-22',
    gender: 'female',
    email: 'emily.davis@email.com',
    phone: '(555) 987-6543',
    bloodType: 'O-',
    allergies: [],
    medications: [],
    medicalHistory: ['Breast cancer (remission)'],
    primaryPhysician: 'Dr. Lisa Wang',
    source: 'epic',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
  },
];

export function PatientManagementModal({ 
  open, 
  onOpenChange, 
  onPatientSelect,
  selectedPatient 
}: PatientManagementModalProps) {
  const [patients, setPatients] = useState<PatientRecord[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'profile'>('list');
  const [viewingPatient, setViewingPatient] = useState<PatientRecord | null>(selectedPatient || null);
  const [showSystemConnection, setShowSystemConnection] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);

  const filteredPatients = patients.filter(p => 
    p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewPatient = (patient: PatientRecord) => {
    setViewingPatient(patient);
    setActiveTab('profile');
  };

  const handleSelectPatient = (patient: PatientRecord) => {
    onPatientSelect(patient);
    toast.success(`Selected patient: ${patient.firstName} ${patient.lastName}`);
    onOpenChange(false);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter(p => p.id !== patientId));
    if (viewingPatient?.id === patientId) {
      setViewingPatient(null);
      setActiveTab('list');
    }
    toast.success('Patient record removed');
  };

  const handleSavePatient = (patient: Partial<PatientRecord>) => {
    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? { ...p, ...patient } as PatientRecord : p));
      setViewingPatient({ ...editingPatient, ...patient } as PatientRecord);
    } else {
      setPatients([patient as PatientRecord, ...patients]);
    }
    setEditingPatient(null);
  };

  const handleEditPatient = (patient: PatientRecord) => {
    setEditingPatient(patient);
    setShowManualEntry(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSourceBadge = (source: PatientRecord['source']) => {
    const styles = {
      manual: 'bg-muted text-muted-foreground',
      epic: 'bg-primary/10 text-primary',
      cerner: 'bg-accent/10 text-accent',
      hl7: 'bg-success/10 text-success',
      fhir: 'bg-warning/10 text-warning',
    };
    return <Badge variant="outline" className={cn('text-xs', styles[source])}>{source.toUpperCase()}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Patient Management
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'profile')} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b bg-muted/30">
              <TabsList>
                <TabsTrigger value="list">Patient List</TabsTrigger>
                <TabsTrigger value="profile" disabled={!viewingPatient}>
                  Patient Profile
                  {viewingPatient && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({viewingPatient.firstName} {viewingPatient.lastName})
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Patient List Tab */}
            <TabsContent value="list" className="flex-1 flex flex-col m-0 overflow-hidden">
              {/* Search and Actions Bar */}
              <div className="px-6 py-4 border-b flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or MRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowSystemConnection(true)}>
                    <Network className="w-4 h-4 mr-2" />
                    Connect System
                  </Button>
                  <Button onClick={() => { setEditingPatient(null); setShowManualEntry(true); }}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </div>

              {/* Patient List */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-3">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="w-12 h-12 mx-auto text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">No patients found</p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowManualEntry(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add First Patient
                      </Button>
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <Card 
                        key={patient.id} 
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          selectedPatient?.id === patient.id && 'ring-2 ring-primary'
                        )}
                        onClick={() => handleViewPatient(patient)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-lg font-semibold text-primary">
                                {patient.firstName[0]}{patient.lastName[0]}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold truncate">
                                  {patient.lastName}, {patient.firstName}
                                </h4>
                                {getSourceBadge(patient.source)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="font-mono">{patient.mrn}</span>
                                <span>•</span>
                                <span>{calculateAge(patient.dateOfBirth)} years old</span>
                                <span>•</span>
                                <span className="capitalize">{patient.gender}</span>
                                {patient.bloodType && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Droplet className="w-3 h-3" />
                                      {patient.bloodType}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Allergies Warning */}
                            {patient.allergies && patient.allergies.length > 0 && (
                              <div className="flex items-center gap-1 text-warning">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-medium">{patient.allergies.length} allergies</span>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleSelectPatient(patient); }}
                              >
                                Select
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewPatient(patient); }}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPatient(patient); }}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.id); }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Patient Profile Tab */}
            <TabsContent value="profile" className="flex-1 m-0 overflow-hidden">
              {viewingPatient && (
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl font-semibold text-primary">
                            {viewingPatient.firstName[0]}{viewingPatient.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">
                            {viewingPatient.firstName} {viewingPatient.lastName}
                          </h2>
                          <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                            <span className="font-mono">{viewingPatient.mrn}</span>
                            {getSourceBadge(viewingPatient.source)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPatient(viewingPatient)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleSelectPatient(viewingPatient)}>
                          Select Patient
                        </Button>
                      </div>
                    </div>

                    {/* Allergies Alert */}
                    {viewingPatient.allergies && viewingPatient.allergies.length > 0 && (
                      <Card className="border-warning/50 bg-warning/5">
                        <CardContent className="p-4 flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-warning" />
                          <div>
                            <p className="font-semibold text-warning">Known Allergies</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {viewingPatient.allergies.map((allergy, i) => (
                                <Badge key={i} variant="outline" className="bg-warning/10 text-warning border-warning/30">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      {/* Demographics */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Demographics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date of Birth</span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(viewingPatient.dateOfBirth), 'PPP')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age</span>
                            <span>{calculateAge(viewingPatient.dateOfBirth)} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gender</span>
                            <span className="capitalize">{viewingPatient.gender}</span>
                          </div>
                          {viewingPatient.bloodType && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Blood Type</span>
                              <span className="flex items-center gap-2">
                                <Droplet className="w-4 h-4 text-destructive" />
                                {viewingPatient.bloodType}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Contact */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {viewingPatient.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{viewingPatient.email}</span>
                            </div>
                          )}
                          {viewingPatient.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{viewingPatient.phone}</span>
                            </div>
                          )}
                          {viewingPatient.address && (
                            <div className="text-sm text-muted-foreground">
                              {viewingPatient.address.street}<br />
                              {viewingPatient.address.city}, {viewingPatient.address.state} {viewingPatient.address.zipCode}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Medical */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Medical Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {viewingPatient.primaryPhysician && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Primary Physician</span>
                              <span>{viewingPatient.primaryPhysician}</span>
                            </div>
                          )}
                          {viewingPatient.referringPhysician && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Referring Physician</span>
                              <span>{viewingPatient.referringPhysician}</span>
                            </div>
                          )}
                          {viewingPatient.medications && viewingPatient.medications.length > 0 && (
                            <div>
                              <span className="text-muted-foreground text-sm">Current Medications</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {viewingPatient.medications.map((med, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{med}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {viewingPatient.medicalHistory && viewingPatient.medicalHistory.length > 0 && (
                            <div>
                              <span className="text-muted-foreground text-sm">Medical History</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {viewingPatient.medicalHistory.map((condition, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-muted">{condition}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Insurance */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Insurance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {viewingPatient.insuranceProvider ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Provider</span>
                                <span>{viewingPatient.insuranceProvider}</span>
                              </div>
                              {viewingPatient.insurancePolicyNumber && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Policy #</span>
                                  <span className="font-mono text-sm">{viewingPatient.insurancePolicyNumber}</span>
                                </div>
                              )}
                              {viewingPatient.insuranceGroupNumber && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Group #</span>
                                  <span className="font-mono text-sm">{viewingPatient.insuranceGroupNumber}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">No insurance information on file</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Clinical Notes */}
                    {viewingPatient.clinicalNotes && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Clinical Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{viewingPatient.clinicalNotes}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Record Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {format(new Date(viewingPatient.createdAt), 'PPp')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated: {format(new Date(viewingPatient.updatedAt), 'PPp')}
                        </span>
                      </div>
                      <span>Source: {viewingPatient.source.toUpperCase()}</span>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <SystemConnectionModal
        open={showSystemConnection}
        onOpenChange={setShowSystemConnection}
        onPatientImport={() => toast.info('Patient import dialog would open here')}
      />

      <ManualPatientEntry
        open={showManualEntry}
        onOpenChange={setShowManualEntry}
        onSave={handleSavePatient}
        existingPatient={editingPatient || undefined}
      />
    </>
  );
}
