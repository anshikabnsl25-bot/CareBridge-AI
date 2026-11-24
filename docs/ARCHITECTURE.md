# System Architecture: CareBridge AI

```mermaid
flowchart TB
    subgraph Client ["Client Layer (React 19 + TypeScript + Vite)"]
        UI_Patient["Patient Portal (Build for Bharat Mobile-First UI)"]
        UI_ASHA["ASHA Field Worker Portal (Triage Intake)"]
        UI_Doctor["Specialist Tele-Review Portal"]
        UI_Pharm["Pharmacist QR Verification & Batch Console"]
        UI_Admin["Hospital CMO Analytics Dashboard"]
        PWA["PWA Service Worker & Offline Cache"]
    end

    subgraph Gateway ["API & Application Gateway (FastAPI)"]
        AuthService["/api/auth (Role-Based Access Control)"]
        ClinicalService["/api/clinical (CareConnect Engine)"]
        MedicineService["/api/medicine (MediTrust Verification)"]
        HospitalService["/api/hospital (CareNav Navigation & Queue)"]
        AnalyticsService["/api/analytics (Utilization Metrics)"]
        AssistantService["/api/assistant (Multilingual FAQ / Voice)"]
    end

    subgraph Intelligence ["AI / ML Engine (Scikit-Learn + Python)"]
        TriageModel["Clinician-in-the-Loop Triage Engine (Random Forest)"]
        QueueModel["Dynamic Wait Estimator (Gradient Boosting)"]
        AnomalyModel["Suspicious Repeat Scan Detector (Isolation Forest)"]
        GraphEngine["Dijkstra Shortest Path Floor Navigator"]
    end

    subgraph Data ["Data & Storage Layer (PostgreSQL / SQLite)"]
        DB_Core[("Relational Database - 25 Normalized Tables")]
        EventLog[("Append-Only Cryptographic Supply Chain Event Ledger")]
    end

    UI_Patient --> AuthService & HospitalService & MedicineService & AssistantService
    UI_ASHA --> ClinicalService
    UI_Doctor --> ClinicalService
    UI_Pharm --> MedicineService
    UI_Admin --> AnalyticsService

    ClinicalService --> TriageModel & DB_Core
    HospitalService --> QueueModel & GraphEngine & DB_Core
    MedicineService --> AnomalyModel & EventLog & DB_Core
    AnalyticsService --> DB_Core
```

---

## Technical Component Details
1. **Frontend:** React 19 single-page application built with Vite, TypeScript, Tailwind CSS v4, Framer Motion, and HTML5 QR Scanner.
2. **Backend Services:** Asynchronous FastAPI endpoints equipped with Pydantic validation schemas.
3. **Graph Navigation:** Dijkstra's algorithm running on in-memory adjacency graphs of multi-floor hospital nodes.
4. **Machine Learning Pipelines:** Model artifacts serialized with Joblib and documented in `backend/ml/models/`.
