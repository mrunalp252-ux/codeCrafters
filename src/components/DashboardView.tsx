import React from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  FileText,
  Mic,
  ArrowRight,
  TrendingUp,
  Globe2,
  Zap,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Patient, Doctor } from '../types';

interface DashboardViewProps {
  doctor: Doctor;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onStartNewConsultation: (patient: Patient) => void;
  onViewReports: () => void;
  pendingReviewsCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  doctor,
  patients,
  onSelectPatient,
  onStartNewConsultation,
  onViewReports,
  pendingReviewsCount,
}) => {
  return (
    <div className="page-wrapper">
      {/* Welcome & OPD Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 132, 199, 0.2)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: '8px' }}>
            <Activity size={14} />
            <span>Ayushman Bharat Digital Mission (ABDM) Integrated OPD</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff', fontWeight: 800 }}>
            Welcome, {doctor.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>
            {doctor.department} • {doctor.hospital} (Reg: {doctor.registrationNumber})
          </p>
        </div>

        <button
          onClick={() => onStartNewConsultation(patients[0])}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
            cursor: 'pointer',
          }}
        >
          <Mic size={18} />
          <span>Start AI Case Taking</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="clinical-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Today's Consultations
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>24</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <TrendingUp size={14} /> +18% vs yesterday (OPD Peak)
          </div>
        </div>

        <div className="clinical-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Pending Doctor Reviews
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706' }}>
            {pendingReviewsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
            AI Drafts awaiting clinician sign-off
          </div>
        </div>

        <div className="clinical-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Reports OCR Processed
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>12</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            CBC, Prescriptions & Metabolic
          </div>
        </div>

        <div className="clinical-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Time Saved per Patient
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <Zap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>6.1 min</div>
          <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px' }}>
            Voice extraction vs manual typing
          </div>
        </div>
      </div>

      {/* Pending AI Drafts Awaiting Verification Table */}
      <div className="clinical-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Clock size={20} color="#d97706" />
            <span>AI Drafts Awaiting Doctor Review & Verification</span>
          </div>
          <span className="badge badge-draft">Clinical Verification Mandatory</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Patient</th>
                <th style={{ padding: '12px 14px' }}>Language</th>
                <th style={{ padding: '12px 14px' }}>Extracted Chief Complaint</th>
                <th style={{ padding: '12px 14px' }}>Reported Temp</th>
                <th style={{ padding: '12px 14px' }}>AI Confidence</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={patients[1].avatar}
                      alt={patients[1].name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{patients[1].name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{patients[1].gender}, {patients[1].age}y • Baramati</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    🇮🇳 Marathi
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                  Acute Febrile Illness (Fever, 3d) + Fatigue
                </td>
                <td style={{ padding: '12px 14px', color: '#b45309', fontWeight: 700 }}>
                  102.0 °F
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="badge badge-processing">94%</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="badge badge-draft">Awaiting Doctor Approval</span>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <button
                    onClick={() => onStartNewConsultation(patients[1])}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Review Case
                  </button>
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={patients[0].avatar}
                      alt={patients[0].name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{patients[0].name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{patients[0].gender}, {patients[0].age}y • Delhi</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    🇮🇳 Hindi
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                  High Fever (3d) + Nausea / Vomiting
                </td>
                <td style={{ padding: '12px 14px', color: '#b45309', fontWeight: 700 }}>
                  102.0 °F
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="badge badge-processing">92%</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="badge badge-draft">Awaiting Doctor Approval</span>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <button
                    onClick={() => onStartNewConsultation(patients[0])}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Review Case
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Recent Patients & Multilingual Bharat Insights */}
      <div className="grid-2">
        {/* Recent Patients List */}
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-title">
              <Users size={18} color="#0284c7" />
              <span>OPD Patient Queue</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{patients.length} Registered Today</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {patients.map((pat) => (
              <div
                key={pat.id}
                onClick={() => onSelectPatient(pat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={pat.avatar}
                    alt={pat.name}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{pat.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {pat.gender}, {pat.age}y • Lang: {pat.preferredLanguage.toUpperCase()} • Blood: {pat.bloodGroup}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartNewConsultation(pat);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Start Intake
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bharat Multilingual Healthcare Engine Stats */}
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-title">
              <Globe2 size={18} color="#0d9488" />
              <span>Bharat Linguistic Reach & Performance</span>
            </div>
            <span className="badge badge-approved">SIH 2026 Core</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>मराठी (Marathi)</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>44% of rural OPDs</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '44%', height: '100%', background: '#0284c7' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>हिंदी (Hindi)</span>
                <span style={{ fontWeight: 700, color: '#d97706' }}>38% of consultations</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '38%', height: '100%', background: '#d97706' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>English (Clinical Referral)</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>18%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', background: '#059669' }}></div>
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '10px', fontSize: '0.75rem', color: '#475569', marginTop: '6px' }}>
              <strong>Extensibility Architecture:</strong> Plug-and-play speech dictionaries ready for Bengali, Tamil, Telugu, Gujarati, and Kannada without changing the core clinical extractor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
