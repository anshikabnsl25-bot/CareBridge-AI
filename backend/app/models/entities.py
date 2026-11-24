from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)  # patient, asha_worker, specialist, pharmacist, admin
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    profile = relationship("UserProfile", back_populates="user", uselist=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    avatar_url = Column(String, nullable=True)
    hospital_id = Column(String, nullable=True)
    department_id = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id_number = Column(String, unique=True, index=True, nullable=False) # e.g. PAT-2026-1001
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    contact_number = Column(String, nullable=True)
    village = Column(String, nullable=True)
    district = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class HealthcareWorker(Base):
    __tablename__ = "healthcare_workers"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    worker_code = Column(String, unique=True, nullable=False) # e.g. ASHA-UP-402
    name = Column(String, nullable=False)
    phc_centre = Column(String, nullable=False)
    village_assigned = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    district = Column(String, nullable=False)
    total_beds = Column(Integer, default=250)
    emergency_phone = Column(String, nullable=False)

class Department(Base):
    __tablename__ = "departments"
    id = Column(String, primary_key=True, default=generate_uuid)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=False)
    name = Column(String, nullable=False) # e.g. OPD General, Cardiology, Pediatrics
    floor = Column(Integer, default=0)
    avg_consultation_mins = Column(Integer, default=12)

class Specialist(Base):
    __tablename__ = "specialists"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=False)
    availability = Column(String, default="Available")
    languages = Column(String, default="English, Hindi")
    consultation_count = Column(Integer, default=0)

class ConsentRecord(Base):
    __tablename__ = "consent_records"
    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    consented_by = Column(String, nullable=False)
    consent_purpose = Column(String, nullable=False)
    granted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

