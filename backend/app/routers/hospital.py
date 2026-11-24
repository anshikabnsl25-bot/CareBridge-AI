from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import random
from app.database import get_db
from app.models.entities import (
    HospitalNode, HospitalEdge, QueueToken, PatientJourney, Patient, Department
)
from app.schemas.dto import NavigationRequest, QueueTokenCreate
from app.services.core_engines import HospitalNavigator

router = APIRouter(prefix="/hospital", tags=["Hospital Navigation & Digital Queue"])

@router.get("/layout")
def get_hospital_layout(floor: Optional[int] = None, db: Session = Depends(get_db)):
    """Returns nodes and edges for the demonstration hospital interactive floor layout."""
    q_nodes = db.query(HospitalNode)
    if floor is not None:
        q_nodes = q_nodes.filter(HospitalNode.floor == floor)
    nodes = q_nodes.all()
    edges = db.query(HospitalEdge).all()

    return {
        "hospital_id": "HOSP-01",
        "name": "AIIMS District Healthcare Hub (Gorakhpur)",
        "nodes": [
            {
                "id": n.id,
                "label": n.label,
                "department": n.department,
                "floor": n.floor,
                "x": n.x,
                "y": n.y,
                "is_accessible": n.is_accessible
            }
            for n in nodes
        ],
        "edges": [
            {
                "source_node": e.source_node,
                "target_node": e.target_node,
                "distance_meters": e.distance_meters,
                "is_accessible": e.is_accessible
            }
            for e in edges
        ]
    }

@router.post("/navigate")
def find_route(req: NavigationRequest, db: Session = Depends(get_db)):
    """Computes shortest route using graph Dijkstra search with turn-by-turn guidance."""
    nodes = [
        {"id": n.id, "label": n.label, "floor": n.floor, "x": n.x, "y": n.y}
        for n in db.query(HospitalNode).all()
    ]
    edges = [
        {"source_node": e.source_node, "target_node": e.target_node, "distance_meters": e.distance_meters, "is_accessible": e.is_accessible}
        for e in db.query(HospitalEdge).all()
    ]
    navigator = HospitalNavigator(nodes, edges)
    result = navigator.find_shortest_path(req.source_node, req.target_node, accessible_only=req.accessible_only)
    return result

@router.get("/queue/departments")
def list_queue_status(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    dept_queues = []
    for d in depts:
        waiting_count = db.query(QueueToken).filter(QueueToken.department_id == d.id, QueueToken.status == "waiting").count()
        serving_token = db.query(QueueToken).filter(QueueToken.department_id == d.id, QueueToken.status == "serving").first()
        est_wait = waiting_count * d.avg_consultation_mins
        dept_queues.append({
            "department_id": d.id,
            "department_name": d.name,
            "floor": d.floor,
            "current_token_serving": serving_token.token_number if serving_token else "Standby",
            "queue_length": waiting_count,
            "estimated_wait_minutes": est_wait
        })
    return dept_queues

@router.post("/queue/token")
def generate_queue_token(req: QueueTokenCreate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == req.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Prefix from department name
    prefix = dept.name.split()[0][:5].upper()
    total_today = db.query(QueueToken).filter(QueueToken.department_id == req.department_id).count()
    token_str = f"{prefix}-{total_today + 1:03d}"

    waiting_count = db.query(QueueToken).filter(QueueToken.department_id == req.department_id, QueueToken.status == "waiting").count()
    est_wait = waiting_count * dept.avg_consultation_mins

    # Find serving token
    serving = db.query(QueueToken).filter(QueueToken.department_id == req.department_id, QueueToken.status == "serving").first()
    curr_serving_str = serving.token_number if serving else "Standby"

    tok = QueueToken(
        token_number=token_str,
        patient_id=req.patient_id,
        department_id=req.department_id,
        status="waiting",
        priority_level=req.priority_level or "routine",
        estimated_wait_minutes=est_wait,
        current_token_serving=curr_serving_str
    )
    db.add(tok)
    db.commit()
    db.refresh(tok)

    return tok

@router.get("/journey/{patient_id}")
def get_patient_journey(patient_id: str, db: Session = Depends(get_db)):
    journey = db.query(PatientJourney).filter(PatientJourney.patient_id == patient_id).first()
    if not journey:
        # Fallback to default cardiac journey for demo
        journey = db.query(PatientJourney).first()
    return journey

