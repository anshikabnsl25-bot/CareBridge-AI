# Problem Brief: CareBridge AI — Intelligent Healthcare Access and Assistance Platform

## 1. Project Title & Track
* **Title:** CareBridge AI – Intelligent Healthcare Access and Assistance Platform
* **Track:** Healthcare & Well-being
* **Target Demographic:** Rural and semi-urban populations of Bharat (Primary Healthcare Centres, Community Health Centres, District Public Hospitals)

---

## 2. Problem Statements Addressed
CareBridge AI addresses three compounding, interconnected healthcare bottlenecks:

1. **CareConnect (Lack of Specialist Doctors at Rural PHCs):** Over 70% of India's population lives in rural areas, yet over 75% of specialist doctors reside in metropolitan hubs. Rural patients at Primary Healthcare Centres (PHCs) face delayed diagnoses, unguided travel, and high out-of-pocket expenses to consult urban specialists.
2. **MediTrust (Circulation of Counterfeit and Expired Medicines):** Counterfeit, substandard, and expired pharmaceuticals disproportionately circulate in rural sub-depots and unorganized pharmacies. Rural citizens lack simple, tamper-evident digital verification mechanisms.
3. **CareNav (Overcrowding, Confusion, and Wait Times in Public Hospitals):** Public district hospitals experience massive footfall, maze-like multi-floor corridors, illiteracy barriers, and unmanaged OPD queues leading to 3 to 6-hour waiting times.

---

## 3. People Affected
* **Rural Patients:** Elderly individuals like *Sushila Devi* (aged 58, from rural Uttar Pradesh), who prefer regional languages (Hindi), have low digital literacy, and experience severe fatigue navigating fragmented healthcare facilities.
* **Frontline ASHA & PHC Healthcare Workers:** Burdened with manual paperwork, lack of real-time clinical triage assistance, and disconnected referral channels to higher district facilities.
* **District Hospital Specialists & Administrators:** Overwhelmed by un-triaged walk-ins, lack of prior vitals history, and zero real-time department load visibility.
* **Jan Aushadhi & Retail Pharmacists:** Need verifiable batch traceability to quarantine expired or repeatedly scanned counterfeit packages.

---

## 4. Why Existing Approaches Fall Short
* **Siloed Point Solutions:** Existing apps provide either video telemedicine or basic hospital queue tokens, but zero inter-connectivity. A tele-consultation rarely links to a hospital navigation route or medicine verification.
* **Language and Literacy Exclusions:** English-first user experiences with tiny typography, complex navigation menus, and zero speech-assisted guidance exclude rural users.
* **Connectivity Fragility:** Cloud-heavy architectures crash on 2G/3G intermittent rural networks without offline data caching or low-bandwidth modes.

---

## 5. Proposed Integrated Solution: CareBridge AI
CareBridge AI creates a continuous, unified patient continuum connecting rural PHCs with apex district hospitals:
* **CareConnect:** Frontline ASHA workers record structured clinical cases and vital signs on smartphones. An explainable AI triage engine highlights risk factors and routes urgent tele-referrals to hospital specialists.
* **CareNav:** Hospital route navigation powered by graph-based Dijkstra pathfinding across multi-floor layouts, paired with dynamic ML-driven queue wait-time estimation and turn-by-turn voice guidance in Hindi.
* **MediTrust:** Serialized QR code scanning verifying regulatory registration (CDSCO / Jan Aushadhi), checking expiry dates, detecting suspicious repeat scans via Isolation Forest anomaly detection, and tracking append-only SHA-256 supply chain event hashes.

---

## 6. Core Value Proposition & Social Impact
* **Zero Travel Waste:** Patients travel to district hospitals only after specialist pre-review and confirmation.
* **Decentralized Triage:** Identifies cardiovascular and respiratory distress before irreversible clinical decline.
* **Patient Dignity & Accessibility:** Voice-guided navigation in Hindi empowers elderly rural citizens to navigate complex multi-floor public hospitals independently.
* **Counterfeit Shield:** Assures rural families that life-saving antibiotics and cardiac medications are authentic and in-date.

---

## 7. Technical Approach & Innovation
* **Unified Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, FastAPI (Python), SQLAlchemy ORM, and Supabase PostgreSQL.
* **Explainable AI:** Feature contribution weights on triage assessments (no black-box clinical hallucination).
* **Graph Algorithms:** Dijkstra shortest-path calculations with elevator and wheelchair ramp accessibility constraints.
* **Machine Learning Models:** Gradient Boosting Regressor for queue waiting time predictions ($R^2 = 0.99$), Random Forest for multi-vital triage classification, and Isolation Forest for scan anomaly detection.

---

## 8. Project Limitations
* **Assistive Prototype:** Does not provide autonomous diagnostic or prescriptive determinations. All tele-referrals require human-in-the-loop specialist doctor authorization.
* **Simulated Regulatory Feeds:** Demonstrates verification against synthetic CDSCO/Jan Aushadhi batches; full national rollout requires official GS1/iVEDA supply chain gateway integration.
