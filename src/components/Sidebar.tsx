import React from 'react';
import {
  LayoutDashboard,
  Mic,
  CalendarClock,
  FileText,
  Shield,
  Settings,
  Users,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Patient } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  patients: Patient[];
  selectedPatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  pendingReviewsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  patients,
  selectedPatient,
  onSelectPatient,
  pendingReviewsCount,
}) => {
  return (
    <aside className="sidebar">
      {/* Patient Selector Card */}
      <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#64748b',
            letterSpacing: '0.05em',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Active Patient</span>
          <span style={{ color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
            ABHA Connected
          </span>
        </div>

        <select
          value={selectedPatient.id}
          onChange={(e) => {
            const p = patients.find((pat) => pat.id === e.target.value);
            if (p) onSelectPatient(p);
          }}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {patients.map((pat) => (
            <option key={pat.id} value={pat.id}>
              {pat.name} ({pat.age}y/{pat.gender.charAt(0)}) - {pat.preferredLanguage.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Selected patient preview */}
        <div
          style={{
            marginTop: '10px',
            padding: '8px 10px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            color: '#475569',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedPatient.name}</div>
          <div>ABHA: <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{selectedPatient.abhaId}</span></div>
          <div>Location: {selectedPatient.location}</div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="sidebar-nav">
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#94a3b8',
            letterSpacing: '0.05em',
            padding: '8px 14px 4px 14px',
          }}
        >
          Clinical Workflow
        </div>

        <button
          className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Doctor Dashboard</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'consultation' ? 'active' : ''}`}
          onClick={() => onTabChange('consultation')}
          style={{ position: 'relative' }}
        >
          <Mic size={18} />
          <span>AI Case Taking</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '9999px',
              background: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            Voice-First
          </span>
        </button>

        <button
          className={`nav-item ${currentTab === 'timeline' ? 'active' : ''}`}
          onClick={() => onTabChange('timeline')}
        >
          <CalendarClock size={18} />
          <span>Patient Timeline</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`}
          onClick={() => onTabChange('reports')}
        >
          <FileText size={18} />
          <span>Medical Reports & OCR</span>
        </button>

        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#94a3b8',
            letterSpacing: '0.05em',
            padding: '16px 14px 4px 14px',
          }}
        >
          Governance & Safety
        </div>

        <button
          className={`nav-item ${currentTab === 'audit' ? 'active' : ''}`}
          onClick={() => onTabChange('audit')}
        >
          <Shield size={18} />
          <span>Security & Audit Logs</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          <Settings size={18} />
          <span>AI Guardrails & ABDM</span>
        </button>
      </nav>

      {/* Safety Notice in Footer */}
      <div
        style={{
          margin: '12px',
          padding: '12px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          color: '#475569',
          lineHeight: 1.4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          <AlertTriangle size={14} color="#d97706" />
          <span>AI Copilot Policy</span>
        </div>
        <p style={{ fontSize: '0.6875rem' }}>
          AI assists case extraction. Doctor is always the final clinical decision-maker.
        </p>
      </div>
    </aside>
  );
};
