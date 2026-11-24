import datetime
from app.database import SessionLocal
from app.models.entities import (
    User, UserProfile, Patient, ClinicalCase, TriageAssessment,
    Referral, SpecialistReview, QueueToken, PatientJourney, ConsentRecord
)

def seed_sushila_devi():
    db = SessionLocal()
    try:
        # Check if Sushila Devi exists
        sushila = db.query(Patient).filter(Patient.patient_id_number == "PAT-2026-0001").first()
        if not sushila:
            sushila = Patient(
                id="P-0001",
                patient_id_number="PAT-2026-0001",
                full_name="Sushila Devi",
                age=58,
                gender="Female",
                contact_number="+91-9876543210",
                village="Gram Madhuban, Mathura",
                district="Mathura",
                emergency_contact="+91-9876500000"
            )
            db.add(sushila)
            db.commit()
            db.refresh(sushila)

            # Link patient user account
            user_pt = db.query(User).filter(User.email == "patient@carebridge.org").first()
            if user_pt:
                prof = db.query(UserProfile).filter(UserProfile.user_id == user_pt.id).first()
                if prof:
                    prof.full_name = "Sushila Devi"
                    prof.phone = "+91-9876543210"
                    prof.preferred_language = "hi"
                    db.commit()

            # Consent
            db.add(ConsentRecord(
                patient_id=sushila.id,
                consented_by="Sushila Devi (with verbal ASHA witness)",
                consent_purpose="CareBridge AI CareConnect Diagnostic Triage & Tele-Referral"
            ))

            # Case: Sushila Devi symptoms
            c = ClinicalCase(
                id="CASE-0001",
                patient_id=sushila.id,
                recorded_by="ASHA-UP-301 (Pooja Verma)",
                symptoms="Severe exertional breathlessness, left chest tightness, bilateral pedal swelling and evening fatigue for 10 days.",
                symptom_duration_days=10,
                medical_history="Hypertension 6 years, Type 2 Diabetes on Metformin",
                temperature_f=99.2,
                systolic_bp=165,
                diastolic_bp=102,
                heart_rate_bpm=108,
                oxygen_saturation_pct=92.5,
                additional_observations="Patient walked 3km to PHC. Visible dyspnea on mild exertion. Requires urgent cardiologist tele-review.",
                status="reviewed"
            )
            db.add(c)
            db.commit()

            # Triage
            db.add(TriageAssessment(
                case_id=c.id,
                priority_level="Urgent review",
                risk_score=0.82,
                contributing_factors=[
                    {"factor": "Hypoxemia alert: SpO2 92.5%", "severity": "HIGH", "weight": "+30 pts"},
                    {"factor": "Stage 2 Hypertension: 165/102 mmHg", "severity": "HIGH", "weight": "+25 pts"},
                    {"factor": "Cardiovascular distress symptoms (chest tightness + breathlessness)", "severity": "CRITICAL", "weight": "+35 pts"},
                    {"factor": "Vulnerable demographic (Age 58 with Diabetes)", "severity": "MODERATE", "weight": "+10 pts"}
                ],
                missing_information=["12-lead ECG strip pending hospital arrival"],
                model_limitations="Demonstration triage engine. Clinician-in-the-loop validation required.",
                emergency_warning=True,
                recommended_specialty="Cardiology"
            ))

            # Referral
            ref = Referral(
                id="REF-0001",
                case_id=c.id,
                patient_id=sushila.id,
                referred_by="Pooja Verma (ASHA Lead)",
                specialist_id="SPEC-101", # Dr. Rajesh K. Sharma (Cardiology)
                referral_reason="Suspected acute hypertensive heart disease with early congestive cardiac decompensation.",
                urgency="Urgent review",
                status="completed"
            )
            db.add(ref)
            db.commit()

            # Specialist Review
            db.add(SpecialistReview(
                referral_id=ref.id,
                specialist_id="SPEC-101",
                observations="Case profile reviewed. Clinical presentation suggests urgent cardiology workup required. Elevated blood pressure and hypoxemia warrant immediate facility evaluation.",
                recommended_action="Advised immediate referral to AIIMS District Healthcare Hub. Prescribed Telmisartan-Amlodipine, urgent ECG, cardiac markers, and echo.",
                additional_info_requested="Perform 12-lead ECG immediately upon arrival at Floor 2 Suite 201."
            ))

            # Queue Token
            db.add(QueueToken(
                token_number="CARDIO-014",
                patient_id=sushila.id,
                department_id="DEPT-CARDIO",
                status="serving",
                priority_level="urgent",
                estimated_wait_minutes=4,
                current_token_serving="CARDIO-014"
            ))

            # Comprehensive Patient Journey
            db.add(PatientJourney(
                patient_id=sushila.id,
                title="सुशीला देवी — एकीकृत स्वास्थ्य यात्रा (Sushila Devi Healthcare Journey)",
                steps=[
                    {
                        "step": 1,
                        "module": "CareConnect",
                        "department": "Primary Health Centre Barhaj (आशा केंद्र)",
                        "action": "आशा कार्यकर्ता पूजा वर्मा द्वारा पंजीकरण और वाइटल जाँच (BP 165/102, SpO2 92.5%)",
                        "completed": True,
                        "floor": 0,
                        "node_id": "NODE_REGISTRATION",
                        "timestamp": "09:15 AM"
                    },
                    {
                        "step": 2,
                        "module": "CareConnect",
                        "department": "AI Clinical Triage Review",
                        "action": "केयरब्रिज एआई द्वारा 'Urgent Review' फ्लैग व कार्डियोलॉजी विशेषज्ञ को टेली-रेफरल",
                        "completed": True,
                        "floor": 0,
                        "node_id": "NODE_REGISTRATION",
                        "timestamp": "09:22 AM"
                    },
                    {
                        "step": 3,
                        "module": "CareConnect",
                        "department": "Specialist Tele-Review",
                        "action": "डॉ. राजेश शर्मा द्वारा केस समीक्षा एवं जिला अस्पताल रेफरल स्वीकृति",
                        "completed": True,
                        "floor": 2,
                        "node_id": "NODE_CARDIOLOGY",
                        "timestamp": "09:40 AM"
                    },
                    {
                        "step": 4,
                        "module": "CareNav",
                        "department": "Central Helpdesk & Token Kiosk (भूतल)",
                        "action": "जिला अस्पताल आगमन, डिजिटल टोकन CARDIO-014 जनरेट",
                        "completed": True,
                        "floor": 0,
                        "node_id": "NODE_HELP_DESK",
                        "timestamp": "11:10 AM"
                    },
                    {
                        "step": 5,
                        "module": "CareNav",
                        "department": "Cardiology Suite 201 (द्वितीय तल)",
                        "action": "इंटरैक्टिव मानचित्र व हिंदी ध्वनि मार्गदर्शन द्वारा कक्ष 201 तक मार्ग दर्शन",
                        "completed": True,
                        "in_progress": False,
                        "floor": 2,
                        "node_id": "NODE_CARDIOLOGY",
                        "timestamp": "11:25 AM"
                    },
                    {
                        "step": 6,
                        "module": "CareNav",
                        "department": "Central Pathology Lab (भूतल)",
                        "action": "रक्त जांच एवं कार्डियक एंजाइम सैंपल संकलन",
                        "completed": True,
                        "floor": 0,
                        "node_id": "NODE_LABORATORY",
                        "timestamp": "12:15 PM"
                    },
                    {
                        "step": 7,
                        "module": "MediTrust",
                        "department": "Jan Aushadhi Central Pharmacy (भूतल)",
                        "action": "दवा वितरण, क्यूआर कोड स्कैनिंग (Amox-Clav 625mg & Telma-AM) व वैधता सत्यापन",
                        "completed": True,
                        "floor": 0,
                        "node_id": "NODE_PHARMACY",
                        "timestamp": "01:05 PM"
                    }
                ],
                current_step_index=6,
                status="completed"
            ))
            db.commit()
            print("Successfully seeded Sushila Devi end-to-end journey.")
        else:
            print("Sushila Devi record already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_sushila_devi()
