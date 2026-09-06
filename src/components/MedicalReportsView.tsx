import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Paperclip,
  Eye,
  Plus,
} from 'lucide-react';
import { MedicalReport, Patient } from '../types';
import { ocrService } from '../services/ocrService';
import { auditService } from '../services/auditService';

interface MedicalReportsViewProps {
  patient: Patient;
  reports: MedicalReport[];
  onAddReport: (report: MedicalReport) => void;
}

export const MedicalReportsView: React.FC<MedicalReportsViewProps> = ({
  patient,
  reports,
  onAddReport,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<MedicalReport>(reports[0]);

  // Handle mock report upload or sample selection
  const handleSimulatedUpload = async (reportType: string) => {
    setIsProcessing(true);
    setProcessingStep('1/3 Scanning document boundary & optical character recognition (OCR)...');

    setTimeout(() => {
      setProcessingStep('2/3 Detecting clinical laboratory entities & reference intervals...');
    }, 600);

    const mockFile = {
      name:
        reportType === 'cbc'
          ? `${patient.name.replace(' ', '_')}_CBC_Blood_Report.pdf`
          : reportType === 'sugar'
          ? `${patient.name.replace(' ', '_')}_Lipid_Glucose_Panel.pdf`
          : `${patient.name.replace(' ', '_')}_OPD_Prescription.jpg`,
      type: reportType === 'prescription' ? 'image/jpeg' : 'application/pdf',
      size: 1420000,
    };

    const parsedReport = await ocrService.processMedicalDocument(mockFile, patient.id);
    setIsProcessing(false);
    onAddReport(parsedReport);
    setSelectedReport(parsedReport);

    auditService.addEvent(
      'AI Copilot',
      'SwasthyaAI OCR Subsystem',
      'Medical Report OCR Processed',
      `Processed ${parsedReport.title} for patient ${patient.name}. Extracted ${parsedReport.extractedEntities.length} clinical parameters.`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStep('Analyzing uploaded document and extracting clinical text...');

    ocrService.processMedicalDocument(file, patient.id).then((parsed) => {
      setIsProcessing(false);
      onAddReport(parsed);
      setSelectedReport(parsed);
      auditService.addEvent(
        'Doctor',
        'Dr. Ananya Sharma',
        'Document Uploaded & Processed',
        `Uploaded ${file.name} for patient ${patient.name}.`
      );
    });
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner */}
      <div
        className="clinical-card"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Medical Reports & OCR Extraction</h2>
              <span className="badge badge-processing">
                <Sparkles size={12} /> AI Entity Extraction
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
              Digitize handwritten prescriptions, CBC blood reports, and radiology summaries into structured FHIR records for {patient.name}.
            </p>
          </div>

          {/* Quick Demo Upload Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSimulatedUpload('cbc')}
              disabled={isProcessing}
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
              + Demo CBC Blood Report
            </button>

            <button
              onClick={() => handleSimulatedUpload('sugar')}
              disabled={isProcessing}
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
              + Demo Glucose / Lipid Panel
            </button>

            <button
              onClick={() => handleSimulatedUpload('prescription')}
              disabled={isProcessing}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#f3e8ff',
                color: '#7c3aed',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid #ddd6fe',
                cursor: 'pointer',
              }}
            >
              + Demo Prescription Slip
            </button>
          </div>
        </div>
      </div>

      {/* Processing Indicator Modal / Overlay */}
      {isProcessing && (
        <div
          style={{
            padding: '24px',
            marginBottom: '20px',
            borderRadius: '12px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            textAlign: 'center',
          }}
        >
          <Sparkles size={32} color="#059669" style={{ margin: '0 auto 8px auto', animation: 'spin 2s linear infinite' }} />
          <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1rem' }}>
            Processing Medical Document
          </div>
          <div style={{ color: '#047857', fontSize: '0.875rem', marginTop: '4px' }}>
            {processingStep}
          </div>
        </div>
      )}

      {/* 2-Column Document Workspace */}
      <div className="grid-2">
        {/* LEFT: Upload Box & Reports List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Drag & Drop Upload Zone */}
          <div
            className="clinical-card"
            style={{
              border: '2px dashed #cbd5e1',
              textAlign: 'center',
              padding: '30px 20px',
              background: '#f8fafc',
            }}
          >
            <UploadCloud size={40} color="#0284c7" style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Upload Medical Report or Prescription
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '6px 0 16px 0' }}>
              Supports PDF, JPG, PNG (Scans, Lab Slips, Prescriptions)
            </p>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <Paperclip size={16} />
              Browse Files
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* List of Available Reports */}
          <div className="clinical-card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="#0284c7" />
                <span>Uploaded Documents ({reports.length})</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '8px',
                      background: isSelected ? '#e0f2fe' : '#ffffff',
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: rep.fileType === 'PDF' ? '#fee2e2' : '#fef3c7',
                          color: rep.fileType === 'PDF' ? '#dc2626' : '#d97706',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        {rep.fileType}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                          {rep.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {rep.date} • {rep.fileSize}
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-approved" style={{ fontSize: '0.6875rem' }}>
                      {rep.ocrStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: OCR Extracted Entities & Clinical Verification */}
        <div>
          {selectedReport ? (
            <div className="clinical-card">
              <div className="card-header">
                <div className="card-title">
                  <FileCheck size={20} color="#059669" />
                  <span>OCR Extracted Clinical Entities</span>
                </div>
                <span className="badge badge-approved">
                  <CheckCircle2 size={12} /> OCR Processed
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedReport.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                  Date: {selectedReport.date} • File: {selectedReport.fileType} ({selectedReport.fileSize})
                </p>
              </div>

              {/* Clinical summary */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8125rem',
                  color: '#334155',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}
              >
                <strong>OCR AI Summary:</strong> {selectedReport.summary}
              </div>

              {/* Entities Table */}
              <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Parameter</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Value</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Ref Range</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.extractedEntities.map((entity, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', fontWeight: 600, color: '#0f172a' }}>
                          {entity.parameter}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 700, color: entity.status !== 'normal' ? '#b45309' : '#0f172a' }}>
                          {entity.value} {entity.unit}
                        </td>
                        <td style={{ padding: '10px', color: '#64748b' }}>
                          {entity.referenceRange}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span
                            className={`badge ${
                              entity.status === 'normal'
                                ? 'badge-approved'
                                : entity.status === 'high'
                                ? 'badge-draft'
                                : 'badge-alert'
                            }`}
                            style={{ fontSize: '0.6875rem' }}
                          >
                            {entity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clinician Approval Notice */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.75rem',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} color="#059669" />
                <span>
                  OCR values mapped to LOINC standard and attached to longitudinal health record.
                </span>
              </div>
            </div>
          ) : (
            <div className="clinical-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#64748b' }}>Select a report on the left to view extracted entities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
