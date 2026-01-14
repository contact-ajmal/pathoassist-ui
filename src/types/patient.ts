export interface PatientRecord {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Contact Info
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Medical Info
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
  primaryPhysician?: string;
  referringPhysician?: string;
  
  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  
  // Emergency Contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Clinical Notes
  clinicalNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  source: 'manual' | 'hl7' | 'fhir' | 'epic' | 'cerner';
}

export interface ExternalSystem {
  id: string;
  name: string;
  type: 'hl7' | 'fhir' | 'epic' | 'cerner' | 'allscripts' | 'meditech';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  icon: string;
}

export const EXTERNAL_SYSTEMS: ExternalSystem[] = [
  { id: 'epic', name: 'Epic MyChart', type: 'epic', status: 'disconnected', icon: 'Hospital' },
  { id: 'cerner', name: 'Cerner PowerChart', type: 'cerner', status: 'disconnected', icon: 'Building2' },
  { id: 'hl7', name: 'HL7 v2 Interface', type: 'hl7', status: 'disconnected', icon: 'Network' },
  { id: 'fhir', name: 'FHIR R4 API', type: 'fhir', status: 'disconnected', icon: 'Globe' },
  { id: 'allscripts', name: 'Allscripts EHR', type: 'allscripts', status: 'disconnected', icon: 'FileHeart' },
  { id: 'meditech', name: 'MEDITECH Expanse', type: 'meditech', status: 'disconnected', icon: 'Server' },
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];
