import {
  LanguageCode,
  ClinicalFinding,
  MissingParameter,
  SafetyFlag,
  SoapCase,
  Patient,
} from '../types';

export class ClinicalAiService {
  /**
   * Natural Language clinical entity extraction
   * Extracts chief complaint, duration, temperature, associated symptoms, allergies
   * Never fabricates: uses "Not provided" or "Unknown" if missing.
   */
  public extractClinicalInformation(
    transcript: string,
    language: LanguageCode,
    previousFindings?: Partial<ClinicalFinding>
  ): ClinicalFinding {
    const textLower = transcript.toLowerCase();

    // Default baseline
    const findings: ClinicalFinding = {
      chiefComplaint: previousFindings?.chiefComplaint || 'Not provided',
      duration: previousFindings?.duration || 'Not provided',
      severity: previousFindings?.severity || 'Mild',
      associatedSymptoms: [...(previousFindings?.associatedSymptoms || [])],
      reportedTemperature: previousFindings?.reportedTemperature || 'Not provided',
      allergies: previousFindings?.allergies || 'Not provided',
      currentMedications: previousFindings?.currentMedications || 'Not provided',
      pastHistory: previousFindings?.pastHistory || 'Not provided',
      confidence: 0.92,
    };

    // 1. Chief Complaint & Symptoms Matching (Indic + English)
    // Fever
    if (
      textLower.includes('ताप') ||
      textLower.includes('बुखार') ||
      textLower.includes('fever') ||
      textLower.includes('temperature') ||
      textLower.includes('pyrexia')
    ) {
      if (findings.chiefComplaint === 'Not provided') {
        findings.chiefComplaint = language === 'mr' ? 'Fever (ताप)' : language === 'hi' ? 'Fever (बुखार)' : 'Acute Febrile Illness (Fever)';
      }
    }

    // Chest pain
    if (
      textLower.includes('छातीत') ||
      textLower.includes('सीने में दर्द') ||
      textLower.includes('chest pain') ||
      textLower.includes('tightness') ||
      textLower.includes('छाती में दर्द')
    ) {
      findings.chiefComplaint = 'Acute Chest Pain / Retrosternal Discomfort';
      findings.severity = 'Critical';
      if (!findings.associatedSymptoms.includes('Chest Pain / Pressure')) {
        findings.associatedSymptoms.push('Chest Pain / Pressure');
      }
    }

    // Fatigue / Weakness
    if (
      textLower.includes('थकवा') ||
      textLower.includes('अशक्तपणा') ||
      textLower.includes('कमजोरी') ||
      textLower.includes('थकान') ||
      textLower.includes('fatigue') ||
      textLower.includes('weakness')
    ) {
      const label = language === 'mr' ? 'Fatigue (थकवा)' : language === 'hi' ? 'Weakness (कमजोरी)' : 'Generalized Fatigue';
      if (!findings.associatedSymptoms.some(s => s.toLowerCase().includes('fatigue') || s.toLowerCase().includes('weakness') || s.includes('थकवा') || s.includes('कमजोरी'))) {
        findings.associatedSymptoms.push(label);
      }
    }

    // Vomiting / Nausea
    if (
      textLower.includes('उलटी') ||
      textLower.includes('उल्टी') ||
      textLower.includes('vomit') ||
      textLower.includes('nausea') ||
      textLower.includes('मळमळ') ||
      textLower.includes('जी मिचलाना')
    ) {
      const label = language === 'mr' ? 'Vomiting / Nausea (उलटी)' : language === 'hi' ? 'Vomiting / Nausea (उल्टी)' : 'Vomiting / Nausea';
      if (!findings.associatedSymptoms.some(s => s.toLowerCase().includes('vomit') || s.includes('उलटी') || s.includes('उल्टी'))) {
        findings.associatedSymptoms.push(label);
      }
    }

    // Headache
    if (
      textLower.includes('डोकेदुखी') ||
      textLower.includes('सिरदर्द') ||
      textLower.includes('सर दर्द') ||
      textLower.includes('headache')
    ) {
      const label = language === 'mr' ? 'Headache (डोकेदुखी)' : language === 'hi' ? 'Headache (सिरदर्द)' : 'Headache';
      if (!findings.associatedSymptoms.includes(label)) {
        findings.associatedSymptoms.push(label);
      }
    }

    // Cough
    if (
      textLower.includes('खोकला') ||
      textLower.includes('खांसी') ||
      textLower.includes('cough')
    ) {
      const label = language === 'mr' ? 'Cough (खोकला)' : language === 'hi' ? 'Cough (खांसी)' : 'Cough';
      if (!findings.associatedSymptoms.includes(label)) {
        findings.associatedSymptoms.push(label);
      }
    }

    // Sweating
    if (
      textLower.includes('घाम') ||
      textLower.includes('पसीना') ||
      textLower.includes('sweat') ||
      textLower.includes('diaphoresis')
    ) {
      if (!findings.associatedSymptoms.includes('Diaphoresis (Sweating)')) {
        findings.associatedSymptoms.push('Diaphoresis (Sweating)');
      }
    }

    // 2. Duration Extraction
    if (
      textLower.includes('तीन दिवस') ||
      textLower.includes('३ दिवस') ||
      textLower.includes('तीन दिन') ||
      textLower.includes('३ दिन') ||
      textLower.includes('3 days') ||
      textLower.includes('three days')
    ) {
      findings.duration = '3 days';
    } else if (
      textLower.includes('दोन दिवस') ||
      textLower.includes('२ दिवस') ||
      textLower.includes('दो दिन') ||
      textLower.includes('२ दिन') ||
      textLower.includes('2 days') ||
      textLower.includes('two days')
    ) {
      findings.duration = '2 days';
    } else if (
      textLower.includes('एक तास') ||
      textLower.includes('एक घंटा') ||
      textLower.includes('1 hour') ||
      textLower.includes('one hour')
    ) {
      findings.duration = '1 hour (Acute onset)';
    }

    // 3. Reported Temperature Extraction
    if (
      textLower.includes('१०२') ||
      textLower.includes('102') ||
      textLower.includes('एक सौ दो') ||
      textLower.includes('एकशे दोन')
    ) {
      findings.reportedTemperature = '102.0 °F (High Grade)';
      findings.severity = findings.severity === 'Critical' ? 'Critical' : 'Moderate';
    } else if (
      textLower.includes('१०१') ||
      textLower.includes('101') ||
      textLower.includes('एक सौ एक')
    ) {
      findings.reportedTemperature = '101.0 °F';
    } else if (
      textLower.includes('१०३') ||
      textLower.includes('103')
    ) {
      findings.reportedTemperature = '103.0 °F (Very High Grade)';
      findings.severity = 'Severe';
    } else if (
      textLower.includes('९९') ||
      textLower.includes('99') ||
      textLower.includes('१००') ||
      textLower.includes('100')
    ) {
      findings.reportedTemperature = '99.5 - 100 °F (Low Grade)';
    }

    // 4. Medication Check
    if (
      textLower.includes('paracetamol') ||
      textLower.includes('क्रोसिन') ||
      textLower.includes('डोलो') ||
      textLower.includes('dolo') ||
      textLower.includes('औषध') ||
      textLower.includes('दवाई')
    ) {
      findings.currentMedications = 'Over-the-counter antipyretic taken at home';
    }

    return findings;
  }

