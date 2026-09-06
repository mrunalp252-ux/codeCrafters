import { AuditEvent } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data/mockData';

const STORAGE_KEY = 'swasthya_audit_logs';

class AuditService {
  private logs: AuditEvent[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.logs = JSON.parse(saved);
          return;
        }
      } catch (e) {
        console.error('Error loading audit logs:', e);
      }
    }
    this.logs = [...INITIAL_AUDIT_LOGS];
  }

  private saveLogs() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
      } catch (e) {
        console.error('Error saving audit logs:', e);
      }
    }
  }

  public getLogs(): AuditEvent[] {
    return [...this.logs];
  }

  public addEvent(
    actorRole: AuditEvent['actorRole'],
    actorName: string,
    action: string,
    details: string,
    status: AuditEvent['status'] = 'SUCCESS'
  ): AuditEvent {
    const newEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actorRole,
      actorName,
      action,
      details,
      status,
      ipAddress: '192.168.1.104 (ABDM Node Baramati)',
    };

    this.logs.unshift(newEvent);
    this.saveLogs();
    return newEvent;
  }

  public clearLogs() {
    this.logs = [...INITIAL_AUDIT_LOGS];
    this.saveLogs();
  }
}

export const auditService = new AuditService();
