# Project Status: CareBridge AI – Intelligent Healthcare Access and Assistance Platform

## 1. Project Overview
CareBridge AI is a full-stack digital healthcare prototype built to address three major systemic challenges in rural and semi-urban Indian healthcare:
1. **Lack of specialist doctors at Primary Healthcare Centres (PHCs)** via AI-assisted clinical triage and asynchronous specialist tele-referral.
2. **Circulation of counterfeit and expired medicines** via serialized QR scanning, automated regulatory verification, and append-only supply chain audit logs.
3. **Confusion, overcrowding, and long wait times in public hospitals** via Dijkstra-based indoor routing and dynamic queue wait-time estimation.

---

## 2. Technology Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts, Canvas Confetti, HTML5 QR Code.
- **Backend**: Python 3.14 / FastAPI, Pydantic v2 validation, SQLAlchemy ORM.
- **Database & Storage**: SQLite local database for instant zero-config testing & deployment, with Supabase PostgreSQL migration scripts provided (`DATABASE_URL` switchable).
- **Machine Learning & Analytics**:
  - `RandomForestClassifier` for clinical triage risk stratification (trained on multi-vital parameters with documented feature importance).
  - `GradientBoostingRegressor` for hospital queue wait-time prediction ($R^2 = 0.99$, MAE $\approx 5.8$ min).
  - `IsolationForest` for detecting suspicious repeat scans and counterfeit serial anomalies.
- **Accessibility & Offline**: Multilingual (English & Hindi) healthcare assistant, speech synthesis (Web Speech API), PWA Web Manifest.

---

## 3. Implemented Modules & Capabilities

### Module 1: Rural Specialist Diagnostic Support
- **Patient Registration & Vitals Intake**: Form validation, informed consent compliance, multi-vital capture (temperature, BP, pulse, $\text{SpO}_2$, duration, medical history).
- **Explainable AI Triage Engine**:
  - 4 review levels: Urgent review, Priority review, Routine review, Insufficient information.
  - Granular breakdown of contributing factors with point weights.
  - Emergency red-flag safety instructions and clinical disclaimers.
- **Specialist Tele-Referral Directory**: Directory of 15 specialists with hospital associations, language capabilities, and availability status. Specialists can review cases, input observations, and recommend follow-ups.

### Module 2: Counterfeit and Expired Medicine Verification
- **QR Code & Serial Scanner**: Supports direct QR payload parsing, manual serial entry, and batch number lookup.
- **Verification Status Engine**: Categorizes medicines as Authentic Matched, Expired Medicine Alert, Suspicious Repeat Scan, or Record Not Found.
- **Append-Only Supply Chain Audit**: Cryptographic SHA-256 block hashing showing Manufacturer $\rightarrow$ Distributor $\rightarrow$ Sub-Depot Pharmacy trail.
- **Pharmacist Inventory Console**: Batch registration, automated QR code generation, and suspicious scan review.

### Module 3: Intelligent Public Hospital Navigation & Queue Management
- **Graph-Based Hospital Navigation**: 18 nodes and 17 accessible edges representing multi-floor hospital departments (OPD, Lab, Radiology, Emergency, Pharmacy, Elevators). Shortest path computed via Dijkstra's algorithm with step-by-step guidance and audio read-aloud.
- **Digital Queue Token System**: Department-wise queue tracking, current serving token, and dynamic wait estimation.
- **Patient Journey Planner**: Structured step-by-step clinical workflow tracking from registration to pharmacy dispensing.

### Multilingual Virtual Healthcare Assistant
- Bilingual support in English and Hindi.
- Answers FAQs on hospital departments, appointment procedures, queue tokens, medicine verification, and emergency instructions.
- Includes browser Text-to-Speech (TTS) audio narration.

---

## 4. Demo Evaluation Accounts
All accounts use password: `CareBridge@2026`

| Role | Name | Email | Description |
|---|---|---|---|
| **Patient** | Sunita Devi | `patient@carebridge.org` | Rural patient tracking referrals, queue tokens, and medicines |
| **ASHA Worker** | Pooja Verma | `asha@carebridge.org` | Community health worker recording field vitals & AI triage |
| **Specialist Doctor** | Dr. Rajesh K. Sharma (Cardiology) | `doctor@carebridge.org` | Hospital specialist conducting tele-reviews |
| **Pharmacist** | Anil Gupta, B.Pharm | `pharmacist@carebridge.org` | Jan Aushadhi pharmacist managing batches & scan alerts |
| **Hospital Administrator** | Dr. Shalini Mukhopadhyay (CMO) | `admin@carebridge.org` | Monitoring hospital load, wait times, and referral analytics |

---

## 5. Test Suite & Verification Results
- **Unit Tests**: Ran `backend/tests/test_engines.py` covering:
  - Triage score calculations and emergency detection (Passed)
  - Routine vs urgent priority stratification (Passed)
  - Dijkstra graph shortest-path navigation & floor transitions (Passed)
  - Supply chain cryptographic SHA-256 hashing (Passed)
- **Frontend Build**: Vite TypeScript compilation completed with zero errors (`tsc -b && vite build` built production bundle in `frontend/dist`).