class ClinicalCase(Base):
    __tablename__ = "clinical_cases"
    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    recorded_by = Column(String, nullable=False) # healthcare worker ID
    symptoms = Column(Text, nullable=False)
    symptom_duration_days = Column(Integer, default=1)
    medical_history = Column(Text, nullable=True)
    temperature_f = Column(Float, nullable=False)
    systolic_bp = Column(Integer, nullable=False)
    diastolic_bp = Column(Integer, nullable=False)
    heart_rate_bpm = Column(Integer, nullable=False)
    oxygen_saturation_pct = Column(Float, nullable=False)
    additional_observations = Column(Text, nullable=True)
    status = Column(String, default="submitted") # submitted, triaged, referred, reviewed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ClinicalImage(Base):
    __tablename__ = "clinical_images"
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("clinical_cases.id"), nullable=False)
    image_url = Column(String, nullable=False)
    image_type = Column(String, default="skin/lesion") # lesion, eye, wound, x-ray
    quality_score = Column(Float, default=0.92) # automated sharpness/lighting check
    quality_status = Column(String, default="passed") # passed, warning, rejected
    annotations = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TriageAssessment(Base):
    __tablename__ = "triage_assessments"
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("clinical_cases.id"), nullable=False)
    priority_level = Column(String, nullable=False) # Urgent review, Priority review, Routine review, Insufficient information
    risk_score = Column(Float, nullable=False) # 0.0 - 1.0
    contributing_factors = Column(JSON, nullable=False)
    missing_information = Column(JSON, nullable=True)
    model_limitations = Column(Text, nullable=False)
    emergency_warning = Column(Boolean, default=False)
    recommended_specialty = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Referral(Base):
    __tablename__ = "referrals"
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("clinical_cases.id"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    referred_by = Column(String, nullable=False)
    specialist_id = Column(String, ForeignKey("specialists.id"), nullable=False)
    referral_reason = Column(Text, nullable=False)
    urgency = Column(String, default="Routine")
    status = Column(String, default="pending") # pending, accepted, completed, redirected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SpecialistReview(Base):
    __tablename__ = "specialist_reviews"
    id = Column(String, primary_key=True, default=generate_uuid)
    referral_id = Column(String, ForeignKey("referrals.id"), nullable=False)
    specialist_id = Column(String, ForeignKey("specialists.id"), nullable=False)
    observations = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    additional_info_requested = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    generic_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    dosage_form = Column(String, nullable=False) # Tablet, Syrup, Injection, Capsule
    strength = Column(String, nullable=False) # 500mg, 10ml, etc.
    manufacturer = Column(String, nullable=False)
    regulatory_reg_no = Column(String, nullable=False)

class MedicineBatch(Base):
    __tablename__ = "medicine_batches"
    id = Column(String, primary_key=True, default=generate_uuid)
    medicine_id = Column(String, ForeignKey("medicines.id"), nullable=False)
    batch_number = Column(String, unique=True, index=True, nullable=False)
    mfg_date = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    total_quantity = Column(Integer, default=1000)
    current_quantity = Column(Integer, default=1000)
    status = Column(String, default="active") # active, expired, recalled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MedicineSerial(Base):
    __tablename__ = "medicine_serials"
    id = Column(String, primary_key=True, default=generate_uuid)
    batch_id = Column(String, ForeignKey("medicine_batches.id"), nullable=False)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    qr_payload = Column(Text, nullable=False)
    scan_count = Column(Integer, default=0)
    is_flagged_suspicious = Column(Boolean, default=False)
    status = Column(String, default="valid") # valid, dispensed, suspicious

class SupplyChainEvent(Base):
    __tablename__ = "supply_chain_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    batch_id = Column(String, ForeignKey("medicine_batches.id"), nullable=False)
    stage = Column(String, nullable=False) # Manufacturer, Distributor, Pharmacy, Patient Verification
    location = Column(String, nullable=False)
    performed_by = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    event_hash = Column(String, nullable=False)
    previous_hash = Column(String, nullable=False)

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    serial_number = Column(String, nullable=False)
    scanned_by_role = Column(String, default="public")
    result_status = Column(String, nullable=False) # matched, expired, suspicious, not_found
    scanned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    device_info = Column(String, nullable=True)
    ip_hash = Column(String, nullable=True)

class HospitalNode(Base):
    __tablename__ = "hospital_nodes"
    id = Column(String, primary_key=True) # e.g. "REG_DESK", "OPD_CARDIO"
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=False)
    label = Column(String, nullable=False)
    department = Column(String, nullable=False)
    floor = Column(Integer, default=0)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    is_accessible = Column(Boolean, default=True)

class HospitalEdge(Base):
    __tablename__ = "hospital_edges"
    id = Column(String, primary_key=True, default=generate_uuid)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=False)
    source_node = Column(String, ForeignKey("hospital_nodes.id"), nullable=False)
    target_node = Column(String, ForeignKey("hospital_nodes.id"), nullable=False)
    distance_meters = Column(Float, nullable=False)
    is_accessible = Column(Boolean, default=True) # ramps, elevators

class QueueToken(Base):
    __tablename__ = "queue_tokens"
    id = Column(String, primary_key=True, default=generate_uuid)
    token_number = Column(String, nullable=False) # e.g. CARDIO-042
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    department_id = Column(String, ForeignKey("departments.id"), nullable=False)
    status = Column(String, default="waiting") # waiting, serving, completed, cancelled
    priority_level = Column(String, default="routine") # urgent, priority, routine
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    estimated_wait_minutes = Column(Integer, default=20)
    current_token_serving = Column(String, nullable=True)

class PatientJourney(Base):
    __tablename__ = "patient_journeys"
    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    title = Column(String, nullable=False) # e.g. "Cardiology Workup Journey"
    steps = Column(JSON, nullable=False) # List of dicts with step name, status, dept, floor
    current_step_index = Column(Integer, default=0)
    status = Column(String, default="in_progress")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    specialist_id = Column(String, ForeignKey("specialists.id"), nullable=False)
    department_id = Column(String, ForeignKey("departments.id"), nullable=False)
    appointment_date = Column(String, nullable=False)
    time_slot = Column(String, nullable=False)
    status = Column(String, default="confirmed")
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

