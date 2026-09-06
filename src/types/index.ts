export type UserRole = 'doctor' | 'patient' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'kn';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  isReady: boolean;
}

export interface Patient {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  location: string;
  preferredLanguage: LanguageCode;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  avatar: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  registrationNumber: string;
  hospital: string;
  department: string;
  avatar: string;
}

export type ConsultationStatus = 'DRAFT' | 'AI_PROCESSING' | 'AWAITING_REVIEW' | 'APPROVED';

export interface ConversationMessage {
  id: string;
  sender: 'patient' | 'ai' | 'doctor';
  text: string;
  originalLanguage: LanguageCode;
  translatedText?: string;
  timestamp: string;
  audioUrl?: string;
}

export interface ClinicalFinding {
  chiefComplaint: string;
  duration: string;
  onset?: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  associatedSymptoms: string[];
  reportedTemperature?: string;
  vitalNotes?: string;
  allergies: string;
  currentMedications: string;
  pastHistory: string;
  confidence: number;
}

export interface MissingParameter {
  id: string;
  label: string;
  category: 'vital' | 'symptom' | 'history' | 'medication';
  status: 'collected' | 'pending' | 'not_applicable';
  value?: string;
  importance: 'high' | 'medium' | 'low';
}

export interface SafetyFlag {
  id: string;
  symptom: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  alertMessage: string;
  clinicalRecommendation: string;
  detectedAt: string;
}

export interface SoapCase {
  subjective: {
    chiefComplaint: string;
    duration: string;
    historyOfPresentIllness: string;
    associatedSymptoms: string[];
    reportedTemperature: string;
    allergies: string;
    currentMedications: string;
  };
  objective: {
    reportedVitals: string;
    physicalNotes: string;
    labFindings: string;
  };
  assessment: {
    clinicalSummary: string;
    differentialConsiderations: string;
    redFlagsNoted: string[];
  };
  plan: {
    provisionalAdvice: string;
    recommendedInvestigations: string[];
    followUpInstructions: string;
    doctorSignature?: string;
    approvedAt?: string;
  };
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  language: LanguageCode;
  status: ConsultationStatus;
  messages: ConversationMessage[];
  findings: ClinicalFinding;
  missingInfo: MissingParameter[];
  safetyFlags: SafetyFlag[];
  soapCase: SoapCase;
  startedAt: string;
  endedAt?: string;
  approvedAt?: string;
  doctorNotes?: string;
  consentRecorded: boolean;
}

export interface ExtractedEntity {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'abnormal';
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  type: 'Blood Test' | 'Prescription' | 'Radiology' | 'Discharge Summary';
  date: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  fileSize: string;
  ocrStatus: 'processed' | 'processing' | 'pending';
  extractedEntities: ExtractedEntity[];
  summary: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorRole: 'Doctor' | 'Patient' | 'Admin' | 'AI Copilot';
  actorName: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'ALERT' | 'INFO';
  ipAddress: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'report' | 'vitals_check' | 'prescription';
  title: string;
  summary: string;
  doctorName: string;
  status: string;
  badgeColor: 'blue' | 'emerald' | 'amber' | 'purple';
  detailsUrl?: string;
}
