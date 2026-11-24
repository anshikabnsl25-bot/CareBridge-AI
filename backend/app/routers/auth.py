from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import hashlib
from app.database import get_db
from app.models.entities import User, UserProfile
from app.schemas.dto import LoginRequest, TokenResponse, UserCreate

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

@router.post("/login", response_model=TokenResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    pw_hashed = hash_pw(creds.password)
    user = db.query(User).filter(User.email == creds.email, User.password_hash == pw_hashed).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    prof = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    user_data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": prof.full_name if prof else user.email.split("@")[0],
        "phone": prof.phone if prof else "",
        "preferred_language": prof.preferred_language if prof else "en",
        "hospital_id": prof.hospital_id if prof else "HOSP-01",
        "department_id": prof.department_id if prof else None
    }
    return {
        "access_token": f"cb_demo_token_{user.role}_{user.id}",
        "token_type": "bearer",
        "user": user_data
    }

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns credentials for the 5 official hackathon evaluation roles."""
    return [
        {
            "role": "patient",
            "name": "Sunita Devi (Patient)",
            "email": "patient@carebridge.org",
            "password": "CareBridge@2026",
            "description": "Rural patient with cardiac referral, active queue token, and medicine prescription"
        },
        {
            "role": "asha_worker",
            "name": "Pooja Verma (ASHA Worker)",
            "email": "asha@carebridge.org",
            "password": "CareBridge@2026",
            "description": "Frontline community healthcare worker recording field vitals & AI triage"
        },
        {
            "role": "specialist",
            "name": "Dr. Rajesh K. Sharma, MD (Cardiologist)",
            "email": "doctor@carebridge.org",
            "password": "CareBridge@2026",
            "description": "District hospital specialist reviewing rural tele-referrals & observations"
        },
        {
            "role": "pharmacist",
            "name": "Anil Gupta, B.Pharm (Pharmacist)",
            "email": "pharmacist@carebridge.org",
            "password": "CareBridge@2026",
            "description": "Jan Aushadhi Kendra pharmacist managing batches & suspicious QR scan alerts"
        },
        {
            "role": "admin",
            "name": "Dr. Shalini Mukhopadhyay (CMO)",
            "email": "admin@carebridge.org",
            "password": "CareBridge@2026",
            "description": "Chief Medical Officer monitoring hospital wait times, referrals & supply audits"
        }
    ]