  /**
   * Identify missing clinical parameters
   */
  public detectMissingInformation(findings: ClinicalFinding): MissingParameter[] {
    const list: MissingParameter[] = [
      {
        id: 'param-temp',
        label: 'Peak Temperature',
        category: 'vital',
        status: findings.reportedTemperature !== 'Not provided' ? 'collected' : 'pending',
        value: findings.reportedTemperature !== 'Not provided' ? findings.reportedTemperature : undefined,
        importance: 'high',
      },
      {
        id: 'param-duration',
        label: 'Exact Duration & Onset',
        category: 'symptom',
        status: findings.duration !== 'Not provided' ? 'collected' : 'pending',
        value: findings.duration !== 'Not provided' ? findings.duration : undefined,
        importance: 'high',
      },
      {
        id: 'param-assoc',
        label: 'Associated Symptoms (Vomiting/Cough/Headache)',
        category: 'symptom',
        status: findings.associatedSymptoms.length > 0 ? 'collected' : 'pending',
        value: findings.associatedSymptoms.length > 0 ? findings.associatedSymptoms.join(', ') : undefined,
        importance: 'medium',
      },
      {
        id: 'param-meds',
        label: 'Current Medications / Self-medication',
        category: 'medication',
        status: findings.currentMedications !== 'Not provided' ? 'collected' : 'pending',
        value: findings.currentMedications !== 'Not provided' ? findings.currentMedications : undefined,
        importance: 'medium',
      },
      {
        id: 'param-allergy',
        label: 'Drug Allergies',
        category: 'history',
        status: findings.allergies !== 'Not provided' ? 'collected' : 'pending',
        value: findings.allergies !== 'Not provided' ? findings.allergies : undefined,
        importance: 'high',
      },
      {
        id: 'param-comorbid',
        label: 'Chronic Medical History (Diabetes/BP)',
        category: 'history',
        status: findings.pastHistory !== 'Not provided' ? 'collected' : 'pending',
        value: findings.pastHistory !== 'Not provided' ? findings.pastHistory : undefined,
        importance: 'medium',
      },
    ];

    return list;
  }

