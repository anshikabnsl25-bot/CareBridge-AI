# Database Schema & Entity Relationship: CareBridge AI

CareBridge AI utilizes a normalized PostgreSQL-compatible schema with 25 relational tables and constraints:

```mermaid
erDiagram
    USERS ||--o| USER_PROFILES : has
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : generates

    PATIENTS ||--o{ CONSENT_RECORDS : provides
    PATIENTS ||--o{ CLINICAL_CASES : records
    PATIENTS ||--o{ REFERRALS : referred_in
    PATIENTS ||--o{ QUEUE_TOKENS : assigned
    PATIENTS ||--o{ PATIENT_JOURNEYS : owns
    PATIENTS ||--o{ APPOINTMENTS : books

    HOSPITALS ||--o{ DEPARTMENTS : contains
    HOSPITALS ||--o{ SPECIALISTS : employs
    HOSPITALS ||--o{ HOSPITAL_NODES : maps
    HOSPITALS ||--o{ HOSPITAL_EDGES : links

    CLINICAL_CASES ||--o| TRIAGE_ASSESSMENTS : evaluates
    CLINICAL_CASES ||--o{ CLINICAL_IMAGES : attaches
    CLINICAL_CASES ||--o{ REFERRALS : escalates

    REFERRALS ||--o| SPECIALIST_REVIEWS : reviewed_by

    MEDICINES ||--o{ MEDICINE_BATCHES : produces
    MEDICINE_BATCHES ||--o{ MEDICINE_SERIALS : serializes
    MEDICINE_BATCHES ||--o{ SUPPLY_CHAIN_EVENTS : tracks
    MEDICINE_SERIALS ||--o{ VERIFICATION_LOGS : verifies
```

---

## Key Table Summaries

* `users`: Authentication credentials, role enums, password hashes.
* `patients`: Unique identifier `patient_id_number` (`PAT-2026-XXXX`), age, village, contact.
* `clinical_cases`: Vital signs ($\text{SpO}_2$, systolic/diastolic BP, pulse, temp), symptoms, duration.
* `triage_assessments`: Priority levels, numerical risk score ($0.0 - 1.0$), explainable factors, missing items.
* `referrals`: Linkage between PHC clinical case, patient, referring worker, and specialist.
* `medicine_batches`: Batch number, manufacturing date, expiry date, regulatory code.
* `medicine_serials`: Serial number, QR payload string, scan frequency, suspicion status.
* `supply_chain_events`: Append-only event blocks with current and previous SHA-256 hashes.
* `hospital_nodes` & `hospital_edges`: Multi-floor coordinates, department tags, distances, and ramp/elevator accessibility flags.
* `queue_tokens`: Department token number, status (`waiting`, `serving`), and predicted wait time.
