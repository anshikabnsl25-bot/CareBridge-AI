# Live Demonstration Guide: CareBridge AI

This guide enables judges, evaluators, and developers to reproduce the complete **Sushila Devi unified patient journey** in under 5 minutes.

---

## 1. Quick Startup Checklist

Ensure both backend and frontend servers are running:

```bash
# 1. Backend (Terminal 1)
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Frontend (Terminal 2)
cd frontend
npm run dev
```

* Open Frontend: **`http://localhost:5173/`**
* Open Backend API: **`http://localhost:8000/docs`**

---

## 2. Evaluation Accounts Reference
*All accounts share the master password:* **`CareBridge@2026`**

| Role | Email | Profile Name | Primary Demo Function |
|---|---|---|---|
| **Patient** | `patient@carebridge.org` | Sushila Devi | View complete 7-step journey, queue token, and Hindi voice navigation |
| **ASHA Worker** | `asha@carebridge.org` | Pooja Verma | Record field vitals, view AI explainable triage, submit tele-referral |
| **Specialist** | `doctor@carebridge.org` | Dr. Rajesh K. Sharma | Tele-review submitted cases, add clinical observations, accept hospital referrals |
| **Pharmacist** | `pharmacist@carebridge.org` | Anil Gupta | Register batches, generate QR codes, review suspicious duplicate scan alerts |
| **Administrator** | `admin@carebridge.org` | Dr. Shalini Mukhopadhyay | Hospital wait time reduction metrics, department patient load, verification analytics |

---

## 3. Step-by-Step 5-Minute Unified Demonstration Walkthrough

### Phase 1: Patient Dashboard & Journey Overview (1 min)
1. Navigate to `http://localhost:5173/`.
2. Click the blue **"Sunita Devi (Patient)"** one-click demo card.
3. Observe **Sushila Devi's** dashboard:
   - Notice the **Build for Bharat** bar at the top: Toggle language between **"हिंदी (Hindi)"** and **"English"**.
   - Click **"बोलकर सुनाएं / Listen"** to test browser speech synthesis in Hindi.
   - Toggle **"धीमा नेटवर्क मोड / Low-Bandwidth Mode"** and text enlargement.
   - Review the **7-Step Unified Healthcare Journey Timeline** connecting CareConnect, CareNav, and MediTrust.

### Phase 2: CareConnect Rural Specialist Tele-Referral (1.5 min)
1. Log out (bottom left "Sign Out") and click **"Pooja Verma (ASHA Worker)"**.
2. Click **"Submit Clinical Case"** $\rightarrow$ **"+ New Case"**.
3. Select patient: `Sunita Devi (PAT-2026-1001)`.
4. Enter symptoms: `Severe chest pain radiating to left arm and shortness of breath`.
5. Enter vitals: Temp `99.2`, Systolic BP `175`, Diastolic BP `110`, Heart Rate `115`, SpO2 `89.5%`.
6. Click **"Submit Case & Evaluate Triage"**.
7. **Inspect Output:** Explainable triage card flags **"Urgent Review"**, shows red emergency instructions, and breaks down numerical risk points and cardiology recommendation.

### Phase 3: CareNav Indoor Navigation & Digital Queue (1.5 min)
1. Sign out and sign in as **Patient** (`patient@carebridge.org`).
2. Click **"Hospital Map"** from the sidebar or dashboard.
3. Select Source: `Main Entrance Gate A` $\rightarrow$ Destination: `Cardiology & ECG Suite 201 (Floor 2)`.
4. Check `Accessible route only (ramps & elevators)`.
5. Click **"Find Shortest Route"**:
   - The interactive SVG floor map highlights the path from ground to floor 2 via central elevator bank.
   - Click **"Audio"** for speech guidance instructions.
6. Click **"My Queue Token"** in the sidebar:
   - Observe live digital token `CARDIO-014`, serving status, and dynamic estimated wait time.

### Phase 4: MediTrust Medicine Verification (1 min)
1. Click **"Verify Medicine"** in the sidebar.
2. Click **"Load Valid Demo QR"** $\rightarrow$ Click **"Verify"**:
   - Displays **✓ Verification Successful** (Amoxicillin & Clavulanate 625mg, Cipla).
   - Displays verified regulatory source (CDSCO Jan Aushadhi).
   - Displays append-only SHA-256 supply chain audit trail: *Manufacturer $\rightarrow$ Distributor $\rightarrow$ Sub-Depot Pharmacy*.
3. Click **"Load Expired Demo QR"** $\rightarrow$ Click **"Verify"**:
   - Displays **⚠ Expired Medicine Detected** (expired 2024-01-14).
4. Click **"Load Suspicious Demo"** $\rightarrow$ Click **"Verify"**:
   - Displays **🚨 Suspicious Serial Flagged** (exceeded repeat scan threshold across geographical IPs).

---

## 4. Troubleshooting & Fail-Safe Instructions
* If the backend server stops, restart with:
  `cd backend && PYTHONPATH=. python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
* If synthetic records require reset, run:
  `cd backend && PYTHONPATH=. python3 app/seed_sushila.py`
