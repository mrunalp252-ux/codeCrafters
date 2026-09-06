import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  FileUp,
  AlertCircle,
  Globe,
  HeartPulse,
} from 'lucide-react';
import { Patient, LanguageCode } from '../types';
import { speechService } from '../services/speechService';
import { auditService } from '../services/auditService';
import { SUPPORTED_LANGUAGES, DEMO_PRESETS } from '../data/mockData';

interface PatientVoiceKioskProps {
  patient: Patient;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSwitchToDoctor: () => void;
  onReportUploadClick: () => void;
}

export const PatientVoiceKiosk: React.FC<PatientVoiceKioskProps> = ({
  patient,
  currentLanguage,
  onLanguageChange,
  onSwitchToDoctor,
  onReportUploadClick,
}) => {
  const [hasConsented, setHasConsented] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [stage, setStage] = useState<number>(0);

  const handleConsent = () => {
    setHasConsented(true);
    auditService.addEvent(
      'Patient',
      patient.name,
      'Digital Consent Granted',
      'Patient confirmed explicit informed consent for multilingual speech-to-text case-taking.'
    );
  };

  const handleToggleMic = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      const speechCode =
        SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.speechCode || 'hi-IN';

      speechService.startListening(
        speechCode,
        (res) => {
          setTranscript(res.transcript);
          if (res.isFinal) {
            processPatientSpeech(res.transcript);
          }
        },
        () => {
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
      setIsRecording(true);
    }
  };

  const processPatientSpeech = (text: string) => {
    setIsRecording(false);
    setStage(1);

    setTimeout(() => {
      let reply = '';
      if (currentLanguage === 'mr') {
        reply = 'ताप किती होता? सोबत उलटी किंवा डोकेदुखीचा त्रास आहे का?';
      } else if (currentLanguage === 'hi') {
        reply = 'आपका तापमान कितना रहा और क्या आपको उल्टी, खांसी या सिरदर्द है?';
      } else {
        reply = 'What was your highest temperature, and do you have vomiting, headache, or cough?';
      }
      setAiResponse(reply);

      // Speak response back to patient
      const speechCode =
        SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.speechCode || 'hi-IN';
      speechService.speakText(reply, speechCode);
    }, 800);
  };

  const runSample = (key: string) => {
    const preset = DEMO_PRESETS[key];
    if (!preset) return;
    setTranscript(preset.patientInput);
    processPatientSpeech(preset.patientInput);
  };

  const speakAiResponse = () => {
    if (aiResponse) {
      const speechCode =
        SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.speechCode || 'hi-IN';
      speechService.speakText(aiResponse, speechCode);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      {/* Patient Header */}
      <div
        className="clinical-card"
        style={{
          textAlign: 'center',
          padding: '28px 24px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
          color: '#ffffff',
          borderRadius: '24px',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8125rem', marginBottom: '12px' }}>
          <HeartPulse size={16} />
          <span>Ayushman Bharat Digital Health Kiosk</span>
        </div>
        <h1 style={{ color: '#ffffff', fontSize: '1.875rem', marginBottom: '8px' }}>
          {currentLanguage === 'mr'
            ? `नमस्कार ${patient.name}, बोला, आम्ही ऐकत आहोत.`
            : currentLanguage === 'hi'
            ? `नमस्ते ${patient.name}, बोलिए, हम सुन रहे हैं।`
            : `Welcome ${patient.name}. Speak naturally, we are listening.`}
        </h1>
        <p style={{ opacity: 0.9, fontSize: '0.9375rem', maxWidth: '600px', margin: '0 auto' }}>
          {currentLanguage === 'mr'
            ? 'मोठे फॉर्म भरण्याची गरज नाही. तुमच्या मातृभाषेत लक्षणे सांगा.'
            : currentLanguage === 'hi'
            ? 'कोई लंबा फॉर्म भरने की आवश्यकता नहीं है। अपनी भाषा में खुलकर बताएं।'
            : 'No tedious medical forms required. Just talk in your native language.'}
        </p>

        {/* Big Language Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          {SUPPORTED_LANGUAGES.slice(0, 3).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                background: currentLanguage === lang.code ? '#ffffff' : 'rgba(255,255,255,0.2)',
                color: currentLanguage === lang.code ? '#0284c7' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {lang.flag} {lang.nativeName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Kiosk Content */}
      <div className="clinical-card" style={{ padding: '36px 24px', textAlign: 'center' }}>
        {/* Consent Banner */}
        {!hasConsented ? (
          <div style={{ padding: '24px', background: '#fffbeb', borderRadius: '16px', border: '1px solid #fde68a', marginBottom: '24px' }}>
            <AlertCircle size={32} color="#d97706" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ color: '#92400e', marginBottom: '8px' }}>Patient Consent Acknowledgement</h3>
            <p style={{ fontSize: '0.875rem', color: '#78350f', maxWidth: '500px', margin: '0 auto 16px auto' }}>
              I agree to use the multilingual voice copilot for clinical intake. The information will be structured for doctor review and stored under ABHA security protocols.
            </p>
            <button
              onClick={handleConsent}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              I Agree & Grant Consent
            </button>
          </div>
        ) : (
          <>
            {/* Giant Microphone Interaction */}
            <div className="mic-button-wrapper" style={{ margin: '20px auto 30px auto' }}>
              <button
                className={`mic-button ${isRecording ? 'recording' : ''}`}
                onClick={handleToggleMic}
                style={{ width: '120px', height: '120px', fontSize: '44px' }}
                title="Tap to speak"
              >
                {isRecording ? <MicOff size={48} /> : <Mic size={48} />}
              </button>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isRecording ? '#e11d48' : '#0f172a', marginBottom: '8px' }}>
              {isRecording
                ? currentLanguage === 'mr' ? 'आम्ही ऐकत आहोत... बोला' : currentLanguage === 'hi' ? 'हम सुन रहे हैं... बोलिए' : 'Listening... Speak now'
                : currentLanguage === 'mr' ? 'माईक दाबा आणि लक्षणे सांगा' : currentLanguage === 'hi' ? 'माइक दबाएं और अपनी तकलीफ बताएं' : 'Tap microphone to describe symptoms'}
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '24px' }}>
              Speaking in: <strong>{SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.name} ({SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName})</strong>
            </p>

            {/* Quick Demo buttons for audience */}
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
                Or tap a sample phrase:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    onLanguageChange('mr');
                    runSample('mr-sunita');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: '1px solid #bae6fd',
                    cursor: 'pointer',
                  }}
                >
                  “मला तीन दिवसांपासून ताप येतोय...”
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('hi');
                    runSample('hi-aarav');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: '1px solid #fde68a',
                    cursor: 'pointer',
                  }}
                >
                  “मुझे तीन दिन से बुखार है...”
                </button>
              </div>
            </div>

            {/* Spoken Text Display */}
            {transcript && (
              <div
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  What you said:
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                  “{transcript}”
                </div>
              </div>
            )}

            {/* AI Follow-up Question */}
            {aiResponse && (
              <div
                style={{
                  textAlign: 'left',
                  padding: '18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
                  border: '1px solid #bae6fd',
                  marginBottom: '24px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                    SwasthyaAI Follow-up Question:
                  </div>
                  <button
                    onClick={speakAiResponse}
                    title="Listen to question"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: '#ffffff',
                      color: '#0284c7',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid #bae6fd',
                    }}
                  >
                    <Volume2 size={14} /> Listen
                  </button>
                </div>
                <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0369a1', marginTop: '8px' }}>
                  {aiResponse}
                </div>
              </div>
            )}

            {/* Actions for patient: Upload reports & Doctor consultation */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <button
                onClick={onReportUploadClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <FileUp size={18} color="#0284c7" />
                Upload Lab Report / Prescription
              </button>

              <button
                onClick={onSwitchToDoctor}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                <CheckCircle size={18} />
                Send Case to Doctor for Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
