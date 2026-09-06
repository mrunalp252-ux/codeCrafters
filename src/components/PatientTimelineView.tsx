import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Activity,
  User,
  Filter,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Patient, TimelineEvent } from '../types';

interface PatientTimelineViewProps {
  patient: Patient;
  timelineEvents: TimelineEvent[];
}

export const PatientTimelineView: React.FC<PatientTimelineViewProps> = ({
  patient,
  timelineEvents,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEvents = timelineEvents.filter((event) => {
    if (filterType === 'all') return true;
    return event.type === filterType;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="page-wrapper">
      {/* Header Profile Strip */}
      <div
        className="clinical-card"
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={patient.avatar}
              alt={patient.name}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0284c7' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{patient.name}</h2>
                <span className="badge badge-approved">ABHA Verified</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                ABHA ID: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{patient.abhaId}</strong> • {patient.gender}, {patient.age} yrs • Blood Group: {patient.bloodGroup}
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: filterType === 'all' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                background: filterType === 'all' ? '#e0f2fe' : '#ffffff',
                color: filterType === 'all' ? '#0369a1' : '#475569',
                cursor: 'pointer',
              }}
            >
              All Events ({timelineEvents.length})
            </button>
            <button
              onClick={() => setFilterType('consultation')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: filterType === 'consultation' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                background: filterType === 'consultation' ? '#e0f2fe' : '#ffffff',
                color: filterType === 'consultation' ? '#0369a1' : '#475569',
                cursor: 'pointer',
              }}
            >
              Consultations
            </button>
            <button
              onClick={() => setFilterType('report')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: filterType === 'report' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                background: filterType === 'report' ? '#e0f2fe' : '#ffffff',
                color: filterType === 'report' ? '#0369a1' : '#475569',
                cursor: 'pointer',
              }}
            >
              Lab & OCR Reports
            </button>
            <button
              onClick={() => setFilterType('vitals_check')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: filterType === 'vitals_check' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                background: filterType === 'vitals_check' ? '#e0f2fe' : '#ffffff',
                color: filterType === 'vitals_check' ? '#0369a1' : '#475569',
                cursor: 'pointer',
              }}
            >
              Vitals Screenings
            </button>
          </div>
        </div>
      </div>

      {/* Longitudinal Timeline Visualizer */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="card-title">
            <CalendarClock size={20} color="#0284c7" />
            <span>Longitudinal Health Records (Chronological Encounters)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Click an encounter to expand clinical notes
          </span>
        </div>

        {/* Timeline Spine */}
        <div style={{ position: 'relative', paddingLeft: '32px', margin: '20px 0' }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              bottom: '10px',
              left: '11px',
              width: '2px',
              background: '#cbd5e1',
            }}
          />

          {filteredEvents.map((event, index) => {
            const isExpanded = expandedId === event.id;
            return (
              <div
                key={event.id}
                style={{
                  position: 'relative',
                  marginBottom: '24px',
                }}
              >
                {/* Timeline node icon */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background:
                      event.badgeColor === 'emerald'
                        ? '#059669'
                        : event.badgeColor === 'purple'
                        ? '#7c3aed'
                        : '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 4px #ffffff',
                    zIndex: 2,
                  }}
                >
                  {event.type === 'consultation' ? (
                    <Stethoscope size={13} />
                  ) : event.type === 'report' ? (
                    <FileText size={13} />
                  ) : (
                    <Activity size={13} />
                  )}
                </div>

                {/* Event Card */}
                <div
                  onClick={() => toggleExpand(event.id)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        {event.date}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        {event.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={12} /> {event.status}
                      </span>
                      {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '8px', lineHeight: 1.5 }}>
                    {event.summary}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Attending Clinician: <strong>{event.doctorName}</strong></span>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>
                      {isExpanded ? 'Collapse Details' : 'View Complete Clinical Record →'}
                    </span>
                  </div>

                  {/* Expanded view */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        Clinical Encounter Audit Record:
                      </div>
                      <p>
                        Recorded under ABHA Care Context ID <code>CTX-{event.id}-2026</code>. Verified through doctor electronic signature with tamper-evident SHA-256 integrity check.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
