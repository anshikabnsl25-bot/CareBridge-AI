import datetime
import random
import uuid
import hashlib
from app.database import engine, SessionLocal, init_db
from app.models.entities import (
    User, UserProfile, Patient, HealthcareWorker, Specialist, Hospital,
    Department, ClinicalCase, ClinicalImage, TriageAssessment, Referral,
    SpecialistReview, Medicine, MedicineBatch, MedicineSerial,
    SupplyChainEvent, VerificationLog, HospitalNode, HospitalEdge,
    QueueToken, PatientJourney, Appointment, Notification, AuditLog, ConsentRecord
)

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def seed_database():
    init_db()
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains data, skipping seed.")
        db.close()
        return

    print("Generating comprehensive synthetic demonstration data...")

    # 1. Hospitals
    hospitals_data = [
        Hospital(id="HOSP-01", name="AIIMS District Healthcare Hub", location="Sector 14, Gorakhpur", district="Gorakhpur", total_beds=500, emergency_phone="+91-551-220011"),
        Hospital(id="HOSP-02", name="Community Health Centre (CHC) Sadar", location="Civil Lines, Varanasi", district="Varanasi", total_beds=180, emergency_phone="+91-542-230044"),
        Hospital(id="HOSP-03", name="Sub-District Hospital Balrampur", location="NH 730, Balrampur", district="Balrampur", total_beds=120, emergency_phone="+91-5263-22100"),
        Hospital(id="HOSP-04", name="District General Hospital Ayodhya", location="Faizabad Road, Ayodhya", district="Ayodhya", total_beds=320, emergency_phone="+91-5278-223344"),
        Hospital(id="HOSP-05", name="Regional Apex Medical Institute", location="Kalyanpur, Kanpur", district="Kanpur", total_beds=650, emergency_phone="+91-512-240099")
    ]
    for h in hospitals_data:
        db.add(h)
    db.commit()

    # 2. Departments for HOSP-01
    depts_data = [
        Department(id="DEPT-REG", hospital_id="HOSP-01", name="Central Registration & Helpdesk", floor=0, avg_consultation_mins=5),
        Department(id="DEPT-OPD-GEN", hospital_id="HOSP-01", name="OPD General Medicine", floor=1, avg_consultation_mins=10),
        Department(id="DEPT-CARDIO", hospital_id="HOSP-01", name="Department of Cardiology", floor=2, avg_consultation_mins=15),
        Department(id="DEPT-PULMO", hospital_id="HOSP-01", name="Chest & Pulmonology Clinic", floor=2, avg_consultation_mins=12),
        Department(id="DEPT-DERM", hospital_id="HOSP-01", name="Dermatology & Skin Centre", floor=1, avg_consultation_mins=10),
        Department(id="DEPT-ORTHO", hospital_id="HOSP-01", name="Orthopedics & Fracture Clinic", floor=1, avg_consultation_mins=14),
        Department(id="DEPT-PEDIA", hospital_id="HOSP-01", name="Pediatric Care Unit", floor=1, avg_consultation_mins=12),
        Department(id="DEPT-LAB", hospital_id="HOSP-01", name="Central Pathology & Diagnostic Lab", floor=0, avg_consultation_mins=8),
        Department(id="DEPT-RAD", hospital_id="HOSP-01", name="Radiology (X-Ray & Ultrasound)", floor=0, avg_consultation_mins=15),
        Department(id="DEPT-PHARM", hospital_id="HOSP-01", name="Jan Aushadhi Central Pharmacy", floor=0, avg_consultation_mins=6),
        Department(id="DEPT-EMERG", hospital_id="HOSP-01", name="Trauma & Emergency Care", floor=0, avg_consultation_mins=20),
        Department(id="DEPT-BILL", hospital_id="HOSP-01", name="Ayushman Bharat Billing & Insurance", floor=0, avg_consultation_mins=8)
    ]
    for d in depts_data:
        db.add(d)
    db.commit()

    # 3. Demo Users for all 5 roles
    demo_users = [
        ("patient@carebridge.org", "patient", "Sunita Devi", "+91-9876500001", "hi"),
        ("asha@carebridge.org", "asha_worker", "Pooja Verma (ASHA Lead)", "+91-9876500002", "hi"),
        ("doctor@carebridge.org", "specialist", "Dr. Rajesh K. Sharma, MD", "+91-9876500003", "en"),
        ("pharmacist@carebridge.org", "pharmacist", "Anil Gupta, B.Pharm", "+91-9876500004", "en"),
        ("admin@carebridge.org", "admin", "Dr. Shalini Mukhopadhyay (Chief Medical Officer)", "+91-9876500005", "en"),
    ]

    for email, role, full_name, phone, lang in demo_users:
        u = User(
            id=f"usr_{role}",
            email=email,
            role=role,
            password_hash=hash_pw("CareBridge@2026"),
            is_active=True
        )
        db.add(u)
        prof = UserProfile(
            id=f"prof_{role}",
            user_id=u.id,
            full_name=full_name,
            phone=phone,
            preferred_language=lang,
            hospital_id="HOSP-01",
            department_id="DEPT-CARDIO" if role == "specialist" else "DEPT-PHARM" if role == "pharmacist" else None
        )
        db.add(prof)

    # 4. Specialists (15 specialists across fields)
    specialties = [
        ("Dr. Rajesh K. Sharma", "Cardiology", "HOSP-01", "usr_specialist"),
        ("Dr. Aarti Sundaram", "Pediatrics", "HOSP-01", None),
        ("Dr. Vikram Rathore", "Pulmonology", "HOSP-01", None),
        ("Dr. Meera Nambiar", "Dermatology", "HOSP-01", None),
        ("Dr. Tariq Siddiqui", "Orthopedics", "HOSP-01", None),
        ("Dr. Preeti Sengupta", "General Medicine", "HOSP-01", None),
        ("Dr. Alok Nath", "Neurology", "HOSP-02", None),
        ("Dr. Smita Patil", "Obstetrics & Gynecology", "HOSP-02", None),
        ("Dr. Harsh Vardhan", "Cardiology", "HOSP-02", None),
        ("Dr. Sunidhi Roy", "Pulmonology", "HOSP-03", None),
        ("Dr. Deepak Chaurasia", "General Medicine", "HOSP-03", None),
        ("Dr. Vandana Saxena", "Dermatology", "HOSP-04", None),
        ("Dr. Rohit Ganguly", "Pediatrics", "HOSP-04", None),
        ("Dr. Sanjay Mishra", "Orthopedics", "HOSP-05", None),
        ("Dr. Kavita Narang", "Endocrinology", "HOSP-05", None),
    ]

    spec_objs = []
    for i, (name, dept, hosp, linked_user) in enumerate(specialties):
        u_id = linked_user or f"usr_spec_{i}"
        if not linked_user:
            u_temp = User(id=u_id, email=f"specialist{i+1}@carebridge.org", role="specialist", password_hash=hash_pw("demo123"))
            db.add(u_temp)
            db.add(UserProfile(id=f"p_spec_{i}", user_id=u_id, full_name=name, hospital_id=hosp))
        
        spec = Specialist(
            id=f"SPEC-{101+i}",
            user_id=u_id,
            name=name,
            department=dept,
            hospital_id=hosp,
            availability="Available" if i % 4 != 0 else "In OPD Consultation",
            languages="English, Hindi, Bhojpuri" if i % 2 == 0 else "English, Hindi",
            consultation_count=random.randint(45, 320)
        )
        spec_objs.append(spec)
        db.add(spec)
    db.commit()

    # 5. Healthcare Workers (10 ASHA / PHC workers)
    asha_workers = []
    for i in range(10):
        u_id = "usr_asha_worker" if i == 0 else f"usr_asha_{i}"
        if i > 0:
            u_temp = User(id=u_id, email=f"asha{i+1}@carebridge.org", role="asha_worker", password_hash=hash_pw("demo123"))
            db.add(u_temp)
            db.add(UserProfile(id=f"p_asha_{i}", user_id=u_id, full_name=f"ASHA Sahayika {i+1}"))
        
        hw = HealthcareWorker(
            id=f"HW-{201+i}",
            user_id=u_id,
            worker_code=f"ASHA-UP-{300+i}",
            name=f"Pooja Verma" if i == 0 else f"ASHA Sathi {i+1}",
            phc_centre=f"Primary Health Centre Barhaj #{i+1}",
            village_assigned=f"Gram Rampur Ward {i+1}",
            contact_phone=f"+91-9876543{i:03d}"
        )
        asha_workers.append(hw)
        db.add(hw)
    db.commit()

    # 6. Patients (100 synthetic patients with varied demographics)
    first_names = ["Ramesh", "Kavita", "Suresh", "Geeta", "Manoj", "Anita", "Deepak", "Shanti", "Virendra", "Radha",
                   "Mukesh", "Sunita", "Rajendra", "Kiran", "Dinesh", "Urmila", "Santosh", "Parvati", "Arvind", "Meena"]
    last_names = ["Yadav", "Singh", "Sharma", "Verma", "Kumar", "Prasad", "Gupta", "Mishra", "Chauhan", "Maurya"]
    villages = ["Rampur", "Bishanpur", "Kalyanpur", "Chandpur", "Mohanlalganj", "Pipraich", "Sahjanwa", "Chauri Chaura"]

    patients_list = []
    for i in range(100):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        pid = f"PAT-2026-{1001+i}"
        p = Patient(
            id=f"P-{1001+i}",
            patient_id_number=pid,
            full_name=f"Sunita Devi" if i == 0 else f"{fname} {lname}",
            age=random.randint(4, 78),
            gender=random.choice(["Female", "Male"]),
            contact_number=f"+91-91234{random.randint(10000, 99999)}",
            village=random.choice(villages),
            district="Gorakhpur",
            emergency_contact=f"+91-98765{random.randint(10000, 99999)}"
        )
        patients_list.append(p)
        db.add(p)
        # Add consent record
        db.add(ConsentRecord(
            patient_id=p.id,
            consented_by=p.full_name,
            consent_purpose="CareBridge Rural AI Diagnostic Triage & Specialist Referral Consent"
        ))
    db.commit()

    # 7. Clinical Cases & Referrals (50 clinical cases with triage assessments)
    sample_symptoms = [
        ("Severe crushing chest pain radiating to left arm with excessive perspiration", 1, 99.1, 175, 110, 118, 91.0, "Urgent review", "Cardiology"),
        ("Persistent dry cough, evening low grade fever and breathlessness upon exertion", 21, 101.4, 120, 80, 88, 93.0, "Priority review", "Pulmonology"),
        ("Acute blistering rash across bilateral forearms with severe pruritus and scaling", 5, 98.6, 124, 78, 76, 98.0, "Routine review", "Dermatology"),
        ("Severe knee joint pain, swelling, difficulty weight bearing after agricultural work", 10, 98.8, 130, 84, 82, 97.5, "Routine review", "Orthopedics"),
        ("High grade fever with chills, body ache and severe headache for 4 days", 4, 103.8, 110, 70, 112, 95.0, "Priority review", "General Medicine"),
        ("Child aged 3 years with rapid wheezing, intercostal retractions and low intake", 2, 102.1, 100, 65, 134, 89.0, "Urgent review", "Pediatrics")
    ]

    for i in range(50):
        sym_text, dur, temp, sbp, dbp, hr, spo2, prio, spec_req = sample_symptoms[i % len(sample_symptoms)]
        pt = patients_list[i]
        c = ClinicalCase(
            id=f"CASE-{5001+i}",
            patient_id=pt.id,
            recorded_by=asha_workers[i % len(asha_workers)].worker_code,
            symptoms=sym_text,
            symptom_duration_days=dur,
            medical_history="Type 2 Diabetes, Hypertension" if i % 2 == 0 else "No significant history",
            temperature_f=temp,
            systolic_bp=sbp,
            diastolic_bp=dbp,
            heart_rate_bpm=hr,
            oxygen_saturation_pct=spo2,
            additional_observations=f"Recorded during PHC field camp #{((i%5)+1)}. Patient transported via local ambulance." if prio == "Urgent review" else "PHC walk-in consultation.",
            status="referred" if i < 35 else "reviewed" if i < 45 else "submitted"
        )
        db.add(c)
        
        # Triage Assessment
        db.add(TriageAssessment(
            case_id=c.id,
            priority_level=prio,
            risk_score=0.88 if prio == "Urgent review" else 0.55 if prio == "Priority review" else 0.22,
            contributing_factors=[
                {"factor": f"Vitals Flag: SpO2 {spo2}% & BP {sbp}/{dbp}", "severity": "HIGH", "weight": "+35 pts"},
                {"factor": f"Clinical symptom matches high-concern cluster: {spec_req}", "severity": "MODERATE", "weight": "+20 pts"}
            ],
            missing_information=[],
            model_limitations="Clinical decision support demonstration model. Must be verified by registered practitioner.",
            emergency_warning=(prio == "Urgent review"),
            recommended_specialty=spec_req
        ))

        # Specialist Referral
        assigned_spec = spec_objs[i % len(spec_objs)]
        ref = Referral(
            id=f"REF-{8001+i}",
            case_id=c.id,
            patient_id=pt.id,
            referred_by=asha_workers[i % len(asha_workers)].name,
            specialist_id=assigned_spec.id,
            referral_reason=f"Rural PHC escalation for suspected {spec_req} disorder requiring tele-consultation.",
            urgency=prio,
            status="completed" if i < 20 else "accepted" if i < 35 else "pending"
        )
        db.add(ref)

        # Specialist Review if completed
        if i < 20:
            db.add(SpecialistReview(
                referral_id=ref.id,
                specialist_id=assigned_spec.id,
                observations=f"Evaluated case profile. Clinical presentation consistent with acute presentation. Vital signs require strict monitoring.",
                recommended_action=f"Advised urgent ECG and blood markers. Refer to central hospital OPD {assigned_spec.department} within 24 hours.",
                additional_info_requested="Request 12-lead ECG strip upload if available at PHC."
            ))
    db.commit()

    # 8. Medicine Catalog, Batches & Verifiable Serials (100 batches)
    med_catalog = [
        ("Amoxicillin & Potassium Clavulanate", "Amox-Clav 625", "Antibiotic", "Tablet", "625mg", "Cipla Lifesciences Ltd", "DCGI-2023-AMX-910"),
        ("Paracetamol IP", "Crocin Advance", "Analgesic & Antipyretic", "Tablet", "500mg", "GlaxoSmithKline Pharma", "DCGI-2022-PCM-114"),
        ("Azithromycin Tablets IP", "Aziwok 500", "Antibiotic", "Tablet", "500mg", "Wockhardt Pharmaceuticals", "DCGI-2023-AZI-808"),
        ("Metformin Hydrochloride", "Glycomet 500", "Anti-diabetic", "Tablet", "500mg", "USV Private Ltd", "DCGI-2021-MET-332"),
        ("Telmisartan & Amlodipine", "Telma-AM", "Antihypertensive", "Tablet", "40mg/5mg", "Glenmark Pharmaceuticals", "DCGI-2022-TEL-556"),
        ("Oral Rehydration Salts IP", "Electral ORS", "Electrolyte Replenisher", "Sachet", "21.8g", "FDC Limited", "DCGI-2020-ORS-012"),
        ("Pantoprazole Gastro-resistant", "Pan-40", "Proton Pump Inhibitor", "Tablet", "40mg", "Alkem Laboratories", "DCGI-2022-PAN-449"),
        ("Ceftriaxone Injection IP", "Monocef 1g", "Cephalosporin Antibiotic", "Vial", "1000mg", "Aristo Pharmaceuticals", "DCGI-2023-CEF-782")
    ]

    med_objs = []
    for i, (mname, genname, cat, form, strg, mfr, reg) in enumerate(med_catalog):
        m = Medicine(
            id=f"MED-{100+i}",
            name=mname,
            generic_name=genname,
            category=cat,
            dosage_form=form,
            strength=strg,
            manufacturer=mfr,
            regulatory_reg_no=reg
        )
        med_objs.append(m)
        db.add(m)
    db.commit()

    # Create 100 medicine batches with full supply chain trail & QR Serials
    current_year = 2026
    for i in range(100):
        med = med_objs[i % len(med_objs)]
        b_num = f"BAT-{med.id[-3:]}-{2024 + (i % 3)}-{1000 + i}"
        
        # Include sample expired batch and sample active batches
        if i == 5:
            mfg_d = "2022-01-15"
            exp_d = "2024-01-14" # EXPIRED for testing
            b_status = "expired"
        elif i == 12:
            mfg_d = "2023-04-10"
            exp_d = "2025-04-09" # EXPIRED for testing
            b_status = "expired"
        else:
            mfg_d = f"2025-0{(i%8)+1:02d}-10"
            exp_d = f"2027-0{(i%8)+1:02d}-09"
            b_status = "active"

        batch = MedicineBatch(
            id=f"BATCH-{7001+i}",
            medicine_id=med.id,
            batch_number=b_num,
            mfg_date=mfg_d,
            expiry_date=exp_d,
            total_quantity=1000,
            current_quantity=random.randint(120, 950),
            status=b_status
        )
        db.add(batch)

        # Unique serials for scanning
        # Serial 0: Standard valid
        serial_code = f"CB-MED-{med.id}-{b_num}-SN{10000+i*10}"
        
        # Serial 7: Deliberate suspicious duplicate scan testing
        is_susp = (i == 7 or i == 23)
        scan_cnt = 27 if is_susp else (1 if i < 30 else 0)

        qr_data = f'{{"app":"CareBridgeAI","ver":"1.0","sn":"{serial_code}","batch":"{b_num}","med":"{med.name}","mfr":"{med.manufacturer}","exp":"{exp_d}","reg":"{med.regulatory_reg_no}"}}'
        
        serial_obj = MedicineSerial(
            id=f"SN-{9001+i}",
            batch_id=batch.id,
            serial_number=serial_code,
            qr_payload=qr_data,
            scan_count=scan_cnt,
            is_flagged_suspicious=is_susp,
            status="suspicious" if is_susp else "valid"
        )
        db.add(serial_obj)

        # Supply chain event logs (Manufacturer -> Distributor -> Pharmacy)
        prev_h = "0000000000000000000000000000000000000000000000000000000000000000"
        stages = [
            ("Manufacturer", f"{med.manufacturer} Plant Unit #2, Baddi, HP", "Quality Control QA Lead"),
            ("Distributor", "State Central Medical Warehouse, Lucknow, UP", "Regional Logistics Manager"),
            ("Pharmacy", "Jan Aushadhi Kendra Sub-Depot, Gorakhpur, UP", "Chief Dispensing Pharmacist")
        ]
        for stage, loc, actor in stages:
            curr_hash = hashlib.sha256(f"{batch.id}|{stage}|{prev_h}".encode()).hexdigest()
            db.add(SupplyChainEvent(
                batch_id=batch.id,
                stage=stage,
                location=loc,
                performed_by=actor,
                event_hash=curr_hash,
                previous_hash=prev_h
            ))
            prev_h = curr_hash
    db.commit()

    # 9. Hospital Navigation Graph (Nodes & Edges for HOSP-01)
    nodes_data = [
        {"id": "NODE_ENTRANCE", "label": "Main Entrance Gate A", "department": "Public Access", "floor": 0, "x": 50, "y": 480},
        {"id": "NODE_HELP_DESK", "label": "May I Help You Desk & Token Kiosk", "department": "Public Access", "floor": 0, "x": 120, "y": 420},
        {"id": "NODE_REGISTRATION", "label": "Central Registration Counters 1-6", "department": "Registration", "floor": 0, "x": 220, "y": 400},
        {"id": "NODE_ELEVATOR_G", "label": "Central Elevator & Ramp Bank (Ground)", "department": "Vertical Transit", "floor": 0, "x": 300, "y": 300},
        {"id": "NODE_PHARMACY", "label": "Jan Aushadhi Central Pharmacy", "department": "Pharmacy", "floor": 0, "x": 420, "y": 420},
        {"id": "NODE_BILLING", "label": "Ayushman Bharat Billing Counter", "department": "Billing", "floor": 0, "x": 450, "y": 320},
        {"id": "NODE_LABORATORY", "label": "Central Pathology & Blood Sample Lab", "department": "Laboratory", "floor": 0, "x": 550, "y": 280},
        {"id": "NODE_RADIOLOGY", "label": "Radiology (Digital X-Ray & USG)", "department": "Radiology", "floor": 0, "x": 580, "y": 400},
        {"id": "NODE_EMERGENCY", "label": "Trauma Emergency & Triage Hall", "department": "Emergency", "floor": 0, "x": 100, "y": 180},
        {"id": "NODE_WASHROOM_G", "label": "Accessible Restrooms (Ground Floor)", "department": "Amenities", "floor": 0, "x": 250, "y": 180},
        # Floor 1
        {"id": "NODE_ELEVATOR_1", "label": "Central Elevator Bank (Floor 1)", "department": "Vertical Transit", "floor": 1, "x": 300, "y": 300},
        {"id": "NODE_OPD_GEN", "label": "OPD General Medicine Suites 101-104", "department": "OPD General", "floor": 1, "x": 180, "y": 220},
        {"id": "NODE_DERMATOLOGY", "label": "Dermatology Clinic Suite 108", "department": "Dermatology", "floor": 1, "x": 420, "y": 210},
        {"id": "NODE_ORTHOPEDICS", "label": "Orthopedics & Plaster Room Suite 112", "department": "Orthopedics", "floor": 1, "x": 480, "y": 340},
        {"id": "NODE_PEDIATRICS", "label": "Pediatric Outpatient Care Suite 116", "department": "Pediatrics", "floor": 1, "x": 150, "y": 360},
        # Floor 2
        {"id": "NODE_ELEVATOR_2", "label": "Central Elevator Bank (Floor 2)", "department": "Vertical Transit", "floor": 2, "x": 300, "y": 300},
        {"id": "NODE_CARDIOLOGY", "label": "Cardiology & ECG Suite 201", "department": "Cardiology", "floor": 2, "x": 180, "y": 200},
        {"id": "NODE_PULMONOLOGY", "label": "Pulmonology & Spirometry Suite 206", "department": "Pulmonology", "floor": 2, "x": 440, "y": 220}
    ]

    for nd in nodes_data:
        db.add(HospitalNode(
            id=nd["id"],
            hospital_id="HOSP-01",
            label=nd["label"],
            department=nd["department"],
            floor=nd["floor"],
            x=nd["x"],
            y=nd["y"],
            is_accessible=True
        ))
    db.commit()

    edges_data = [
        # Ground floor connections
        ("NODE_ENTRANCE", "NODE_HELP_DESK", 18.0, True),
        ("NODE_HELP_DESK", "NODE_REGISTRATION", 22.0, True),
        ("NODE_REGISTRATION", "NODE_ELEVATOR_G", 25.0, True),
        ("NODE_HELP_DESK", "NODE_EMERGENCY", 40.0, True),
        ("NODE_REGISTRATION", "NODE_PHARMACY", 35.0, True),
        ("NODE_ELEVATOR_G", "NODE_BILLING", 28.0, True),
        ("NODE_BILLING", "NODE_LABORATORY", 30.0, True),
        ("NODE_PHARMACY", "NODE_RADIOLOGY", 32.0, True),
        ("NODE_ELEVATOR_G", "NODE_WASHROOM_G", 15.0, True),
        # Inter-floor elevators (Accessible)
        ("NODE_ELEVATOR_G", "NODE_ELEVATOR_1", 20.0, True),
        ("NODE_ELEVATOR_1", "NODE_ELEVATOR_2", 20.0, True),
        # Floor 1 connections
        ("NODE_ELEVATOR_1", "NODE_OPD_GEN", 22.0, True),
        ("NODE_ELEVATOR_1", "NODE_DERMATOLOGY", 26.0, True),
        ("NODE_ELEVATOR_1", "NODE_ORTHOPEDICS", 29.0, True),
        ("NODE_ELEVATOR_1", "NODE_PEDIATRICS", 24.0, True),
        # Floor 2 connections
        ("NODE_ELEVATOR_2", "NODE_CARDIOLOGY", 24.0, True),
        ("NODE_ELEVATOR_2", "NODE_PULMONOLOGY", 28.0, True)
    ]

    for u, v, dist, acc in edges_data:
        db.add(HospitalEdge(
            hospital_id="HOSP-01",
            source_node=u,
            target_node=v,
            distance_meters=dist,
            is_accessible=acc
        ))
    db.commit()

    # 10. Sample Live Queue Tokens & Patient Journeys
    queue_samples = [
        ("CARDIO-028", patients_list[0].id, "DEPT-CARDIO", "serving", "urgent", 0, "CARDIO-028"),
        ("CARDIO-029", patients_list[1].id, "DEPT-CARDIO", "waiting", "priority", 8, "CARDIO-028"),
        ("CARDIO-030", patients_list[2].id, "DEPT-CARDIO", "waiting", "routine", 18, "CARDIO-028"),
        ("CARDIO-031", patients_list[3].id, "DEPT-CARDIO", "waiting", "routine", 28, "CARDIO-028"),
        ("GEN-104", patients_list[4].id, "DEPT-OPD-GEN", "serving", "routine", 0, "GEN-104"),
        ("GEN-105", patients_list[5].id, "DEPT-OPD-GEN", "waiting", "priority", 10, "GEN-104"),
        ("GEN-106", patients_list[6].id, "DEPT-OPD-GEN", "waiting", "routine", 19, "GEN-104"),
        ("PHARM-055", patients_list[7].id, "DEPT-PHARM", "serving", "routine", 0, "PHARM-055"),
        ("PHARM-056", patients_list[8].id, "DEPT-PHARM", "waiting", "routine", 6, "PHARM-055")
    ]
    for tok, p_id, dept_id, status, prio, wait, curr_tok in queue_samples:
        db.add(QueueToken(
            token_number=tok,
            patient_id=p_id,
            department_id=dept_id,
            status=status,
            priority_level=prio,
            estimated_wait_minutes=wait,
            current_token_serving=curr_tok
        ))

    # Patient Journey Planner demonstration instance
    db.add(PatientJourney(
        patient_id=patients_list[0].id,
        title="Comprehensive Cardiac Consultation & Diagnostic Journey",
        steps=[
            {"step": 1, "department": "Central Registration Desk", "action": "Token validation and file opening", "completed": True, "floor": 0, "node_id": "NODE_REGISTRATION"},
            {"step": 2, "department": "Department of Cardiology", "action": "Specialist consultation with Dr. Rajesh Sharma", "completed": False, "in_progress": True, "floor": 2, "node_id": "NODE_CARDIOLOGY"},
            {"step": 3, "department": "Central Pathology Lab", "action": "Lipid panel & cardiac enzyme blood draw", "completed": False, "floor": 0, "node_id": "NODE_LABORATORY"},
            {"step": 4, "department": "Radiology", "action": "Chest PA View X-Ray scan", "completed": False, "floor": 0, "node_id": "NODE_RADIOLOGY"},
            {"step": 5, "department": "Jan Aushadhi Central Pharmacy", "action": "Dispensary collection of prescribed medicines", "completed": False, "floor": 0, "node_id": "NODE_PHARMACY"}
        ],
        current_step_index=1,
        status="in_progress"
    ))
    db.commit()

    # 11. Appointments (100 synthetic appointments)
    time_slots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:15 AM", "02:00 PM", "02:45 PM", "03:30 PM"]
    for i in range(100):
        db.add(Appointment(
            patient_id=patients_list[i % len(patients_list)].id,
            specialist_id=spec_objs[i % len(spec_objs)].id,
            department_id="DEPT-CARDIO" if i % 2 == 0 else "DEPT-OPD-GEN",
            appointment_date=f"2026-11-{25 + (i % 5):02d}",
            time_slot=random.choice(time_slots),
            status="confirmed" if i < 80 else "completed",
            reason="Follow-up consultation for chronic symptom management"
        ))
    db.commit()

    # 12. Verification scan history log for anomaly detection demonstrations
    # Add regular scans + duplicate scan alerts
    for i in range(30):
        db.add(VerificationLog(
            serial_number=f"CB-MED-MED-100-BAT-100-2025-1000-SN10000",
            scanned_by_role="public",
            result_status="matched",
            device_info="Android Chrome Mobile / Gorakhpur IP",
            ip_hash="d8578edf8458ce06fbc5bb76a58c5ca4"
        ))
    # Add suspicious repeated scans for SN-9008
    for i in range(15):
        db.add(VerificationLog(
            serial_number=f"CB-MED-MED-107-BAT-107-2025-1007-SN10070",
            scanned_by_role="public",
            result_status="suspicious",
            device_info="Multi-region concurrent access / Proxied",
            ip_hash=f"hash_{random.randint(1000, 9999)}"
        ))
    db.commit()

    print("Synthetic database populated successfully with:")
    print(" - 5 Demo accounts (Patient, ASHA Worker, Specialist, Pharmacist, Admin)")
    print(" - 100 Patients, 10 ASHA Workers, 15 Specialists, 5 Hospitals, 12 Departments")
    print(" - 50 Clinical Cases & Triage Assessments")
    print(" - 100 Medicine Batches & Serialized QR Codes")
    print(" - Interactive Hospital Graph (18 Nodes & 17 Accessible Edges)")
    print(" - 100 Appointments, Live Queue Tokens, and Patient Journey Plan")
    db.close()

if __name__ == "__main__":
    seed_database()

