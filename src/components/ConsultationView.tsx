import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Edit3,
  Save,
  Send,
  User,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Patient,
  Doctor,
  LanguageCode,
  Consultation,
  ConversationMessage,
  ClinicalFinding,
  MissingParameter,
  SafetyFlag,
  SoapCase,
} from '../types';
import { speechService } from '../services/speechService';
import { clinicalAiService } from '../services/clinicalAiService';
import { auditService } from '../services/auditService';
import { DEMO_PRESETS, SUPPORTED_LANGUAGES } from '../data/mockData';

interface ConsultationViewProps {
  patient: Patient;
  doctor: Doctor;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onCaseApproved: (consultation: Consultation) => void;
}

export const ConsultationView: React.FC<ConsultationViewProps> = ({
  patient,
  doctor,
  currentLanguage,
  onLanguageChange,
  onCaseApproved,
}) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [typedInput, setTypedInput] = useState('');

  // Consultation state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [findings, setFindings] = useState<ClinicalFinding>({
    chiefComplaint: 'Not provided',
    duration: 'Not provided',
    severity: 'Mild',
    associatedSymptoms: [],
    reportedTemperature: 'Not provided',
    allergies: patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Not provided',
    currentMedications: 'Not provided',
    pastHistory: patient.chronicConditions.join(', '),
    confidence: 0.9,
  });
  const [missingInfo, setMissingInfo] = useState<MissingParameter[]>([]);
  const [safetyFlags, setSafetyFlags] = useState<SafetyFlag[]>([]);
  const [soapCase, setSoapCase] = useState<SoapCase | null>(null);
  const [consultationStatus, setConsultationStatus] = useState<'DRAFT' | 'AI_PROCESSING' | 'AWAITING_REVIEW' | 'APPROVED'>('DRAFT');

  // Doctor editing mode
  const [isEditingSoap, setIsEditingSoap] = useState(false);
  const [editableSoap, setEditableSoap] = useState<SoapCase | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  // Initialize missing parameters & case draft when patient changes
  useEffect(() => {
    resetConsultation();
  }, [patient.id]);

  const resetConsultation = () => {
    const initialFindings: ClinicalFinding = {
      chiefComplaint: 'Not provided',
      duration: 'Not provided',
      severity: 'Mild',
      associatedSymptoms: [],
      reportedTemperature: 'Not provided',
      allergies: patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Not provided',
      currentMedications: 'Not provided',
      pastHistory: patient.chronicConditions.join(', '),
      confidence: 0.9,
    };
    setFindings(initialFindings);
    setMissingInfo(clinicalAiService.detectMissingInformation(initialFindings));
    setSafetyFlags([]);
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        text:
          currentLanguage === 'mr'
            ? `नमस्कार ${patient.name}. तुम्हाला काय त्रास होतोय? कृपया सांगा.`
            : currentLanguage === 'hi'
            ? `नमस्ते ${patient.name}. आपको क्या परेशानी हो रही है? कृपया बताएं।`
            : `Hello ${patient.name}. Please describe your symptoms or discomfort.`,
        originalLanguage: currentLanguage,
        translatedText: `Hello ${patient.name}. What discomfort or symptoms are you experiencing? Please tell us.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setConsultationStatus('DRAFT');
    setSoapCase(null);
    setEditableSoap(null);
    setIsEditingSoap(false);
  };

  // Toggle voice recording
  const handleToggleRecord = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setMicError(null);
      const speechCode =
        SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.speechCode || 'hi-IN';

      speechService.startListening(
        speechCode,
        (res) => {
          if (res.isFinal && res.transcript.trim()) {
            handlePatientUtterance(res.transcript.trim());
          }
        },
        (err) => {
          setMicError(
            err.includes('not-allowed')
              ? 'Microphone permission was denied. You can use the one-click demo speech prompts or text input.'
              : `Microphone notice: ${err}. You can also use one-click speech prompts below.`
          );
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
      setIsRecording(true);
    }
  };

  // Process a patient utterance (from speech, demo button, or text input)
  const handlePatientUtterance = (rawText: string, customTranslation?: string) => {
    setIsProcessing(true);
    setConsultationStatus('AI_PROCESSING');

    // 1. Add patient message
    const patientMsg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text: rawText,
      originalLanguage: currentLanguage,
      translatedText:
        customTranslation ||
        (currentLanguage === 'en'
          ? rawText
          : `[AI Translated to English]: ${rawText}`),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, patientMsg];
    setMessages(updatedMessages);

    // 2. Clinical information extraction
    const updatedFindings = clinicalAiService.extractClinicalInformation(
      rawText,
      currentLanguage,
      findings
    );
    setFindings(updatedFindings);

    // 3. Detect missing parameters
    const updatedMissing = clinicalAiService.detectMissingInformation(updatedFindings);
    setMissingInfo(updatedMissing);

    // 4. Screen safety flags (Red-flags like chest pain or extreme dehydration risk)
    const updatedSafety = clinicalAiService.detectSafetyFlags(rawText, updatedFindings);
    setSafetyFlags(updatedSafety);

    // 5. Generate structured SOAP case draft
    const generatedSoap = clinicalAiService.generateStructuredCase(updatedFindings, patient);
    setSoapCase(generatedSoap);
    setEditableSoap(JSON.parse(JSON.stringify(generatedSoap)));

    // 6. Adaptive follow-up question generation
    setTimeout(() => {
      const adaptive = clinicalAiService.generateAdaptiveQuestion(
        updatedFindings,
        updatedMissing,
        currentLanguage
      );

      const aiMsg: ConversationMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: adaptive.question,
        originalLanguage: currentLanguage,
        translatedText: adaptive.translation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
      setConsultationStatus('AWAITING_REVIEW');

      // Audit trail logging
      auditService.addEvent(
        'AI Copilot',
        'SwasthyaAI Entity Extractor',
        'Clinical Information Extracted',
        `Chief complaint: ${updatedFindings.chiefComplaint}; Duration: ${updatedFindings.duration}; Language: ${currentLanguage}`
      );
    }, 600);
  };

  // Play audio for an AI question
  const handlePlayAudio = (text: string) => {
    const speechCode =
      SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.speechCode || 'hi-IN';
    speechService.speakText(text, speechCode);
  };

  // Doctor approves the case
  const handleApproveCase = () => {
    if (!editableSoap) return;

    const approvedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const finalSoap: SoapCase = {
      ...editableSoap,
      plan: {
        ...editableSoap.plan,
        doctorSignature: `${doctor.name} (${doctor.registrationNumber})`,
        approvedAt,
      },
    };

    setSoapCase(finalSoap);
    setEditableSoap(finalSoap);
    setConsultationStatus('APPROVED');
    setIsEditingSoap(false);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#0284c7', '#10b981'],
      });
    } catch (e) {}

    // Audit log entry
    auditService.addEvent(
      'Doctor',
      doctor.name,
      'Clinical Case Approved',
      `Approved SOAP record for patient ${patient.name} (${patient.id}). Final diagnosis/notes verified.`,
      'SUCCESS'
    );

    const consultationObj: Consultation = {
      id: `C-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      doctorId: doctor.id,
      language: currentLanguage,
      status: 'APPROVED',
      messages,
      findings,
      missingInfo,
      safetyFlags,
      soapCase: finalSoap,
      startedAt: new Date().toISOString(),
      approvedAt,
      doctorNotes,
      consentRecorded: true,
    };

    onCaseApproved(consultationObj);
  };

  // Preset demo loader for easy 1-click SIH presentation
  const runDemoPreset = (presetKey: string) => {
    const preset = DEMO_PRESETS[presetKey];
    if (!preset) return;

    if (presetKey === 'mr-sunita') onLanguageChange('mr');
    if (presetKey === 'hi-aarav') onLanguageChange('hi');
    if (presetKey === 'en-emergency') onLanguageChange('en');

    handlePatientUtterance(preset.patientInput, preset.patientTranslation);
  };

  const runSecondPatientResponse = (presetKey: string) => {
    const preset = DEMO_PRESETS[presetKey];
    if (!preset) return;
    handlePatientUtterance(preset.patientResponse2, preset.patientResponse2Translation);
  };

  return (
    <div className="page-wrapper">
      {/* Patient Demographic Summary Strip */}
      <div
        className="clinical-card"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={patient.avatar}
              alt={patient.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{patient.name}</h2>
                <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                  {patient.gender}, {patient.age} yrs
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  ABHA: {patient.abhaId}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', gap: '16px', marginTop: '2px' }}>
                <span>🩸 Blood Group: <strong>{patient.bloodGroup}</strong></span>
                <span>⚠️ Known Allergies: <strong style={{ color: '#e11d48' }}>{patient.allergies.join(', ') || 'None'}</strong></span>
                <span>📋 Chronic: <strong>{patient.chronicConditions.join(', ')}</strong></span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Case Status
              </div>
              {consultationStatus === 'APPROVED' ? (
                <span className="badge badge-approved">
                  <CheckCircle2 size={12} /> Doctor Approved
                </span>
              ) : consultationStatus === 'AWAITING_REVIEW' ? (
                <span className="badge badge-draft">
                  <Clock size={12} /> AI Draft Awaiting Doctor Review
                </span>
              ) : consultationStatus === 'AI_PROCESSING' ? (
                <span className="badge badge-processing">
                  <Sparkles size={12} /> AI Processing
                </span>
              ) : (
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                  Initial Case Intake
                </span>
              )}
            </div>

            <button
              onClick={resetConsultation}
              title="Reset Consultation"
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Safety Alert Banner if red flag detected */}
      {safetyFlags.length > 0 && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.1)',
          }}
        >
          <AlertTriangle size={24} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#be123c', fontSize: '0.9375rem' }}>
                CLINICAL ATTENTION REQUIRED (NON-AUTONOMOUS SAFETY NOTICE)
              </strong>
              <span
                style={{
                  background: '#be123c',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                {safetyFlags[0].severity}
              </span>
            </div>
            <p style={{ color: '#9f1239', fontSize: '0.875rem', marginTop: '4px' }}>
              {safetyFlags[0].alertMessage}
            </p>
            <div
              style={{
                marginTop: '6px',
                padding: '8px 12px',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #fecdd3',
                fontSize: '0.8125rem',
                color: '#881337',
              }}
            >
              <strong>Clinician Protocol:</strong> {safetyFlags[0].clinicalRecommendation}
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Clinical Layout */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* LEFT COLUMN: Voice Intake & Live Conversation Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Voice-First Patient Intake Card */}
          <div className="clinical-card">
            <div className="card-header">
              <div className="card-title">
                <Mic size={20} color="#0284c7" />
                <span>Multilingual Patient Voice Intake</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Current: <strong>{SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.name}</strong>
              </div>
            </div>

            {/* Quick SIH Sample Prompts for Instant Demo */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  marginBottom: '8px',
                }}
              >
                Quick SIH Demo Speech Prompts:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  onClick={() => runDemoPreset('mr-sunita')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #bae6fd',
                    cursor: 'pointer',
                  }}
                >
                  🇮🇳 Marathi: “मला तीन दिवसांपासून ताप येतोय...”
                </button>

                <button
                  onClick={() => runDemoPreset('hi-aarav')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #fde68a',
                    cursor: 'pointer',
                  }}
                >
                  🇮🇳 Hindi: “मुझे तीन दिन से तेज बुखार है...”
                </button>

                <button
                  onClick={() => runDemoPreset('en-emergency')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #fecdd3',
                    cursor: 'pointer',
                  }}
                >
                  ⚠️ Red Flag: “Chest pain with sweating...”
                </button>
              </div>
            </div>

            {/* Large Interactive Microphone Button */}
            <div className="mic-button-wrapper">
              <button
                className={`mic-button ${isRecording ? 'recording' : ''}`}
                onClick={handleToggleRecord}
                title={isRecording ? 'Stop Recording' : 'Click to Speak'}
              >
                {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: isRecording ? '#e11d48' : '#0f172a' }}>
                {isRecording
                  ? 'Listening to patient speech in real-time...'
                  : isProcessing
                  ? 'Extracting clinical parameters...'
                  : 'Click microphone to speak in native language'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Web Speech API active • Auto-translates to English for clinical notes
              </div>
            </div>

            {/* Audio Wave Visualizer while recording */}
            {isRecording && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div className="wave-bars">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              </div>
            )}

            {/* Microphone notice / error fallback */}
            {micError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: '0.8125rem',
                  marginBottom: '12px',
                }}
              >
                {micError}
              </div>
            )}

            {/* Text input alternative for accessibility */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (typedInput.trim()) {
                  handlePatientUtterance(typedInput.trim());
                  setTypedInput('');
                }
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                placeholder={`Type patient symptoms in ${SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.name} or English...`}
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 16px',
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Send size={16} />
                Send
              </button>
            </form>
          </div>

          {/* Live Conversation Transcript with Bilingual Subtitles */}
          <div className="clinical-card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="#0284c7" />
                <span>Case Dialogue & Bilingual Transcript</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {messages.length} messages
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble ${msg.sender}`}
                  style={{ position: 'relative' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      marginBottom: '4px',
                      color: msg.sender === 'patient' ? '#475569' : '#0369a1',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>
                      {msg.sender === 'patient'
                        ? `Patient (${patient.name})`
                        : msg.sender === 'ai'
                        ? 'SwasthyaAI Clinical Copilot'
                        : 'Doctor'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Primary text in spoken language */}
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{msg.text}</div>

                  {/* Translation for Doctor if in regional language */}
                  {msg.translatedText && msg.originalLanguage !== 'en' && (
                    <div
                      style={{
                        marginTop: '6px',
                        paddingTop: '6px',
                        borderTop: '1px dashed rgba(0,0,0,0.1)',
                        fontSize: '0.8125rem',
                        color: msg.sender === 'patient' ? '#334155' : '#0284c7',
                        fontStyle: 'italic',
                      }}
                    >
                      🇬🇧 {msg.translatedText}
                    </div>
                  )}

                  {/* Audio speaker button for AI questions */}
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handlePlayAudio(msg.text)}
                      title="Listen in native voice"
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        padding: '4px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '1px solid #bae6fd',
                        color: '#0284c7',
                      }}
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick patient response button for 2nd stage demo */}
            {findings.chiefComplaint !== 'Not provided' && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Simulate Patient Follow-up Response (SIH Step 2):
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => runSecondPatientResponse('mr-sunita')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    Marathi: “१०२ डिग्री ताप होता आणि काल उलटी झाली.”
                  </button>
                  <button
                    onClick={() => runSecondPatientResponse('hi-aarav')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    Hindi: “102 डिग्री था, और कल से उल्टी हो रही है।”
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Extracted Parameters & SOAP Structured Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Extracted Clinical Entities & Missing Information Checklist */}
          <div className="clinical-card">
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={18} color="#7c3aed" />
                <span>AI Clinical Extraction & Missing Data Radar</span>
              </div>
              <span className="badge badge-processing">
                Confidence: {(findings.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Extracted badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>CHIEF COMPLAINT</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: findings.chiefComplaint !== 'Not provided' ? '#0f172a' : '#94a3b8' }}>
                  {findings.chiefComplaint}
                </div>
              </div>

              <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>DURATION</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: findings.duration !== 'Not provided' ? '#0f172a' : '#94a3b8' }}>
                  {findings.duration}
                </div>
              </div>

              <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>REPORTED TEMP</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: findings.reportedTemperature !== 'Not provided' ? '#b45309' : '#94a3b8' }}>
                  {findings.reportedTemperature}
                </div>
              </div>

              <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>ASSOCIATED SIGNS</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: findings.associatedSymptoms.length > 0 ? '#0f172a' : '#94a3b8' }}>
                  {findings.associatedSymptoms.length > 0 ? findings.associatedSymptoms.join(', ') : 'None extracted'}
                </div>
              </div>
            </div>

            {/* Missing Information Checklist (Adaptive USP) */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>CLINICAL PARAMETER COMPLETION</span>
                <span>
                  {missingInfo.filter((m) => m.status === 'collected').length} of {missingInfo.length} collected
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {missingInfo.map((param) => (
                  <div
                    key={param.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: param.status === 'collected' ? '#ecfdf5' : '#fffbeb',
                      border: param.status === 'collected' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {param.status === 'collected' ? (
                        <CheckCircle2 size={14} color="#059669" />
                      ) : (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #d97706' }} />
                      )}
                      <span style={{ fontWeight: 600, color: param.status === 'collected' ? '#065f46' : '#92400e' }}>
                        {param.label}
                      </span>
                    </div>

                    <div style={{ fontWeight: 500, color: '#475569' }}>
                      {param.value ? param.value : 'Awaiting confirmation'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Structured Clinical Case (SOAP) & Doctor Verification Gateway */}
          <div className="clinical-card" style={{ border: consultationStatus === 'APPROVED' ? '2px solid #059669' : '1px solid #cbd5e1' }}>
            <div className="card-header">
              <div className="card-title">
                <FileCheck size={20} color={consultationStatus === 'APPROVED' ? '#059669' : '#0284c7'} />
                <span>Structured SOAP Case Record</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {consultationStatus !== 'APPROVED' && (
                  <button
                    onClick={() => setIsEditingSoap(!isEditingSoap)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: isEditingSoap ? '#e0f2fe' : '#ffffff',
                      color: isEditingSoap ? '#0369a1' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <Edit3 size={13} />
                    {isEditingSoap ? 'Done Editing' : 'Edit Case'}
                  </button>
                )}
              </div>
            </div>

            {/* SOAP Content */}
            {editableSoap ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Subjective */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '6px' }}>
                    S — Subjective (Patient Reported)
                  </div>
                  {isEditingSoap ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Chief Complaint:</label>
                        <input
                          type="text"
                          value={editableSoap.subjective.chiefComplaint}
                          onChange={(e) =>
                            setEditableSoap({
                              ...editableSoap,
                              subjective: { ...editableSoap.subjective, chiefComplaint: e.target.value },
                            })
                          }
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Duration:</label>
                        <input
                          type="text"
                          value={editableSoap.subjective.duration}
                          onChange={(e) =>
                            setEditableSoap({
                              ...editableSoap,
                              subjective: { ...editableSoap.subjective, duration: e.target.value },
                            })
                          }
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: '#1e293b', lineHeight: 1.5 }}>
                      <p><strong>Chief Complaint:</strong> {editableSoap.subjective.chiefComplaint} ({editableSoap.subjective.duration})</p>
                      <p><strong>History of Present Illness:</strong> {editableSoap.subjective.historyOfPresentIllness}</p>
                      <p><strong>Reported Temp:</strong> {editableSoap.subjective.reportedTemperature}</p>
                      <p><strong>Current Meds:</strong> {editableSoap.subjective.currentMedications}</p>
                    </div>
                  )}
                </div>

                {/* Objective */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', marginBottom: '6px' }}>
                    O — Objective (Doctor Observations & Vitals)
                  </div>
                  {isEditingSoap ? (
                    <textarea
                      rows={2}
                      value={editableSoap.objective.reportedVitals}
                      onChange={(e) =>
                        setEditableSoap({
                          ...editableSoap,
                          objective: { ...editableSoap.objective, reportedVitals: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                    />
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: '#1e293b' }}>
                      <p><strong>Vitals:</strong> {editableSoap.objective.reportedVitals}</p>
                      <p><strong>Clinical Exam:</strong> {editableSoap.objective.physicalNotes}</p>
                    </div>
                  )}
                </div>

                {/* Assessment */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px' }}>
                    A — Assessment (Differential Considerations)
                  </div>
                  {isEditingSoap ? (
                    <textarea
                      rows={2}
                      value={editableSoap.assessment.clinicalSummary}
                      onChange={(e) =>
                        setEditableSoap({
                          ...editableSoap,
                          assessment: { ...editableSoap.assessment, clinicalSummary: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                    />
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: '#1e293b' }}>
                      <p>{editableSoap.assessment.clinicalSummary}</p>
                      <div style={{ marginTop: '4px', whiteSpace: 'pre-line', color: '#475569', fontSize: '0.75rem' }}>
                        {editableSoap.assessment.differentialConsiderations}
                      </div>
                    </div>
                  )}
                </div>

                {/* Plan */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '6px' }}>
                    P — Plan & Physician Orders
                  </div>
                  {isEditingSoap ? (
                    <textarea
                      rows={3}
                      value={editableSoap.plan.provisionalAdvice}
                      onChange={(e) =>
                        setEditableSoap({
                          ...editableSoap,
                          plan: { ...editableSoap.plan, provisionalAdvice: e.target.value },
                        })
                      }
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                    />
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: '#1e293b', whiteSpace: 'pre-line' }}>
                      <p><strong>Orders:</strong> {editableSoap.plan.provisionalAdvice}</p>
                      <p style={{ marginTop: '4px' }}>
                        <strong>Investigations:</strong> {editableSoap.plan.recommendedInvestigations.join(', ')}
                      </p>
                      <p style={{ marginTop: '4px', color: '#64748b' }}>
                        <strong>Follow-up:</strong> {editableSoap.plan.followUpInstructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Doctor Verification Signature Box */}
                {consultationStatus === 'APPROVED' ? (
                  <div
                    style={{
                      padding: '14px',
                      background: '#ecfdf5',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ShieldCheck size={28} color="#059669" />
                      <div>
                        <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.875rem' }}>
                          ✓ Clinically Verified & Approved
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                          Digitally signed by {editableSoap.plan.doctorSignature} on {editableSoap.plan.approvedAt}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: '#059669',
                        color: '#ffffff',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                      }}
                    >
                      ABDM SYNCED
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      onClick={handleApproveCase}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={18} />
                      Verify & Approve Clinical Case
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                }}
              >
                <FileCheck size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
                <p style={{ fontWeight: 600, color: '#64748b' }}>No case synthesized yet</p>
                <p style={{ fontSize: '0.75rem' }}>
                  Speak or click one of the quick speech prompts on the left to initiate multilingual clinical intake.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
