import { MedicalReport, ExtractedEntity } from '../types';

export class OcrService {
  /**
   * Simulates OCR document entity parsing with realistic laboratory parameters
   */
  public async processMedicalDocument(
    file: File | { name: string; type: string; size: number },
    patientId: string
  ): Promise<MedicalReport> {
    // Artificial latency to simulate OCR processing in UI
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const fileName = file.name.toLowerCase();

    // Differentiate report type based on file name or default to CBC
    if (fileName.includes('prescription') || fileName.includes('rx')) {
      return {
        id: `REP-${Date.now()}`,
        patientId,
        title: 'Outpatient Prescription & Treatment Sheet',
        type: 'Prescription',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        fileType: 'JPG',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        ocrStatus: 'processed',
        extractedEntities: [
          { parameter: 'Rx 1: Tab Paracetamol 650mg', value: '1 Tab SOS', unit: 'Oral', referenceRange: 'Max 3g/day', status: 'normal' },
          { parameter: 'Rx 2: Tab Pantoprazole 40mg', value: '1 Tab OD', unit: 'Oral (Empty stomach)', referenceRange: 'Before breakfast', status: 'normal' },
          { parameter: 'Rx 3: ORS Electral Sachet', value: '1 Sachet in 1L water', unit: 'Oral hydration', referenceRange: 'Ad libitum', status: 'normal' },
        ],
        summary: 'Prescription slip OCR extracted 3 oral medications. Verified clear handwriting and dosage parameters.',
      };
    }

    if (fileName.includes('lipid') || fileName.includes('sugar') || fileName.includes('glucose')) {
      return {
        id: `REP-${Date.now()}`,
        patientId,
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        type: 'Blood Test',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        fileType: 'PDF',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        ocrStatus: 'processed',
        extractedEntities: [
          { parameter: 'Fasting Plasma Glucose', value: '138', unit: 'mg/dL', referenceRange: '70 - 99', status: 'high' },
          { parameter: 'Total Cholesterol', value: '215', unit: 'mg/dL', referenceRange: '< 200', status: 'high' },
          { parameter: 'Triglycerides', value: '190', unit: 'mg/dL', referenceRange: '< 150', status: 'high' },
          { parameter: 'HDL Cholesterol', value: '42', unit: 'mg/dL', referenceRange: '> 40', status: 'normal' },
          { parameter: 'LDL Cholesterol', value: '135', unit: 'mg/dL', referenceRange: '< 100', status: 'high' },
        ],
        summary: 'Elevated fasting blood glucose and dyslipidemia noted. Clinician review advised for dietary & pharmacological management.',
      };
    }

    // Standard default: Complete Blood Count (CBC)
    const entities: ExtractedEntity[] = [
      { parameter: 'Hemoglobin (Hb)', value: '11.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'low' },
      { parameter: 'Total Leucocyte Count (TLC)', value: '8,200', unit: '/mcL', referenceRange: '4,000 - 11,000', status: 'normal' },
      { parameter: 'Platelet Count', value: '1,92,000', unit: '/mcL', referenceRange: '1,50,000 - 4,50,000', status: 'normal' },
      { parameter: 'Packed Cell Volume (PCV)', value: '34.8', unit: '%', referenceRange: '36.0 - 46.0', status: 'low' },
      { parameter: 'ESR (1st Hour)', value: '26', unit: 'mm/hr', referenceRange: '0 - 20', status: 'high' },
    ];

    return {
      id: `REP-${Date.now()}`,
      patientId,
      title: 'Automated Hematology: Complete Blood Count (CBC)',
      type: 'Blood Test',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fileType: fileName.endsWith('.pdf') ? 'PDF' : fileName.endsWith('.png') ? 'PNG' : 'JPG',
      fileSize: file.size ? `${(file.size / 1024).toFixed(1)} KB` : '1.2 MB',
      ocrStatus: 'processed',
      extractedEntities: entities,
      summary: 'OCR processed successfully. Mild microcytic hypochromic picture with borderline elevated ESR. Platelets well preserved.',
    };
  }
}

export const ocrService = new OcrService();