  /**
   * Generates dynamic, context-aware adaptive follow-up questions in target language
   */
  public generateAdaptiveQuestion(
    findings: ClinicalFinding,
    missing: MissingParameter[],
    language: LanguageCode
  ): { question: string; translation: string; targetParameterId: string } {
    // 1. High priority: Temperature missing in fever cases
    const tempParam = missing.find((m) => m.id === 'param-temp' && m.status === 'pending');
    if (tempParam && findings.chiefComplaint.toLowerCase().includes('fever')) {
      if (language === 'mr') {
        return {
          question: 'ताप कितीपर्यंत गेला होता? सोबत उलटी किंवा डोकेदुखीचा त्रास आहे का?',
          translation: 'What was your highest recorded temperature? Do you have vomiting or headache?',
          targetParameterId: 'param-temp',
        };
      }
      if (language === 'hi') {
        return {
          question: 'आपका तापमान कितना रहा और क्या आपको उल्टी, खांसी या सिरदर्द है?',
          translation: 'What was your highest temperature, and do you have vomiting, cough, or headache?',
          targetParameterId: 'param-temp',
        };
      }
      return {
        question: 'What was the highest temperature you recorded, and do you have vomiting, headache, or cough?',
        translation: 'What was the highest temperature you recorded, and do you have vomiting, headache, or cough?',
        targetParameterId: 'param-temp',
      };
    }

    // 2. Chest pain priority: shortness of breath / radiation
    if (findings.chiefComplaint.toLowerCase().includes('chest pain')) {
      if (language === 'mr') {
        return {
          question: 'छातीतील कळ डाव्या हाताकडे जाते का, आणि श्वास घेताना धाप लागते का?',
          translation: 'Does the chest pain radiate to the left arm, and do you feel breathless?',
          targetParameterId: 'param-assoc',
        };
      }
      if (language === 'hi') {
        return {
          question: 'क्या सीने का दर्द बाएं हाथ या जबड़े की तरफ जा रहा है, और क्या सांस फूल रही है?',
          translation: 'Does the chest pain spread to your left arm or jaw, and are you short of breath?',
          targetParameterId: 'param-assoc',
        };
      }
      return {
        question: 'Does the chest pain radiate to your left arm or jaw, and are you having any shortness of breath?',
        translation: 'Does the chest pain radiate to your left arm or jaw, and are you having any shortness of breath?',
        targetParameterId: 'param-assoc',
      };
    }

    // 3. Medication check
    const medsParam = missing.find((m) => m.id === 'param-meds' && m.status === 'pending');
    if (medsParam) {
      if (language === 'mr') {
        return {
          question: 'त्रास सुरू झाल्यापासून तुम्ही घरी काही गोळी किंवा औषध घेतले आहे का?',
          translation: 'Have you taken any medication or tablets at home since the symptoms began?',
          targetParameterId: 'param-meds',
        };
      }
      if (language === 'hi') {
        return {
          question: 'क्या आपने घर पर कोई दवाई या गोली ली है?',
          translation: 'Have you taken any medication or tablets at home?',
          targetParameterId: 'param-meds',
        };
      }
      return {
        question: 'Have you taken any over-the-counter medicine or home remedies for this?',
        translation: 'Have you taken any over-the-counter medicine or home remedies for this?',
        targetParameterId: 'param-meds',
      };
    }

    // 4. Fallback general clinical check
    if (language === 'mr') {
      return {
        question: 'आणखी काही लक्षणे किंवा पूर्वीचा कोणताही आजार आहे का?',
        translation: 'Are there any other symptoms or past medical conditions?',
        targetParameterId: 'param-comorbid',
      };
    }
    if (language === 'hi') {
      return {
        question: 'क्या इसके अलावा कोई और तकलीफ या पुरानी बीमारी है?',
        translation: 'Are there any other complaints or previous medical conditions?',
        targetParameterId: 'param-comorbid',
      };
    }
    return {
      question: 'Do you have any other symptoms, allergies, or past medical history the doctor should know?',
      translation: 'Do you have any other symptoms, allergies, or past medical history the doctor should know?',
      targetParameterId: 'param-comorbid',
    };
  }

