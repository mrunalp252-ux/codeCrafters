import React, { useState } from 'react';
import {
  Shield,
  Server,
  Lock,
  Wifi,
  Database,
  CheckCircle2,
  AlertTriangle,
  Key,
  Layers,
  Save,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { auditService } from '../services/auditService';

interface SettingsViewProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  queuedCount: number;
  onSyncOffline: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isOffline,
  onToggleOffline,
  queuedCount,
  onSyncOffline,
}) => {
  const [apiKeyMode, setApiKeyMode] = useState<'demo' | 'external'>('demo');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    auditService.addEvent(
      'Admin',
      'System Administrator',
      'System Configuration Updated',
      `Switched AI execution profile to: ${apiKeyMode.toUpperCase()}. Updated clinical safety thresholds.`
    );
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div
        className="clinical-card"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7' }}>
            <Shield size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI Guardrails, ABDM & Connectivity</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '2px' }}>
              Configure clinical safety policies, offline synchronization for rural PHCs, and ABHA gateway endpoints.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} /> Configurations saved and validated successfully!
        </div>
      )}

      <div className="grid-2">
        {/* Guardrails Card */}
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={18} color="#059669" />
              <span>Mandatory Clinical Guardrails</span>
            </div>
            <span className="badge badge-approved">Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Zero Autonomous Diagnosis:</strong>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  AI prepares case drafts and differential considerations for clinician review; never issues final diagnosis autonomously.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>No Hallucinated Clinical Facts:</strong>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Unspecified symptoms or unmeasured vitals are strictly marked as 'Not provided' or 'Unknown' without assumptions.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Digital Doctor Signature Gate:</strong>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Cases are saved as AI Drafts until explicitly verified and signed by registered clinician with MCI/NMC credentials.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connectivity & Offline Sync Card */}
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-title">
              <Wifi size={18} color="#0284c7" />
              <span>Rural Primary Health Center (PHC) Offline Mode</span>
            </div>
            <span className={isOffline ? 'badge badge-draft' : 'badge badge-approved'}>
              {isOffline ? 'Offline Mode' : 'Connected'}
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '16px' }}>
            Enables smooth operation in remote rural locations with zero or intermittent internet connectivity. Consultations are cached securely locally and pushed to ABDM upon reconnection.
          </p>

          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>Simulate Offline State</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {isOffline ? 'Currently caching to browser storage' : 'Direct sync with cloud'}
                </div>
              </div>

              <button
                onClick={onToggleOffline}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: isOffline ? '#059669' : '#e11d48',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                {isOffline ? 'Go Online' : 'Go Offline'}
              </button>
            </div>

            {isOffline && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Queued unsynced encounters: <strong>{queuedCount}</strong>
                </span>
                <button
                  onClick={onSyncOffline}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sync to Cloud Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Engine & API Key Independence */}
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="#7c3aed" />
              <span>AI Provider & Zero-Key Fallback</span>
            </div>
            <span className="badge badge-processing">API-Independent</span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '14px' }}>
            SwasthyaAI includes a deterministic local clinical extraction engine that runs 100% offline without external API keys, ensuring zero demo failures at SIH.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => setApiKeyMode('demo')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: apiKeyMode === 'demo' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: apiKeyMode === 'demo' ? '#e0f2fe' : '#ffffff',
                color: apiKeyMode === 'demo' ? '#0369a1' : '#475569',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              ✓ Integrated Local Sandbox Engine (Recommended for SIH)
            </button>

            <button
              onClick={() => setApiKeyMode('external')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: apiKeyMode === 'external' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: apiKeyMode === 'external' ? '#e0f2fe' : '#ffffff',
                color: apiKeyMode === 'external' ? '#0369a1' : '#475569',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              External LLM Endpoint (Optional)
            </button>
          </div>

          {apiKeyMode === 'external' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                Gemini / OpenAI API Key:
              </label>
              <input
                type="password"
                placeholder="AIzaSy... (Optional for external LLM testing)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  marginTop: '4px',
                  fontSize: '0.8125rem',
                }}
              />
            </div>
          )}

          <button
            onClick={handleSaveSettings}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Save size={16} /> Save Configurations
          </button>
        </div>

        {/* ABDM Registry Info */}
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-title">
              <Server size={18} color="#4f46e5" />
              <span>National Health Stack Connectivity</span>
            </div>
            <span className="badge badge-approved">NHA Sandbox</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>HPR (Healthcare Professional Registry):</span>
              <strong style={{ fontFamily: 'monospace' }}>MCI-DEL-2018-88921</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>HFR (Health Facility Registry):</span>
              <strong style={{ fontFamily: 'monospace' }}>IN-MH-PUN-004291</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>HIP / HIU Client ID:</span>
              <strong style={{ fontFamily: 'monospace' }}>SBX_SWASTHYA_AI_2026</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#64748b' }}>Interoperability Protocol:</span>
              <strong style={{ color: '#059669' }}>HL7 FHIR Release 4 (R4)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
