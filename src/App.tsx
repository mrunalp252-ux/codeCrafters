import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ConsultationView } from './components/ConsultationView';
import { PatientVoiceKiosk } from './components/PatientVoiceKiosk';
import { PatientTimelineView } from './components/PatientTimelineView';
import { MedicalReportsView } from './components/MedicalReportsView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';
import { AbdmFhirModal } from './components/AbdmFhirModal';
import { SihDemoController } from './components/SihDemoController';
import {
  UserRole,
  LanguageCode,
  Patient,
  Consultation,
  TimelineEvent,
  MedicalReport,
  AuditEvent,
} from './types';
import {
  MOCK_PATIENTS,
  CURRENT_DOCTOR,
  INITIAL_TIMELINE_EVENTS,
  MOCK_REPORTS,
} from './data/mockData';
import { auditService } from './services/auditService';
import { storageService } from './services/storageService';

export const App: React.FC = () => {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('doctor');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Patient & Clinical State
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(MOCK_PATIENTS[1]); // Default to Sunita Patil (Marathi)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('mr');

  // Timeline & Medical Reports Data
  const [timelineMap, setTimelineMap] = useState<Record<string, TimelineEvent[]>>(INITIAL_TIMELINE_EVENTS);
  const [reports, setReports] = useState<MedicalReport[]>(MOCK_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(auditService.getLogs());

  // Interoperability & Connectivity State
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(storageService.getIsOffline());
  const [queuedCount, setQueuedCount] = useState(storageService.getQueueCount());
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);

  // Switch Active Patient
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentLanguage(patient.preferredLanguage);
    auditService.addEvent(
      'Doctor',
      CURRENT_DOCTOR.name,
      'Switched Active Patient',
      `Active clinical context switched to patient ${patient.name} (${patient.id}, ABHA: ${patient.abhaId})`
    );
    setAuditLogs(auditService.getLogs());
  };

  // Switch Role
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentTab('audit');
    }
    auditService.addEvent(
      role === 'doctor' ? 'Doctor' : role === 'patient' ? 'Patient' : 'Admin',
      role === 'doctor' ? CURRENT_DOCTOR.name : role === 'patient' ? selectedPatient.name : 'System Admin',
      'Role View Changed',
      `Interface mode changed to ${role.toUpperCase()}`
    );
    setAuditLogs(auditService.getLogs());
  };

  // Case Approved by Doctor
  const handleCaseApproved = (consultation: Consultation) => {
    setActiveConsultation(consultation);

    // Add new timeline event for this patient
    const newTimelineEvent: TimelineEvent = {
      id: `TLE-${Date.now()}`,
      patientId: selectedPatient.id,
      date: 'Today (' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ')',
      type: 'consultation',
      title: `${consultation.findings.chiefComplaint} Consultation`,
      summary: `Doctor verified case: ${consultation.soapCase.assessment.clinicalSummary}. Advised: ${consultation.soapCase.plan.provisionalAdvice.slice(0, 100)}...`,
      doctorName: CURRENT_DOCTOR.name,
      status: 'Doctor Approved',
      badgeColor: 'emerald',
    };

    setTimelineMap((prev) => ({
      ...prev,
      [selectedPatient.id]: [newTimelineEvent, ...(prev[selectedPatient.id] || [])],
    }));

    setAuditLogs(auditService.getLogs());

    // If offline, queue for sync
    if (isOffline) {
      storageService.enqueueOfflineAction('CONSULTATION_APPROVED', consultation);
      setQueuedCount(storageService.getQueueCount());
    }
  };

  // Add newly processed report
  const handleAddReport = (newReport: MedicalReport) => {
    setReports((prev) => [newReport, ...prev]);

    // Also add to timeline
    const newTimelineEvent: TimelineEvent = {
      id: `TLE-REP-${Date.now()}`,
      patientId: selectedPatient.id,
      date: newReport.date,
      type: 'report',
      title: newReport.title,
      summary: newReport.summary,
      doctorName: 'Automated OCR & Pathologist Verification',
      status: 'Verified',
      badgeColor: 'purple',
    };

    setTimelineMap((prev) => ({
      ...prev,
      [selectedPatient.id]: [newTimelineEvent, ...(prev[selectedPatient.id] || [])],
    }));

    setAuditLogs(auditService.getLogs());
  };

  // Toggle Rural Offline PHC mode
  const handleToggleOffline = () => {
    const nextState = storageService.toggleOffline();
    setIsOffline(nextState);
    auditService.addEvent(
      'Admin',
      'System Operator',
      'Connectivity Status Toggled',
      `Switched network state to: ${nextState ? 'OFFLINE (Local Browser Cache)' : 'ONLINE (ABDM Cloud)'}`,
      nextState ? 'ALERT' : 'SUCCESS'
    );
    setAuditLogs(auditService.getLogs());
  };

  // Sync queued records
  const handleSyncOffline = async () => {
    const synced = await storageService.syncQueue();
    setQueuedCount(0);
    auditService.addEvent(
      'AI Copilot',
      'ABDM Sync Engine',
      'Queued Records Synchronized',
      `Successfully synced ${synced} cached clinical encounters with National Health Authority cloud.`
    );
    setAuditLogs(auditService.getLogs());
  };

  // Trigger SIH Demo Scenarios
  const handleTriggerScenario = (scenarioKey: 'mr-sunita' | 'hi-aarav' | 'en-emergency') => {
    setCurrentRole('doctor');
    setCurrentTab('consultation');

    if (scenarioKey === 'mr-sunita') {
      const sunita = patients.find((p) => p.id === 'P-102') || patients[1];
      setSelectedPatient(sunita);
      setCurrentLanguage('mr');
    } else if (scenarioKey === 'hi-aarav') {
      const aarav = patients.find((p) => p.id === 'P-101') || patients[0];
      setSelectedPatient(aarav);
      setCurrentLanguage('hi');
    } else if (scenarioKey === 'en-emergency') {
      const priya = patients.find((p) => p.id === 'P-104') || patients[3];
      setSelectedPatient(priya);
      setCurrentLanguage('en');
    }
  };

  // Get current patient timeline events
  const currentTimeline = timelineMap[selectedPatient.id] || [];

  return (
    <div className="app-container">
      {/* Sidebar navigation for Doctor & Admin */}
      {currentRole !== 'patient' && (
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          patients={patients}
          selectedPatient={selectedPatient}
          onSelectPatient={handleSelectPatient}
          pendingReviewsCount={2}
        />
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Sticky Top Navigation Bar */}
        <Navbar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          isOffline={isOffline}
          onToggleOffline={handleToggleOffline}
          onOpenFhirModal={() => setIsFhirModalOpen(true)}
          doctor={CURRENT_DOCTOR}
          queuedCount={queuedCount}
          onSyncOffline={handleSyncOffline}
        />

        {/* View Switcher Based on Role and Tab */}
        {currentRole === 'patient' ? (
          <PatientVoiceKiosk
            patient={selectedPatient}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onSwitchToDoctor={() => {
              setCurrentRole('doctor');
              setCurrentTab('consultation');
            }}
            onReportUploadClick={() => {
              setCurrentRole('doctor');
              setCurrentTab('reports');
            }}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                doctor={CURRENT_DOCTOR}
                patients={patients}
                onSelectPatient={handleSelectPatient}
                onStartNewConsultation={(pat) => {
                  handleSelectPatient(pat);
                  setCurrentTab('consultation');
                }}
                onViewReports={() => setCurrentTab('reports')}
                pendingReviewsCount={2}
              />
            )}

            {currentTab === 'consultation' && (
              <ConsultationView
                patient={selectedPatient}
                doctor={CURRENT_DOCTOR}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                onCaseApproved={handleCaseApproved}
              />
            )}

            {currentTab === 'timeline' && (
              <PatientTimelineView
                patient={selectedPatient}
                timelineEvents={currentTimeline}
              />
            )}

            {currentTab === 'reports' && (
              <MedicalReportsView
                patient={selectedPatient}
                reports={reports.filter((r) => r.patientId === selectedPatient.id || r.patientId === 'P-102')}
                onAddReport={handleAddReport}
              />
            )}

            {currentTab === 'audit' && (
              <AuditLogView
                logs={auditLogs}
                onRefresh={() => setAuditLogs(auditService.getLogs())}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                isOffline={isOffline}
                onToggleOffline={handleToggleOffline}
                queuedCount={queuedCount}
                onSyncOffline={handleSyncOffline}
              />
            )}
          </>
        )}
      </main>

      {/* ABDM & FHIR R4 Bundle Modal */}
      <AbdmFhirModal
        isOpen={isFhirModalOpen}
        onClose={() => setIsFhirModalOpen(false)}
        patient={selectedPatient}
        consultation={activeConsultation}
      />

      {/* Floating SIH 2026 Interactive Demo Controller Bar */}
      <SihDemoController
        onTriggerScenario={handleTriggerScenario}
        onReset={() => {
          setCurrentTab('consultation');
        }}
      />
    </div>
  );
};

export default App;
