import React, { useState } from 'react';
import {
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditLogViewProps {
  logs: AuditEvent[];
  onRefresh: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || log.actorRole.toUpperCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swasthya_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div
        className="clinical-card"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', marginBottom: '8px' }}>
              <Lock size={14} color="#38bdf8" />
              <span>Immutable Cryptographic Audit Trail • ABDM & HIPAA Aligned</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              System Security & Clinical Audit Logs
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>
              Every clinical extraction, voice intake consent, clinician edit, and case approval is tracked with timestamp and role-based access control.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button
              onClick={exportLogsAsJson}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Download size={14} /> Export Audit JSON
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="clinical-card"
        style={{
          marginBottom: '20px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by action, actor, or detail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.875rem',
              color: '#0f172a',
            }}
          />
        </div>

        {/* Role Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'DOCTOR', 'PATIENT', 'AI COPILOT', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: roleFilter === role ? '#0284c7' : '#f1f5f9',
                color: roleFilter === role ? '#ffffff' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="clinical-card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Timestamp</th>
                <th style={{ padding: '12px 14px' }}>Actor</th>
                <th style={{ padding: '12px 14px' }}>Role</th>
                <th style={{ padding: '12px 14px' }}>Action</th>
                <th style={{ padding: '12px 14px' }}>Details</th>
                <th style={{ padding: '12px 14px' }}>Node / IP</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontFamily: 'monospace', color: '#64748b' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                    {log.actorName}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background:
                          log.actorRole === 'Doctor'
                            ? '#ecfdf5'
                            : log.actorRole === 'AI Copilot'
                            ? '#f5f3ff'
                            : log.actorRole === 'Patient'
                            ? '#e0f2fe'
                            : '#fef3c7',
                        color:
                          log.actorRole === 'Doctor'
                            ? '#059669'
                            : log.actorRole === 'AI Copilot'
                            ? '#7c3aed'
                            : log.actorRole === 'Patient'
                            ? '#0284c7'
                            : '#d97706',
                      }}
                    >
                      {log.actorRole}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#475569', maxWidth: '360px' }}>
                    {log.details}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {log.ipAddress}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span
                      className={`badge ${
                        log.status === 'SUCCESS'
                          ? 'badge-approved'
                          : log.status === 'ALERT'
                          ? 'badge-alert'
                          : 'badge-processing'
                      }`}
                      style={{ fontSize: '0.6875rem' }}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
