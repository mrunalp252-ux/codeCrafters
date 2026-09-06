import { Consultation, Patient } from '../types';

export interface FhirBundle {
  resourceType: 'Bundle';
  type: 'transaction';
  entry: Array<{
    fullUrl: string;
    resource: any;
  }>;
}

class StorageService {
  private isOffline: boolean = false;
  private queuedItems: Array<{ type: string; data: any; timestamp: string }> = [];

  public getIsOffline(): boolean {
    return this.isOffline;
  }

  public toggleOffline(): boolean {
    this.isOffline = !this.isOffline;
    return this.isOffline;
  }

  public getQueueCount(): number {
    return this.queuedItems.length;
  }

  public enqueueOfflineAction(type: string, data: any) {
    this.queuedItems.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  public async syncQueue(): Promise<number> {
    const count = this.queuedItems.length;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    this.queuedItems = [];
    return count;
  }

  /**
   * Generates ABDM & FHIR R4 Compliant JSON Bundle for verified consultations
   */
  public generateFhirBundle(consultation: Consultation, patient: Patient): FhirBundle {
    return {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: 'Patient',
            id: patient.id,
            identifier: [
              {
                system: 'https://healthid.ndhm.gov.in',
                value: patient.abhaId,
              },
            ],
            name: [{ text: patient.name }],
            gender: patient.gender.toLowerCase(),
            telecom: [{ system: 'phone', value: patient.phone }],
          },
        },
        {
          fullUrl: `urn:uuid:encounter-${consultation.id}`,
          resource: {
            resourceType: 'Encounter',
            id: consultation.id,
            status: consultation.status === 'APPROVED' ? 'finished' : 'in-progress',
            class: {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'AMB',
              display: 'ambulatory / outpatient',
            },
            subject: {
              reference: `urn:uuid:patient-${patient.id}`,
              display: patient.name,
            },
            period: {
              start: consultation.startedAt,
              end: consultation.approvedAt || consultation.endedAt,
            },
          },
        },
        {
          fullUrl: `urn:uuid:condition-${consultation.id}-1`,
          resource: {
            resourceType: 'Condition',
            clinicalStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'active',
                },
              ],
            },
            verificationStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                  code: consultation.status === 'APPROVED' ? 'confirmed' : 'provisional',
                },
              ],
            },
            code: {
              text: consultation.findings.chiefComplaint,
            },
            subject: {
              reference: `urn:uuid:patient-${patient.id}`,
            },
          },
        },
        {
          fullUrl: `urn:uuid:observation-${consultation.id}-temp`,
          resource: {
            resourceType: 'Observation',
            status: 'final',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8310-5',
                  display: 'Body temperature',
                },
              ],
              text: 'Reported Body Temperature',
            },
            valueString: consultation.findings.reportedTemperature || 'Not provided',
            subject: {
              reference: `urn:uuid:patient-${patient.id}`,
            },
          },
        },
      ],
    };
  }
}

export const storageService = new StorageService();