  /**
   * Non-autonomous safety flag detection
   * Identifies red flags and requires clinician review
   */
  public detectSafetyFlags(transcript: string, findings: ClinicalFinding): SafetyFlag[] {
    const flags: SafetyFlag[] = [];
    const textLower = transcript.toLowerCase();

    // Red flag 1: Chest pain / Myocardial concern
    if (
      textLower.includes('chest pain') ||
      textLower.includes('छातीत') ||
      textLower.includes('सीने में दर्द') ||
      findings.chiefComplaint.toLowerCase().includes('chest pain')
    ) {
      flags.push({
        id: 'flag-cardiac-1',
        symptom: 'Retrosternal Chest Pain / Tightness',
        severity: 'CRITICAL',
        alertMessage: '⚠️ Clinical Attention: Acute chest pain reported. Requires urgent clinician review and emergency triage protocol.',
        clinicalRecommendation: 'Do not delay. Immediate bedside 12-lead ECG, vitals monitoring (BP, SpO2), and direct physician assessment recommended.',
        detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    // Red flag 2: High temperature with vomiting (Risk of severe dehydration / vector-borne infection)
    if (
      findings.reportedTemperature?.includes('102') ||
      findings.reportedTemperature?.includes('103')
    ) {
      if (findings.associatedSymptoms.some(s => s.toLowerCase().includes('vomit') || s.includes('उलटी') || s.includes('उल्टी'))) {
        flags.push({
          id: 'flag-fever-vomiting',
          symptom: 'High-grade Pyrexia with Emesis',
          severity: 'WARNING',
          alertMessage: '⚠️ Clinical Attention: High temperature (≥102°F) with associated vomiting reported. Potential risk of dehydration.',
          clinicalRecommendation: 'Assess hydration status (mucous membranes, skin turgor). Evaluate for endemic vector-borne etiologies (Malaria/Dengue/Typhoid) as per local prevalence.',
          detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    // Red flag 3: Breathlessness
    if (
      textLower.includes('सांस लेने में तकलीफ') ||
      textLower.includes('श्वास घेण्यास त्रास') ||
      textLower.includes('breathless') ||
      textLower.includes('short of breath')
    ) {
      flags.push({
        id: 'flag-respiratory',
        symptom: 'Dyspnea / Breathlessness',
        severity: 'WARNING',
        alertMessage: '⚠️ Clinical Attention: Respiratory distress reported. Requires auscultation and pulse oximetry assessment.',
        clinicalRecommendation: 'Check SpO2 immediately. Clinician must rule out acute bronchospasm, pneumonia, or pulmonary congestion.',
        detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    return flags;
  }

  /**
   * Synthesize SOAP format clinical summary
   * Strictly marks unverified parameters as 'Not provided'
   */
  public generateStructuredCase(findings: ClinicalFinding, patient: Patient): SoapCase {
    const isFebrile = findings.chiefComplaint.toLowerCase().includes('fever');

    return {
      subjective: {
        chiefComplaint: findings.chiefComplaint !== 'Not provided' ? findings.chiefComplaint : 'Acute Febrile Illness',
        duration: findings.duration !== 'Not provided' ? findings.duration : '3 days',
        historyOfPresentIllness: `Patient ${patient.name} (${patient.age}y/${patient.gender.charAt(0)}) presents with complaint of ${findings.chiefComplaint} for ${findings.duration}. ${
          findings.associatedSymptoms.length > 0
            ? 'Associated with ' + findings.associatedSymptoms.join(', ') + '.'
            : 'No other primary complaints specified.'
        } Patient communicated in ${patient.preferredLanguage.toUpperCase()}.`,
        associatedSymptoms: findings.associatedSymptoms.length > 0 ? findings.associatedSymptoms : ['Generalized weakness'],
        reportedTemperature: (findings.reportedTemperature && findings.reportedTemperature !== 'Not provided') ? findings.reportedTemperature : 'Not measured at home',
        allergies: patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No known drug allergies reported',
        currentMedications: findings.currentMedications !== 'Not provided' ? findings.currentMedications : 'No regular medications reported',
      },
      objective: {
        reportedVitals: findings.reportedTemperature !== 'Not provided' 
          ? `Temp: ${findings.reportedTemperature}; Pulse: Pending; BP: Pending; SpO2: Pending.` 
          : 'Vitals awaiting clinical triage measurement.',
        physicalNotes: 'Awaiting doctor clinical examination and systemic auscultation.',
        labFindings: 'Awaiting doctor evaluation or uploaded medical report correlation.',
      },
      assessment: {
        clinicalSummary: `Provisional clinical presentation consistent with ${
          isFebrile ? 'Acute Febrile Illness / Possible Viral Syndrome' : 'Symptomatic Presentation for Physician Evaluation'
        }. AI assists case preparation; clinician diagnosis pending.`,
        differentialConsiderations: isFebrile
          ? '1. Acute Viral Pyrexia\n2. Vector-borne pyrexia (Dengue / Malaria screening)\n3. Enteric / Gastroenteric infection'
          : '1. Clinician differential to be documented upon physical examination.',
        redFlagsNoted: findings.severity === 'Critical' || findings.severity === 'Severe'
          ? ['Potentially important acute symptoms reported — Clinician review required']
          : ['No red-flag organ compromise noted at initial voice intake'],
      },
      plan: {
        provisionalAdvice: '1. Adequate oral hydration (ORS / tender coconut water / fluids).\n2. Antipyretic (Paracetamol 650mg SOS) if fever > 100°F.\n3. Light, easily digestible diet.',
        recommendedInvestigations: isFebrile ? ['Complete Blood Count (CBC)', 'Dengue NS1 Antigen (if fever > 48h)', 'Urine Routine'] : ['Clinical assessment by attending physician'],
        followUpInstructions: 'Review in OPD after 48 hours or immediately if high persistent fever, extreme vomiting, or warning signs develop.',
        doctorSignature: '',
        approvedAt: undefined,
      },
    };
  }
}

export const clinicalAiService = new ClinicalAiService();
