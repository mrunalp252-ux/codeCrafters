import { Patient, Doctor, LanguageInfo, MedicalReport, AuditEvent, TimelineEvent, Consultation } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', speechCode: 'hi-IN', isReady: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', speechCode: 'mr-IN', isReady: true },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-IN', isReady: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', speechCode: 'gu-IN', isReady: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', speechCode: 'bn-IN', isReady: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN', isReady: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN', isReady: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', speechCode: 'kn-IN', isReady: false },
];

export const CURRENT_DOCTOR: Doctor = {
  id: 'DOC-2026-88',
  name: 'Dr. Ananya Sharma',
  specialization: 'Internal Medicine & Primary Care',
  registrationNumber: 'MCI-DEL-2018-88921',
  hospital: 'District Civil Hospital & Ayushman Arogya Mandir',
  department: 'OPD Clinical Unit 2',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P-101',
    abhaId: '91-4521-8893-1029',
    name: 'Aarav Sharma',
    age: 32,
    gender: 'Male',
    phone: '+91 98765 43210',
    location: 'Najafgarh, New Delhi',
    preferredLanguage: 'hi',
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    chronicConditions: ['None reported'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'P-102',
    abhaId: '91-8712-3341-9042',
    name: 'Sunita Patil',
    age: 48,
    gender: 'Female',
    phone: '+91 94230 19844',
    location: 'Baramati Rural, Pune, Maharashtra',
    preferredLanguage: 'mr',
    bloodGroup: 'O+',
    allergies: ['No known drug allergies'],
    chronicConditions: ['Hypertension (Stage 1)'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'P-103',
    abhaId: '91-1192-5401-7718',
    name: 'Rajesh Kulkarni',
    age: 55,
    gender: 'Male',
    phone: '+91 98224 88312',
    location: 'Karad, Satara, Maharashtra',
    preferredLanguage: 'mr',
    bloodGroup: 'A+',
    allergies: ['Sulfa drugs'],
    chronicConditions: ['Type 2 Diabetes Mellitus'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'P-104',
    abhaId: '91-6604-9122-3814',
    name: 'Priya Nair',
    age: 27,
    gender: 'Female',
    phone: '+91 97411 55290',
    location: 'Indiranagar, Bengaluru',
    preferredLanguage: 'en',
    bloodGroup: 'AB+',
    allergies: ['Dust / Pollen'],
    chronicConditions: ['Bronchial Asthma (Mild)'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
];

export const INITIAL_TIMELINE_EVENTS: Record<string, TimelineEvent[]> = {
  'P-102': [
    {
      id: 'TLE-102-1',
      patientId: 'P-102',
      date: '12 Jan 2026',
      type: 'consultation',
      title: 'Seasonal Pyrexia & Body Ache Consultation',
      summary: 'Patient presented with low grade fever and generalized myalgia. Prescribed hydration and Paracetamol SOS.',
      doctorName: 'Dr. Ananya Sharma',
      status: 'Doctor Approved',
      badgeColor: 'emerald',
    },
    {
      id: 'TLE-102-2',
      patientId: 'P-102',
      date: '28 Mar 2026',
      type: 'report',
      title: 'Diagnostic Lab: Complete Blood Count (CBC)',
      summary: 'Automated OCR extracted Hb 11.8 g/dL, Platelet count 2.1 Lakh/mcL (Normal), WBC 8,400/mcL.',
      doctorName: 'Dr. V. K. Deshmukh (Pathologist)',
      status: 'Verified',
      badgeColor: 'purple',
    },
    {
      id: 'TLE-102-3',
      patientId: 'P-102',
      date: '14 Jun 2026',
      type: 'vitals_check',
      title: 'Routine NCD Screening & BP Check',
      summary: 'Blood pressure recorded at Sub-Center: 138/86 mmHg. Advised low salt diet and regular walks.',
      doctorName: 'Dr. Ananya Sharma',
      status: 'Completed',
      badgeColor: 'blue',
    },
  ],
  'P-101': [
    {
      id: 'TLE-101-1',
      patientId: 'P-101',
      date: '04 Feb 2026',
      type: 'consultation',
      title: 'Upper Respiratory Tract Infection',
      summary: 'Dry cough and mild throat irritation. Advised steam inhalation and saline gargles.',
      doctorName: 'Dr. Ananya Sharma',
      status: 'Doctor Approved',
      badgeColor: 'emerald',
    },
    {
      id: 'TLE-101-2',
      patientId: 'P-101',
      date: '19 May 2026',
      type: 'report',
      title: 'Fasting Blood Sugar & Lipid Profile',
      summary: 'FBS: 94 mg/dL (Normal), Total Cholesterol: 182 mg/dL.',
      doctorName: 'Apollo Diagnostics Delhi',
      status: 'Verified',
      badgeColor: 'purple',
    },
  ],
};

export const MOCK_REPORTS: MedicalReport[] = [
  {
    id: 'REP-001',
    patientId: 'P-102',
    title: 'Complete Blood Count (CBC) & Dengue NS1',
    type: 'Blood Test',
    date: '05 Sep 2026',
    fileType: 'PDF',
    fileSize: '1.4 MB',
    ocrStatus: 'processed',
    extractedEntities: [
      { parameter: 'Hemoglobin (Hb)', value: '11.4', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'low' },
      { parameter: 'Total Leucocyte Count (TLC)', value: '7,800', unit: '/mcL', referenceRange: '4,000 - 11,000', status: 'normal' },
      { parameter: 'Platelet Count', value: '1,85,000', unit: '/mcL', referenceRange: '1,50,000 - 4,50,000', status: 'normal' },
      { parameter: 'ESR (Erythrocyte Sed. Rate)', value: '28', unit: 'mm/hr', referenceRange: '0 - 20', status: 'high' },
      { parameter: 'Dengue NS1 Antigen', value: 'Negative', unit: 'Qualitative', referenceRange: 'Negative', status: 'normal' },
    ],
    summary: 'Mild microcytic anemia with mildly elevated ESR. Dengue NS1 negative. Platelet count adequate.',
  },
  {
    id: 'REP-002',
    patientId: 'P-101',
    title: 'Biochemistry Panel: LFT & Serum Creatinine',
    type: 'Blood Test',
    date: '02 Sep 2026',
    fileType: 'JPG',
    fileSize: '2.8 MB',
    ocrStatus: 'processed',
    extractedEntities: [
      { parameter: 'Serum Bilirubin Total', value: '0.8', unit: 'mg/dL', referenceRange: '0.2 - 1.2', status: 'normal' },
      { parameter: 'SGOT (AST)', value: '34', unit: 'U/L', referenceRange: '10 - 40', status: 'normal' },
      { parameter: 'SGPT (ALT)', value: '38', unit: 'U/L', referenceRange: '10 - 45', status: 'normal' },
      { parameter: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: 'normal' },
      { parameter: 'Blood Urea', value: '24', unit: 'mg/dL', referenceRange: '15 - 40', status: 'normal' },
    ],
    summary: 'Normal renal and liver parameters within standard clinical limits.',
  },
  {
    id: 'REP-003',
    patientId: 'P-103',
    title: 'HbA1c & Fasting Plasma Glucose',
    type: 'Blood Test',
    date: '20 Aug 2026',
    fileType: 'PDF',
    fileSize: '950 KB',
    ocrStatus: 'processed',
    extractedEntities: [
      { parameter: 'HbA1c (Glycated Hb)', value: '7.4', unit: '%', referenceRange: '< 5.7', status: 'high' },
      { parameter: 'Fasting Blood Glucose', value: '142', unit: 'mg/dL', referenceRange: '70 - 99', status: 'high' },
    ],
    summary: 'Suboptimal glycemic control. Requires physician review for oral hypoglycemic agent adjustment.',
  },
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'AUD-01',
    timestamp: '06 Sep 2026 10:15:02',
    actorRole: 'Doctor',
    actorName: 'Dr. Ananya Sharma',
    action: 'Session Authentication',
    details: 'Clinician successfully logged into SwasthyaAI OPD terminal via ABHA Healthcare Professional Registry (HPR).',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104 (PHC Baramati)',
  },
  {
    id: 'AUD-02',
    timestamp: '06 Sep 2026 10:20:18',
    actorRole: 'Patient',
    actorName: 'Sunita Patil',
    action: 'Digital Consent Recorded',
    details: 'Patient granted explicit consent for multilingual speech-to-text case-taking and clinical AI copilot intake.',
    status: 'SUCCESS',
    ipAddress: 'Kiosk Terminal #1',
  },
  {
    id: 'AUD-03',
    timestamp: '06 Sep 2026 10:24:45',
    actorRole: 'AI Copilot',
    actorName: 'SwasthyaAI Intake Engine',
    action: 'SOAP Case Synthesis',
    details: 'Extracted chief complaint (Pyrexia) and associated symptoms with 94.2% confidence. Flagged temperature parameter.',
    status: 'INFO',
    ipAddress: 'Internal Sandbox Engine',
  },
  {
    id: 'AUD-04',
    timestamp: '06 Sep 2026 10:28:10',
    actorRole: 'Doctor',
    actorName: 'Dr. Ananya Sharma',
    action: 'Clinical Verification & Approval',
    details: 'Doctor verified draft case #C-9042, modified advice to include ORS, and digitally approved clinical record.',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104',
  },
];

export interface DemoScriptItem {
  patientInput: string;
  patientTranslation: string;
  expectedChiefComplaint: string;
  expectedDuration: string;
  expectedAssociated: string[];
  expectedTemp?: string;
  missingParameters: string[];
  aiQuestion: string;
  aiQuestionTranslation: string;
  patientResponse2: string;
  patientResponse2Translation: string;
  structuredCaseDraft: {
    cc: string;
    duration: string;
    temp: string;
    associated: string[];
    allergies: string;
    medications: string;
    notes: string;
  };
  safetyAttention?: string;
}

export const DEMO_PRESETS: Record<string, DemoScriptItem> = {
  'mr-sunita': {
    patientInput: 'मला तीन दिवसांपासून ताप येतोय आणि खूप थकवा जाणवतोय.',
    patientTranslation: 'I have been having fever for three days and feeling extreme fatigue.',
    expectedChiefComplaint: 'Fever (ताप)',
    expectedDuration: '3 days (३ दिवस)',
    expectedAssociated: ['Fatigue / Exhaustion (खूप थकवा)'],
    missingParameters: ['Highest Recorded Temperature', 'Vomiting / Headache / Chills', 'Current Medications', 'Known Allergies'],
    aiQuestion: 'ताप किती होता? उलटी किंवा डोकेदुखी आहे का?',
    aiQuestionTranslation: 'What was your highest recorded temperature? Do you have vomiting or headache?',
    patientResponse2: '१०२ डिग्री ताप होता आणि काल रात्री एक वेळा उलटी झाली.',
    patientResponse2Translation: 'Temperature was 102 degrees and had vomiting once last night.',
    structuredCaseDraft: {
      cc: 'Acute Febrile Illness (Fever)',
      duration: '3 days',
      temp: '102.0 °F (Reported)',
      associated: ['Fatigue / General Malaise', 'Vomiting (1 episode, yesterday night)'],
      allergies: 'No known drug allergies reported',
      medications: 'Paracetamol 500mg taken once at home (over the counter)',
      notes: 'Patient denies chills or rigors. Hydration intake reduced due to nausea.',
    },
    safetyAttention: 'High temperature (102°F) accompanied by vomiting requires clinical hydration assessment and screening for endemic vector-borne pyrexia.',
  },
  'hi-aarav': {
    patientInput: 'मुझे तीन दिन से तेज बुखार है और बहुत कमजोरी लग रही है।',
    patientTranslation: 'I have high fever for three days and feeling very weak.',
    expectedChiefComplaint: 'High Fever (तेज बुखार)',
    expectedDuration: '3 days (३ दिन)',
    expectedAssociated: ['Severe Weakness / Fatigue (कमजोरी)'],
    missingParameters: ['Peak Temperature', 'Nausea / Vomiting', 'Cough / Chest Pain', 'Current Medications'],
    aiQuestion: 'आपका तापमान कितना रहा और क्या आपको उल्टी, खांसी या सीने में दर्द है?',
    aiQuestionTranslation: 'What was your temperature, and do you have vomiting, cough, or chest pain?',
    patientResponse2: '102 डिग्री था, खांसी नहीं है लेकिन कल से उल्टी भी हो रही है।',
    patientResponse2Translation: 'It was 102 degrees, no cough, but experiencing vomiting since yesterday.',
    structuredCaseDraft: {
      cc: 'High Grade Fever with Nausea/Vomiting',
      duration: '3 days',
      temp: '102.0 °F',
      associated: ['Weakness (कमजोरी)', 'Vomiting (उल्टी since yesterday)'],
      allergies: 'Penicillin allergy noted in previous profile',
      medications: 'None currently prescribed',
      notes: 'Patient reports mild headache secondary to fever. Denies chest pain or shortness of breath.',
    },
    safetyAttention: 'Fever 102°F with nausea. Patient has documented Penicillin allergy; take caution with antibiotic selection.',
  },
  'en-emergency': {
    patientInput: 'I am having severe squeezing pain in my chest radiating to my left arm, with sweating for 1 hour.',
    patientTranslation: 'Severe squeezing chest pain radiating to left arm with diaphoresis for 1 hour.',
    expectedChiefComplaint: 'Acute Chest Pain (Retrosternal)',
    expectedDuration: '1 hour',
    expectedAssociated: ['Radiation to left arm', 'Diaphoresis (Profuse sweating)'],
    missingParameters: ['History of CAD / Diabetes', 'Vitals: Blood Pressure, SpO2', 'Current Aspirin/Statin use'],
    aiQuestion: 'Do you have difficulty breathing, dizziness, or a known history of heart conditions or diabetes?',
    aiQuestionTranslation: 'Do you have difficulty breathing, dizziness, or a known history of heart conditions or diabetes?',
    patientResponse2: 'Yes, I feel slightly breathless and dizzy. No known heart history.',
    patientResponse2Translation: 'Yes, I feel slightly breathless and dizzy. No known heart history.',
    structuredCaseDraft: {
      cc: 'Acute Anginal-type Chest Pain with Left Arm Radiation',
      duration: '1 hour',
      temp: 'Afebrile (98.4 °F)',
      associated: ['Diaphoresis (Cold Sweats)', 'Shortness of breath', 'Mild dizziness'],
      allergies: 'Not provided',
      medications: 'Not provided',
      notes: 'EMERGENCY RED-FLAG: Immediate physician triage required. ECG and cardiac enzymes recommended.',
    },
    safetyAttention: '⚠️ CRITICAL RED FLAG: Acute chest pain with radiation and diaphoresis. Immediate bedside ECG and clinician intervention required. AI is assisting intake only!',
  },
};
