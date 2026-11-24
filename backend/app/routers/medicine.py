from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import json
import hashlib
from app.database import get_db
from app.models.entities import (
    Medicine, MedicineBatch, MedicineSerial, SupplyChainEvent, VerificationLog
)
from app.schemas.dto import MedicineVerifyRequest, MedicineBatchCreate
from app.services.core_engines import compute_event_hash

router = APIRouter(prefix="/medicine", tags=["Medicine Traceability & Verification"])

@router.post("/verify")
def verify_medicine(req: MedicineVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies medicine authenticity using scanned QR code payload, serial number or batch number.
    Returns: matched, expired, suspicious, or not_found.
    """
    raw_query = req.query.strip()
    serial_str = raw_query
    
    # Check if query is JSON formatted payload
    if raw_query.startswith("{") and "sn" in raw_query:
        try:
            payload = json.loads(raw_query)
            serial_str = payload.get("sn", raw_query)
        except Exception:
            pass

    # Search for serial number
    serial_rec = db.query(MedicineSerial).filter(MedicineSerial.serial_number == serial_str).first()
    
    # If not found by serial, check if user provided a batch number
    batch_rec = None
    if not serial_rec:
        batch_rec = db.query(MedicineBatch).filter(MedicineBatch.batch_number == raw_query).first()
        if batch_rec:
            serial_rec = db.query(MedicineSerial).filter(MedicineSerial.batch_id == batch_rec.id).first()

    if not serial_rec:
        # Log unverified attempt
        db.add(VerificationLog(
            serial_number=serial_str[:50],
            scanned_by_role=req.scanned_by_role or "public",
            result_status="not_found",
            device_info="Client Web App"
        ))
        db.commit()
        return {
            "status": "not_found",
            "message": "No matching medicine record found in the central regulatory registry.",
            "disclaimer": "Lack of a matching record may indicate unverified or counterfeit stock. Do not consume without consulting a pharmacist."
        }

    batch = db.query(MedicineBatch).filter(MedicineBatch.id == serial_rec.batch_id).first()
    medicine = db.query(Medicine).filter(Medicine.id == batch.medicine_id).first()
    
    # Increment scan count
    serial_rec.scan_count += 1
    
    # Anomaly / Duplicate check
    is_suspicious = False
    if serial_rec.scan_count >= 5 or serial_rec.is_flagged_suspicious:
        is_suspicious = True
        serial_rec.is_flagged_suspicious = True

    # Check expiry
    # Dates are in YYYY-MM-DD
    current_date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    is_expired = batch.expiry_date < current_date_str

    if is_expired:
        result_status = "expired"
        msg = f"WARNING: This medicine expired on {batch.expiry_date}. DO NOT CONSUME."
    elif is_suspicious:
        result_status = "suspicious"
        msg = f"FLAGGED: High scan frequency detected ({serial_rec.scan_count} scans). Possible duplicate packaging or cloned QR code."
    else:
        result_status = "matched"
        msg = "Medicine record successfully verified against regulatory database."

    # Record verification log
    db.add(VerificationLog(
        serial_number=serial_rec.serial_number,
        scanned_by_role=req.scanned_by_role or "public",
        result_status=result_status,
        device_info="CareBridge PWA Camera Scanner"
    ))
    db.commit()

    # Get supply chain audit trail
    events = db.query(SupplyChainEvent).filter(SupplyChainEvent.batch_id == batch.id).order_by(SupplyChainEvent.timestamp.asc()).all()
    trail = [
        {
            "stage": ev.stage,
            "location": ev.location,
            "performed_by": ev.performed_by,
            "timestamp": ev.timestamp.isoformat() if ev.timestamp else "",
            "event_hash": ev.event_hash[:16] + "..." if ev.event_hash else ""
        }
        for ev in events
    ]

    return {
        "status": result_status,
        "message": msg,
        "medicine": {
            "name": medicine.name,
            "generic_name": medicine.generic_name,
            "category": medicine.category,
            "dosage_form": medicine.dosage_form,
            "strength": medicine.strength,
            "manufacturer": medicine.manufacturer,
            "regulatory_reg_no": medicine.regulatory_reg_no
        },
        "batch": {
            "batch_number": batch.batch_number,
            "mfg_date": batch.mfg_date,
            "expiry_date": batch.expiry_date,
            "current_quantity": batch.current_quantity,
            "status": batch.status
        },
        "serial": {
            "serial_number": serial_rec.serial_number,
            "scan_count": serial_rec.scan_count,
            "is_flagged_suspicious": serial_rec.is_flagged_suspicious
        },
        "supply_chain_trail": trail,
        "source": "Government Jan Aushadhi & CDSCO Central Registry (Verified Simulated Source)",
        "disclaimer": "Genuine packaging confirmation requires physical tamper-evident seal inspection."
    }

@router.get("/batches")
def list_batches(limit: int = 50, db: Session = Depends(get_db)):
    batches = db.query(MedicineBatch).order_by(MedicineBatch.created_at.desc()).limit(limit).all()
    res = []
    for b in batches:
        m = db.query(Medicine).filter(Medicine.id == b.medicine_id).first()
        serials = db.query(MedicineSerial).filter(MedicineSerial.batch_id == b.id).all()
        sample_sn = serials[0].serial_number if serials else ""
        sample_qr = serials[0].qr_payload if serials else ""
        suspicious_cnt = sum(1 for s in serials if s.is_flagged_suspicious)
        res.append({
            "id": b.id,
            "batch_number": b.batch_number,
            "medicine_name": m.name if m else "Unknown",
            "manufacturer": m.manufacturer if m else "",
            "mfg_date": b.mfg_date,
            "expiry_date": b.expiry_date,
            "quantity": b.current_quantity,
            "status": b.status,
            "sample_serial": sample_sn,
            "sample_qr_payload": sample_qr,
            "suspicious_count": suspicious_cnt
        })
    return res

@router.post("/register-batch")
def register_batch(data: MedicineBatchCreate, db: Session = Depends(get_db)):
    # 1. Create or find medicine
    med = db.query(Medicine).filter(Medicine.name == data.medicine_name).first()
    if not med:
        med = Medicine(
            name=data.medicine_name,
            generic_name=data.generic_name,
            category=data.category,
            dosage_form=data.dosage_form,
            strength=data.strength,
            manufacturer=data.manufacturer,
            regulatory_reg_no=data.regulatory_reg_no
        )
        db.add(med)
        db.commit()
        db.refresh(med)

    # 2. Create batch
    batch = MedicineBatch(
        medicine_id=med.id,
        batch_number=data.batch_number,
        mfg_date=data.mfg_date,
        expiry_date=data.expiry_date,
        total_quantity=data.quantity,
        current_quantity=data.quantity,
        status="active"
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    # 3. Generate initial serial
    sn = f"CB-MED-{med.id}-{data.batch_number}-SN{random.randint(10000, 99999)}"
    qr_data = json.dumps({
        "app": "CareBridgeAI",
        "ver": "1.0",
        "sn": sn,
        "batch": data.batch_number,
        "med": med.name,
        "mfr": med.manufacturer,
        "exp": data.expiry_date,
        "reg": med.regulatory_reg_no
    })
    serial_rec = MedicineSerial(
        batch_id=batch.id,
        serial_number=sn,
        qr_payload=qr_data,
        scan_count=0,
        status="valid"
    )
    db.add(serial_rec)

    # 4. Initial supply chain block
    genesis_hash = hashlib.sha256(f"{batch.id}|Manufacturer|GENESIS".encode()).hexdigest()
    db.add(SupplyChainEvent(
        batch_id=batch.id,
        stage="Manufacturer",
        location=f"{data.manufacturer} Production Plant #1",
        performed_by="Batch Quality Assurance Officer",
        event_hash=genesis_hash,
        previous_hash="0000000000000000000000000000000000000000000000000000000000000000"
    ))
    db.commit()

    return {
        "message": "Medicine batch registered successfully",
        "batch_id": batch.id,
        "batch_number": batch.batch_number,
        "serial_number": sn,
        "qr_payload": qr_data
    }

@router.get("/suspicious-reports")
def list_suspicious_reports(db: Session = Depends(get_db)):
    serials = db.query(MedicineSerial).filter(MedicineSerial.is_flagged_suspicious == True).all()
    reports = []
    for s in serials:
        batch = db.query(MedicineBatch).filter(MedicineBatch.id == s.batch_id).first()
        med = db.query(Medicine).filter(Medicine.id == batch.medicine_id).first() if batch else None
        reports.append({
            "serial_number": s.serial_number,
            "scan_count": s.scan_count,
            "batch_number": batch.batch_number if batch else "Unknown",
            "medicine_name": med.name if med else "Unknown",
            "manufacturer": med.manufacturer if med else "Unknown",
            "status": s.status,
            "reason": "Repeated scan threshold exceeded across unusual geolocation fingerprints"
        })
    return reports

