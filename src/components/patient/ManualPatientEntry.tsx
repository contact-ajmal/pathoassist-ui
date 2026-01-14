import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, AlertTriangle, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PatientRecord, BLOOD_TYPES, GENDER_OPTIONS } from '@/types/patient';
import { toast } from 'sonner';

interface ManualPatientEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patient: Partial<PatientRecord>) => void;
  existingPatient?: Partial<PatientRecord>;
}

export function ManualPatientEntry({ open, onOpenChange, onSave, existingPatient }: ManualPatientEntryProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [dob, setDob] = useState<Date | undefined>(
    existingPatient?.dateOfBirth ? new Date(existingPatient.dateOfBirth) : undefined
  );
  const [allergies, setAllergies] = useState<string[]>(existingPatient?.allergies || []);
  const [medications, setMedications] = useState<string[]>(existingPatient?.medications || []);
  const [medicalHistory, setMedicalHistory] = useState<string[]>(existingPatient?.medicalHistory || []);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const [formData, setFormData] = useState({
    mrn: existingPatient?.mrn || '',
    firstName: existingPatient?.firstName || '',
    lastName: existingPatient?.lastName || '',
    gender: existingPatient?.gender || '',
    email: existingPatient?.email || '',
    phone: existingPatient?.phone || '',
    street: existingPatient?.address?.street || '',
    city: existingPatient?.address?.city || '',
    state: existingPatient?.address?.state || '',
    zipCode: existingPatient?.address?.zipCode || '',
    country: existingPatient?.address?.country || 'United States',
    bloodType: existingPatient?.bloodType || '',
    primaryPhysician: existingPatient?.primaryPhysician || '',
    referringPhysician: existingPatient?.referringPhysician || '',
    insuranceProvider: existingPatient?.insuranceProvider || '',
    insurancePolicyNumber: existingPatient?.insurancePolicyNumber || '',
    insuranceGroupNumber: existingPatient?.insuranceGroupNumber || '',
    emergencyContactName: existingPatient?.emergencyContact?.name || '',
    emergencyContactRelationship: existingPatient?.emergencyContact?.relationship || '',
    emergencyContactPhone: existingPatient?.emergencyContact?.phone || '',
    clinicalNotes: existingPatient?.clinicalNotes || '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (type: 'allergy' | 'medication' | 'condition') => {
    switch (type) {
      case 'allergy':
        if (newAllergy.trim()) {
          setAllergies([...allergies, newAllergy.trim()]);
          setNewAllergy('');
        }
        break;
      case 'medication':
        if (newMedication.trim()) {
          setMedications([...medications, newMedication.trim()]);
          setNewMedication('');
        }
        break;
      case 'condition':
        if (newCondition.trim()) {
          setMedicalHistory([...medicalHistory, newCondition.trim()]);
          setNewCondition('');
        }
        break;
    }
  };

  const removeItem = (type: 'allergy' | 'medication' | 'condition', index: number) => {
    switch (type) {
      case 'allergy':
        setAllergies(allergies.filter((_, i) => i !== index));
        break;
      case 'medication':
        setMedications(medications.filter((_, i) => i !== index));
        break;
      case 'condition':
        setMedicalHistory(medicalHistory.filter((_, i) => i !== index));
        break;
    }
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.mrn) {
      toast.error('Please fill in required fields: First Name, Last Name, and MRN');
      return;
    }

    const patient: Partial<PatientRecord> = {
      id: existingPatient?.id || crypto.randomUUID(),
      mrn: formData.mrn,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: dob?.toISOString() || '',
      gender: formData.gender as PatientRecord['gender'],
      email: formData.email,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      bloodType: formData.bloodType,
      allergies,
      medications,
      medicalHistory,
      primaryPhysician: formData.primaryPhysician,
      referringPhysician: formData.referringPhysician,
      insuranceProvider: formData.insuranceProvider,
      insurancePolicyNumber: formData.insurancePolicyNumber,
      insuranceGroupNumber: formData.insuranceGroupNumber,
      emergencyContact: {
        name: formData.emergencyContactName,
        relationship: formData.emergencyContactRelationship,
        phone: formData.emergencyContactPhone,
      },
      clinicalNotes: formData.clinicalNotes,
      source: 'manual',
      createdAt: existingPatient?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(patient);
    toast.success('Patient record saved successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {existingPatient ? 'Edit Patient Record' : 'New Patient Entry'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="m-0 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    MRN <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    placeholder="Medical Record Number"
                    value={formData.mrn}
                    onChange={(e) => updateField('mrn', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dob && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, 'PPP') : 'Select date of birth'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Type</Label>
                  <Select value={formData.bloodType} onValueChange={(v) => updateField('bloodType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="patient@email.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input 
                    placeholder="123 Main Street"
                    value={formData.street}
                    onChange={(e) => updateField('street', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input 
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input 
                      placeholder="12345"
                      value={formData.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input 
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-sm text-muted-foreground">Emergency Contact</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input 
                    placeholder="Full name"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input 
                    placeholder="e.g., Spouse, Parent"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => updateField('emergencyContactRelationship', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    placeholder="(555) 123-4567"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Medical Tab */}
            <TabsContent value="medical" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Physician</Label>
                  <Input 
                    placeholder="Dr. John Smith"
                    value={formData.primaryPhysician}
                    onChange={(e) => updateField('primaryPhysician', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referring Physician</Label>
                  <Input 
                    placeholder="Dr. Jane Doe"
                    value={formData.referringPhysician}
                    onChange={(e) => updateField('referringPhysician', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Allergies */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allergies.length === 0 && (
                      <span className="text-sm text-muted-foreground">No known allergies</span>
                    )}
                    {allergies.map((allergy, i) => (
                      <Badge key={i} variant="outline" className="bg-warning/10 text-warning border-warning/30 pr-1">
                        {allergy}
                        <button onClick={() => removeItem('allergy', i)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add allergy..."
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem('allergy')}
                    />
                    <Button variant="outline" size="icon" onClick={() => addItem('allergy')}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {medications.length === 0 && (
                      <span className="text-sm text-muted-foreground">No current medications</span>
                    )}
                    {medications.map((med, i) => (
                      <Badge key={i} variant="outline" className="pr-1">
                        {med}
                        <button onClick={() => removeItem('medication', i)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add medication..."
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem('medication')}
                    />
                    <Button variant="outline" size="icon" onClick={() => addItem('medication')}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Medical History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Medical History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {medicalHistory.length === 0 && (
                      <span className="text-sm text-muted-foreground">No significant medical history</span>
                    )}
                    {medicalHistory.map((condition, i) => (
                      <Badge key={i} variant="outline" className="bg-muted pr-1">
                        {condition}
                        <button onClick={() => removeItem('condition', i)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add condition..."
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem('condition')}
                    />
                    <Button variant="outline" size="icon" onClick={() => addItem('condition')}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance Tab */}
            <TabsContent value="insurance" className="m-0 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Insurance Provider</Label>
                  <Input 
                    placeholder="e.g., Blue Cross Blue Shield"
                    value={formData.insuranceProvider}
                    onChange={(e) => updateField('insuranceProvider', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Policy Number</Label>
                  <Input 
                    placeholder="Policy ID"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => updateField('insurancePolicyNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Group Number</Label>
                  <Input 
                    placeholder="Group ID"
                    value={formData.insuranceGroupNumber}
                    onChange={(e) => updateField('insuranceGroupNumber', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="m-0 space-y-4">
              <div className="space-y-2">
                <Label>Clinical Notes</Label>
                <Textarea 
                  placeholder="Additional clinical notes, relevant history, or special instructions..."
                  className="min-h-[200px] resize-none"
                  value={formData.clinicalNotes}
                  onChange={(e) => updateField('clinicalNotes', e.target.value)}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Patient Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
