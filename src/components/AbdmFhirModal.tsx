import React, { useState } from 'react';
import { X, Copy, Check, FileCode, ShieldCheck, Download } from 'lucide-react';
import { Patient, Consultation } from '../types';
import { storageService } from '../services/storageService';

interface AbdmFhirModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  consultation?: Consultation | null;
}

export const AbdmFhirModal: React.FC<AbdmFhirModalProps> = ({
  isOpen,
  onClose,
  patient,
  consultation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate FHIR bundle
  const defaultConsultation: Consultation = consultation || {
    id: 'C-9042',
    patientId: patient.id,
    doctorId: 'DOC-2026-88',
    language: patient.preferredLanguage,
    status: 'APPROVED',
    messages: [],
    findings: {
      chiefComplaint: 'Acute Febrile Illness (Fever)',
      duration: '3 days',
      severity: 'Moderate',
      associatedSymptoms: ['Fatigue', 'Vomiting'],
      reportedTemperature: '102.0 °F',
      allergies: patient.allergies.join(', ') || 'No known drug allergies',
      currentMedications: 'None',
      pastHistory: patient.chronicConditions.join(', '),
      confidence: 0.94,
    },
    missingInfo: [],
    safetyFlags: [],
    soapCase: {} as any,
    startedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    consentRecorded: true,
  };

  const fhirPayload = storageService.generateFhirBundle(defaultConsultation, patient);
  const jsonString = JSON.stringify(fhirPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir_bundle_${patient.abhaId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={22} color="#4f46e5" />
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                ABDM & HL7 FHIR R4 Interoperability Payload
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Designed for Ayushman Bharat Digital Mission (ABDM) Health Information Exchange & Consent Manager (HIECM)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div
          style={{
            padding: '12px 24px',
            background: '#eff6ff',
            borderBottom: '1px solid #dbeafe',
            fontSize: '0.8125rem',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#2563eb" />
            <span>
              <strong>ABDM Compliant:</strong> Resource Bundle containing <code>Patient</code>, <code>Encounter</code>, <code>Condition</code>, and LOINC <code>Observation</code>.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>

            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        {/* JSON Preview */}
        <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto', background: '#0a0f1d' }}>
          <pre
            style={{
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              color: '#38bdf8',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {jsonString}
          </pre>
        </div>

        {/* Footer note */}
        <div style={{ padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          National Health Authority (NHA) ABDM Milestone 1, 2, 3 Data Schema Ready • Sandbox Testing Architecture
        </div>
      </div>
    </div>
  );
};
