from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    role: str
    full_name: str
    phone: Optional[str] = None
    preferred_language: Optional[str] = "en"

class PatientCreate(BaseModel):
    full_name: str
    age: int
    gender: str
    contact_number: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    emergency_contact: Optional[str] = None
    consent_confirmed: bool = True

class ClinicalCaseCreate(BaseModel):
    patient_id: str
    recorded_by: str
    symptoms: str
    symptom_duration_days: int
    medical_history: Optional[str] = None
    temperature_f: float
    systolic_bp: int
    diastolic_bp: int
    heart_rate_bpm: int
    oxygen_saturation_pct: float
    additional_observations: Optional[str] = None
    image_url: Optional[str] = None
    consent_given: bool = True

class TriageResultResponse(BaseModel):
    case_id: str
    priority_level: str
    risk_score: float
    contributing_factors: List[Dict[str, Any]]
    missing_information: List[str]
    model_limitations: str
    emergency_warning: bool
    recommended_specialty: str
    disclaimer: str

class ReferralCreate(BaseModel):
    case_id: str
    patient_id: str
    referred_by: str
    specialist_id: str
    referral_reason: str
    urgency: str = "Routine"

class SpecialistReviewCreate(BaseModel):
    referral_id: str
    observations: str
    recommended_action: str
    additional_info_requested: Optional[str] = None

class MedicineVerifyRequest(BaseModel):
    query: str # serial_number or batch_number or full QR payload
    scanned_by_role: Optional[str] = "public"

class MedicineBatchCreate(BaseModel):
    medicine_name: str
    generic_name: str
    category: str
    dosage_form: str
    strength: str
    manufacturer: str
    regulatory_reg_no: str
    batch_number: str
    mfg_date: str
    expiry_date: str
    quantity: int = 500

class NavigationRequest(BaseModel):
    source_node: str
    target_node: str
    accessible_only: bool = False

class QueueTokenCreate(BaseModel):
    patient_id: str
    department_id: str
    priority_level: Optional[str] = "routine"

class AppointmentCreate(BaseModel):
    patient_id: str
    specialist_id: str
    department_id: str
    appointment_date: str
    time_slot: str
    reason: str

class AssistantMessage(BaseModel):
    message: str
    language: str = "en"

