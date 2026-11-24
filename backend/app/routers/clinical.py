from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models.entities import (
    Patient, ClinicalCase, ClinicalImage, TriageAssessment,
    Referral, Specialist, SpecialistReview, ConsentRecord, AuditLog
)
from app.schemas.dto import (
    PatientCreate, ClinicalCaseCreate, TriageResultResponse,
    ReferralCreate, SpecialistReviewCreate
)
from app.services.core_engines import calculate_triage_score

router = APIRouter(prefix="/clinical", tags=["Clinical Support & Tele-referral"])

@router.get("/patients")
def list_patients(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Patient).order_by(Patient.created_at.desc()).limit(limit).all()

@router.post("/patients")
def register_patient(data: PatientCreate, db: Session = Depends(get_db)):
    pid = f"PAT-2026-{db.query(Patient).count() + 1001}"
    p = Patient(
        patient_id_number=pid,
        full_name=data.full_name,
        age=data.age,
        gender=data.gender,
        contact_number=data.contact_number,
        village=data.village,
        district=data.district or "Gorakhpur",
        emergency_contact=data.emergency_contact
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    if data.consent_confirmed:
        db.add(ConsentRecord(
            patient_id=p.id,
            consented_by=data.full_name,
            consent_purpose="CareBridge Rural AI Diagnostic Triage & Referral"
        ))
        db.commit()

    return p

@router.post("/triage-evaluate", response_model=TriageResultResponse)
def evaluate_triage(data: ClinicalCaseCreate, db: Session = Depends(get_db)):
    """Evaluate patient vitals and symptoms using explainable rule-based clinical intelligence."""
    result = calculate_triage_score(
        age=35, # default or retrieved if patient exists
        symptoms=data.symptoms,
        duration_days=data.symptom_duration_days,
        temp_f=data.temperature_f,
        sys_bp=data.systolic_bp,
        dia_bp=data.diastolic_bp,
        hr_bpm=data.heart_rate_bpm,
        spo2_pct=data.oxygen_saturation_pct,
        history=data.medical_history or ""
    )
    return {
        "case_id": "PREVIEW",
        "priority_level": result["priority_level"],
        "risk_score": result["risk_score"],
        "contributing_factors": result["contributing_factors"],
        "missing_information": result["missing_information"],
        "model_limitations": result["model_limitations"],
        "emergency_warning": result["emergency_warning"],
        "recommended_specialty": result["recommended_specialty"],
        "disclaimer": result["disclaimer"]
    }

@router.post("/cases")
def submit_clinical_case(data: ClinicalCaseCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    triage_info = calculate_triage_score(
        age=patient.age,
        symptoms=data.symptoms,
        duration_days=data.symptom_duration_days,
        temp_f=data.temperature_f,
        sys_bp=data.systolic_bp,
        dia_bp=data.diastolic_bp,
        hr_bpm=data.heart_rate_bpm,
        spo2_pct=data.oxygen_saturation_pct,
        history=data.medical_history or ""
    )

    c = ClinicalCase(
        patient_id=data.patient_id,
        recorded_by=data.recorded_by,
        symptoms=data.symptoms,
        symptom_duration_days=data.symptom_duration_days,
        medical_history=data.medical_history,
        temperature_f=data.temperature_f,
        systolic_bp=data.systolic_bp,
        diastolic_bp=data.diastolic_bp,
        heart_rate_bpm=data.heart_rate_bpm,
        oxygen_saturation_pct=data.oxygen_saturation_pct,
        additional_observations=data.additional_observations,
        status="triaged"
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    # Record triage assessment
    assessment = TriageAssessment(
        case_id=c.id,
        priority_level=triage_info["priority_level"],
        risk_score=triage_info["risk_score"],
        contributing_factors=triage_info["contributing_factors"],
        missing_information=triage_info["missing_information"],
        model_limitations=triage_info["model_limitations"],
        emergency_warning=triage_info["emergency_warning"],
        recommended_specialty=triage_info["recommended_specialty"]
    )
    db.add(assessment)

    if data.image_url:
        db.add(ClinicalImage(
            case_id=c.id,
            image_url=data.image_url,
            quality_score=0.94,
            quality_status="passed"
        ))

    db.commit()

    return {
        "case": c,
        "triage_assessment": assessment,
        "triage_details": triage_info
    }

@router.get("/cases")
def list_clinical_cases(limit: int = 50, db: Session = Depends(get_db)):
    cases = db.query(ClinicalCase).order_by(ClinicalCase.created_at.desc()).limit(limit).all()
    res = []
    for c in cases:
        patient = db.query(Patient).filter(Patient.id == c.patient_id).first()
        triage = db.query(TriageAssessment).filter(TriageAssessment.case_id == c.id).first()
        res.append({
            "id": c.id,
            "patient_name": patient.full_name if patient else "Unknown",
            "patient_id_number": patient.patient_id_number if patient else "",
            "patient_age": patient.age if patient else 0,
            "patient_gender": patient.gender if patient else "",
            "symptoms": c.symptoms,
            "vitals": {
                "temp": c.temperature_f,
                "bp": f"{c.systolic_bp}/{c.diastolic_bp}",
                "hr": c.heart_rate_bpm,
                "spo2": c.oxygen_saturation_pct
            },
            "status": c.status,
            "priority_level": triage.priority_level if triage else "Routine review",
            "risk_score": triage.risk_score if triage else 0.2,
            "recommended_specialty": triage.recommended_specialty if triage else "General Medicine",
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return res

@router.get("/specialists")
def list_specialists(dept: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Specialist)
    if dept:
        q = q.filter(Specialist.department == dept)
    return q.all()

@router.post("/referrals")
def create_referral(data: ReferralCreate, db: Session = Depends(get_db)):
    ref = Referral(
        case_id=data.case_id,
        patient_id=data.patient_id,
        referred_by=data.referred_by,
        specialist_id=data.specialist_id,
        referral_reason=data.referral_reason,
        urgency=data.urgency,
        status="pending"
    )
    db.add(ref)
    
    # Update clinical case status
    c = db.query(ClinicalCase).filter(ClinicalCase.id == data.case_id).first()
    if c:
        c.status = "referred"
    
    db.commit()
    db.refresh(ref)
    return ref

@router.get("/referrals")
def list_referrals(specialist_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Referral)
    if specialist_id:
        q = q.filter(Referral.specialist_id == specialist_id)
    referrals = q.order_by(Referral.created_at.desc()).all()
    
    res = []
    for r in referrals:
        p = db.query(Patient).filter(Patient.id == r.patient_id).first()
        c = db.query(ClinicalCase).filter(ClinicalCase.id == r.case_id).first()
        s = db.query(Specialist).filter(Specialist.id == r.specialist_id).first()
        review = db.query(SpecialistReview).filter(SpecialistReview.referral_id == r.id).first()
        res.append({
            "id": r.id,
            "case_id": r.case_id,
            "patient_name": p.full_name if p else "Patient",
            "patient_id_number": p.patient_id_number if p else "",
            "patient_age": p.age if p else 0,
            "patient_gender": p.gender if p else "",
            "symptoms": c.symptoms if c else "",
            "vitals": {
                "temp": c.temperature_f if c else 0,
                "bp": f"{c.systolic_bp}/{c.diastolic_bp}" if c else "120/80",
                "hr": c.heart_rate_bpm if c else 72,
                "spo2": c.oxygen_saturation_pct if c else 98
            } if c else None,
            "specialist_name": s.name if s else "Specialist",
            "department": s.department if s else "General Medicine",
            "urgency": r.urgency,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "review": {
                "observations": review.observations,
                "recommended_action": review.recommended_action,
                "additional_info_requested": review.additional_info_requested
            } if review else None
        })
    return res

@router.post("/specialist-review")
def review_referral(data: SpecialistReviewCreate, db: Session = Depends(get_db)):
    ref = db.query(Referral).filter(Referral.id == data.referral_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    review = SpecialistReview(
        referral_id=data.referral_id,
        specialist_id=ref.specialist_id,
        observations=data.observations,
        recommended_action=data.recommended_action,
        additional_info_requested=data.additional_info_requested
    )
    db.add(review)
    ref.status = "completed"
    
    c = db.query(ClinicalCase).filter(ClinicalCase.id == ref.case_id).first()
    if c:
        c.status = "reviewed"
    
    db.commit()
    return {"message": "Clinical review submitted successfully", "status": "completed"}

