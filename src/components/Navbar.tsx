import React from 'react';
import {
  Activity,
  ShieldCheck,
  Globe,
  Wifi,
  WifiOff,
  FileCode,
  UserCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { UserRole, LanguageCode, Doctor } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/mockData';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenFhirModal: () => void;
  doctor: Doctor;
  queuedCount: number;
  onSyncOffline: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentLanguage,
  onLanguageChange,
  isOffline,
  onToggleOffline,
  onOpenFhirModal,
  doctor,
  queuedCount,
  onSyncOffline,
}) => {
  return (
    <header className="top-navbar">
      {/* Brand & Tagline */}
      <div className="brand-badge">
        <div className="brand-icon-box">
          <Activity size={24} strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <h1>
            SwasthyaAI
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: '#e0f2fe',
                color: '#0369a1',
                fontWeight: 700,
                border: '1px solid #bae6fd',
                letterSpacing: '0.05em',
              }}
            >
              SIH 2026 PROTOTYPE
            </span>
          </h1>
          <p>“Talk. Don’t Type. Healthcare for Bharat.”</p>
        </div>
      </div>

      {/* Center: Language & Connectivity & FHIR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Language Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: '1px solid #cbd5e1',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Globe size={16} color="#64748b" />
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName}) {lang.isReady ? '' : '• Coming Soon'}
              </option>
            ))}
          </select>
        </div>

        {/* Offline / Connectivity Mode */}
        <button
          onClick={onToggleOffline}
          title="Simulate low-connectivity rural Primary Health Center (PHC)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: isOffline ? '1px solid #fde68a' : '1px solid #a7f3d0',
            background: isOffline ? '#fffbeb' : '#ecfdf5',
            color: isOffline ? '#b45309' : '#047857',
            cursor: 'pointer',
          }}
        >
          {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
          <span>{isOffline ? `Offline Cache (${queuedCount} unsynced)` : 'ABDM Cloud Online'}</span>
        </button>

        {isOffline && queuedCount > 0 && (
          <button
            onClick={onSyncOffline}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sync Now
          </button>
        )}

        {/* FHIR / ABDM Readiness Viewer Button */}
        <button
          onClick={onOpenFhirModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#334155',
            cursor: 'pointer',
          }}
          title="View FHIR R4 & ABDM Interoperability Payload"
        >
          <FileCode size={14} color="#4f46e5" />
          <span>FHIR / ABDM Ready</span>
        </button>
      </div>

      {/* Right: Role Switcher & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Role Toggle Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={() => onRoleChange('doctor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: currentRole === 'doctor' ? '#ffffff' : 'transparent',
              color: currentRole === 'doctor' ? '#0f172a' : '#64748b',
              boxShadow: currentRole === 'doctor' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Stethoscope size={14} color={currentRole === 'doctor' ? '#0284c7' : '#64748b'} />
            Doctor
          </button>

          <button
            onClick={() => onRoleChange('patient')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: currentRole === 'patient' ? '#ffffff' : 'transparent',
              color: currentRole === 'patient' ? '#0f172a' : '#64748b',
              boxShadow: currentRole === 'patient' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Users size={14} color={currentRole === 'patient' ? '#0284c7' : '#64748b'} />
            Patient Kiosk
          </button>

          <button
            onClick={() => onRoleChange('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: currentRole === 'admin' ? '#ffffff' : 'transparent',
              color: currentRole === 'admin' ? '#0f172a' : '#64748b',
              boxShadow: currentRole === 'admin' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <ShieldCheck size={14} color={currentRole === 'admin' ? '#0284c7' : '#64748b'} />
            Admin & Logs
          </button>
        </div>

        {/* Doctor Info Pill */}
        {currentRole === 'doctor' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 4px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
            }}
          >
            <img
              src={doctor.avatar}
              alt={doctor.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                {doctor.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                {doctor.specialization}
              </div>
            </div>
            <UserCheck size={16} color="#059669" />
          </div>
        )}
      </div>
    </header>
  );
};
