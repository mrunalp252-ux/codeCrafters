# 🏥 SwasthyaAI – Intelligent Multilingual Patient Case-Taking & Clinical Support System

> **“Talk. Don’t Type. Healthcare for Bharat.”**  
> *Doctor-supervised multilingual AI copilot for patient case-taking, clinical information extraction, adaptive questioning, structured case generation, medical-report processing, and patient-record organization.*

Built for **Smart India Hackathon (SIH) 2026** • Core Principle: **“AI prepares. Doctor decides.”**

---

## 🌟 Key Features

- **🎙️ Voice-First Multilingual Case Taking**: Supports Marathi (`mr-IN`), Hindi (`hi-IN`), and English (`en-IN`) with real-time speech-to-text, bilingual transcripts, and audio playback. Easily extensible to other Indic languages (Gujarati, Bengali, Tamil, Telugu, Kannada).
- **🧠 Adaptive Follow-up Questioning**: Dynamically detects missing clinical parameters (temperature, duration, allergies, meds) and generates targeted follow-up questions instead of static forms.
- **📋 Structured SOAP Clinical Case**: Automatically structures findings into Subjective, Objective, Assessment, and Plan format, with full inline editing for clinicians.
- **👨‍⚕️ Doctor Verification Gateway**: Human-in-the-loop workflow (`AI DRAFT` → `DOCTOR REVIEW` → `✓ DOCTOR APPROVED`) with digital signature and audit logging.
- **⚠️ Non-Autonomous Red-Flag Alerts**: Prompts immediate clinician attention for critical symptoms (e.g., retrosternal chest pain, respiratory distress) without claiming autonomous diagnosis.
- **🗂️ Longitudinal Patient Timeline**: Chronological history of consultations, lab reports, and vitals screenings.
- **📄 Medical Report OCR**: Scans and parses CBC blood tests, prescriptions, and metabolic panels into structured values with reference range indicators (Normal / High / Low).
- **🛡️ Security, RBAC & Audit Trail**: Role-based access for Doctors, Patients (Kiosk mode), and Admins with tamper-evident audit logging.
- **🌐 ABDM / HL7 FHIR R4 Ready**: Generates exportable FHIR R4 Bundles (`Patient`, `Encounter`, `Condition`, `Observation`) for the Ayushman Bharat Digital Mission.
- **📶 Offline-First PHC Mode**: Supports rural Primary Health Centers with local browser caching and background sync upon reconnection.

---

## 🚀 Live Demo & SIH 2-Minute Flow

The application includes an integrated **SIH 2026 Interactive Demo Bar** at the bottom of the screen:
1. Click **"1. Run Marathi Scenario (Sunita Patil)"** to trigger the Marathi voice consultation flow.
2. Watch the live transcription, extraction (Fever, 3 days, Fatigue), and missing-parameter checklist.
3. Click the follow-up response to update the SOAP case with 102°F temperature and vomiting.
4. Click **"Verify & Approve Clinical Case"** to sign and approve the case.
5. Check **Patient Timeline** to see the approved record instantly added.
6. Test **Medical Reports & OCR** to upload or demo CBC lab analysis.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Voice / Speech**: Web Speech API (SpeechRecognition + SpeechSynthesis)
- **Audio Feedback**: Web Audio API Synthesizer
- **Styling**: Modern Healthcare CSS Design System (clean, accessible, and responsive)
- **Standards**: HL7 FHIR R4 & ABDM Sandbox schema compatible

---

## 💻 Local Development Setup

```bash
# Clone repository
git clone <your-repo-url>
cd CodeCrafters

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚢 Deployment Guide

### Deploying to Vercel (Recommended)
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Vercel will automatically detect **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### Deploying to Netlify
1. Connect your repository on [Netlify](https://www.netlify.com).
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. Deploy site!

---

## 📜 Ethical AI & Medical Disclaimer

SwasthyaAI is designed exclusively as a clinical assistive copilot. The software does not provide autonomous diagnosis, prescription, or independent medical decisions. All clinical summaries and actions require verification and approval by a certified medical practitioner.
