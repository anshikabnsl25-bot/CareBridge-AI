import os
import heapq
import hashlib
from typing import Dict, List, Any, Tuple
import numpy as np

# Rule-based and explainable clinical triage engine
def calculate_triage_score(
    age: int,
    symptoms: str,
    duration_days: int,
    temp_f: float,
    sys_bp: int,
    dia_bp: int,
    hr_bpm: int,
    spo2_pct: float,
    history: str = ""
) -> Dict[str, Any]:
    """
    Clinician-reviewed triage rules with Explainable Factors & Disclaimers.
    Categories:
    - Urgent review (Immediate attention required)
    - Priority review (Consultation needed within 24-48 hours)
    - Routine review (Standard OPD consultation)
    - Insufficient information (Vitals missing or inconsistent)
    """
    contributing_factors = []
    missing_info = []
    risk_points = 0.0
    emergency_warning = False

    symptoms_lower = (symptoms or "").lower()

    # Red-flag emergency indicators
    emergency_keywords = [
        "chest pain", "difficulty breathing", "shortness of breath", "unconscious",
        "stroke", "seizure", "severe bleeding", "cyanosis", "paralysis"
    ]
    for kw in emergency_keywords:
        if kw in symptoms_lower:
            emergency_warning = True
            risk_points += 45
            contributing_factors.append({
                "factor": f"High-risk symptom detected: '{kw}'",
                "severity": "CRITICAL",
                "weight": "+45 pts"
            })

    # Oxygen Saturation (SpO2)
    if spo2_pct <= 0:
        missing_info.append("SpO2 measurement is missing or unverified")
    elif spo2_pct < 90:
        emergency_warning = True
        risk_points += 40
        contributing_factors.append({
            "factor": f"Severe hypoxemia (SpO2: {spo2_pct}%)",
            "severity": "CRITICAL",
            "weight": "+40 pts"
        })
    elif spo2_pct < 94:
        risk_points += 25
        contributing_factors.append({
            "factor": f"Mild hypoxemia (SpO2: {spo2_pct}%)",
            "severity": "HIGH",
            "weight": "+25 pts"
        })

    # Blood Pressure
    if sys_bp >= 180 or dia_bp >= 120:
        emergency_warning = True
        risk_points += 35
        contributing_factors.append({
            "factor": f"Hypertensive crisis range (BP: {sys_bp}/{dia_bp} mmHg)",
            "severity": "CRITICAL",
            "weight": "+35 pts"
        })
    elif sys_bp >= 140 or dia_bp >= 90:
        risk_points += 15
        contributing_factors.append({
            "factor": f"Stage 2 Hypertension (BP: {sys_bp}/{dia_bp} mmHg)",
            "severity": "MODERATE",
            "weight": "+15 pts"
        })
    elif sys_bp < 90:
        risk_points += 20
        contributing_factors.append({
            "factor": f"Hypotension reading (BP: {sys_bp}/{dia_bp} mmHg)",
            "severity": "HIGH",
            "weight": "+20 pts"
        })

    # Temperature
    if temp_f >= 103.5:
        risk_points += 25
        contributing_factors.append({
            "factor": f"High-grade fever (Temp: {temp_f}°F)",
            "severity": "HIGH",
            "weight": "+25 pts"
        })
    elif temp_f >= 100.4:
        risk_points += 10
        contributing_factors.append({
            "factor": f"Low-grade fever (Temp: {temp_f}°F)",
            "severity": "LOW",
            "weight": "+10 pts"
        })

    # Heart Rate
    if hr_bpm > 130 or hr_bpm < 45:
        risk_points += 20
        contributing_factors.append({
            "factor": f"Marked tachycardia/bradycardia (HR: {hr_bpm} bpm)",
            "severity": "HIGH",
            "weight": "+20 pts"
        })
    elif hr_bpm > 105:
        risk_points += 10
        contributing_factors.append({
            "factor": f"Elevated resting heart rate (HR: {hr_bpm} bpm)",
            "severity": "MODERATE",
            "weight": "+10 pts"
        })

    # Age vulnerability factor
    if age >= 65 or age <= 5:
        risk_points += 10
        contributing_factors.append({
            "factor": f"Vulnerable age bracket (Age: {age})",
            "severity": "MODERATE",
            "weight": "+10 pts"
        })

    # Symptom duration
    if duration_days > 14:
        risk_points += 15
        contributing_factors.append({
            "factor": f"Prolonged symptom duration ({duration_days} days)",
            "severity": "MODERATE",
            "weight": "+15 pts"
        })

    # Normalize risk score between 0.0 and 1.0
    risk_score = round(min(1.0, max(0.05, risk_points / 100.0)), 2)

    # Determine priority
    if emergency_warning or risk_score >= 0.70:
        priority_level = "Urgent review"
    elif risk_score >= 0.35:
        priority_level = "Priority review"
    elif len(contributing_factors) == 0 and len(symptoms_lower) < 5:
        priority_level = "Insufficient information"
        missing_info.append("In-depth symptom description is required")
    else:
        priority_level = "Routine review"

    # Specialty recommendation heuristic
    recommended_specialty = "General Medicine"
    if any(k in symptoms_lower for k in ["chest", "palpitation", "heart", "bp"]):
        recommended_specialty = "Cardiology"
    elif any(k in symptoms_lower for k in ["breath", "cough", "wheez", "lung", "phlegm"]):
        recommended_specialty = "Pulmonology"
    elif any(k in symptoms_lower for k in ["headache", "dizzy", "numb", "seizure", "tremor"]):
        recommended_specialty = "Neurology"
    elif any(k in symptoms_lower for k in ["rash", "itching", "lesion", "skin", "boil"]):
        recommended_specialty = "Dermatology"
    elif any(k in symptoms_lower for k in ["joint", "knee", "bone", "fracture", "back"]):
        recommended_specialty = "Orthopedics"
    elif age <= 12:
        recommended_specialty = "Pediatrics"

    return {
        "priority_level": priority_level,
        "risk_score": risk_score,
        "contributing_factors": contributing_factors,
        "missing_information": missing_info,
        "model_limitations": (
            "This rule-based AI triage engine is an assistive research prototype and DOES NOT "
            "provide autonomous medical diagnoses or safety assurances. "
            "A licensed physician must independently evaluate the patient."
        ),
        "emergency_warning": emergency_warning,
        "recommended_specialty": recommended_specialty,
        "disclaimer": (
            "NOTICE: Emergency cases must report immediately to the nearest Emergency Department. "
            "Never delay seeking medical attention based on digital triage recommendations."
        )
    }

# Graph routing using Dijkstra's Algorithm
class HospitalNavigator:
    def __init__(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]):
        self.nodes = {n["id"]: n for n in nodes}
        self.adj = {}
        for n_id in self.nodes:
            self.adj[n_id] = []
        for e in edges:
            u, v, dist = e["source_node"], e["target_node"], float(e["distance_meters"])
            is_acc = e.get("is_accessible", True)
            self.adj[u].append((v, dist, is_acc))
            self.adj[v].append((u, dist, is_acc))

    def find_shortest_path(self, start_id: str, target_id: str, accessible_only: bool = False) -> Dict[str, Any]:
        if start_id not in self.nodes or target_id not in self.nodes:
            return {"error": "Invalid start or destination node"}

        pq = [(0.0, start_id, [start_id])]
        visited = set()

        while pq:
            cost, curr, path = heapq.heappop(pq)
            if curr in visited:
                continue
            visited.add(curr)

            if curr == target_id:
                # Generate step-by-step human instructions
                steps = []
                for i in range(len(path) - 1):
                    u_node = self.nodes[path[i]]
                    v_node = self.nodes[path[i + 1]]
                    floor_change = v_node.get("floor", 0) - u_node.get("floor", 0)
                    step_text = f"From {u_node['label']}, proceed to {v_node['label']}"
                    if floor_change != 0:
                        direction = "up" if floor_change > 0 else "down"
                        step_text += f" (Take elevator/stairs {direction} to Floor {v_node['floor']})"
                    steps.append({
                        "step_number": i + 1,
                        "instruction": step_text,
                        "from_node": u_node["label"],
                        "to_node": v_node["label"],
                        "floor": v_node.get("floor", 0)
                    })

                return {
                    "total_distance_meters": round(cost, 1),
                    "estimated_walking_time_mins": round(cost / 45.0, 1), # avg 45m/min walking speed
                    "path_nodes": path,
                    "detailed_steps": steps,
                    "accessible_route": accessible_only,
                    "floor_changes": any(self.nodes[p].get("floor", 0) != self.nodes[path[0]].get("floor", 0) for p in path)
                }

            for neighbor, weight, is_acc in self.adj.get(curr, []):
                if accessible_only and not is_acc:
                    continue
                if neighbor not in visited:
                    heapq.heappush(pq, (cost + weight, neighbor, path + [neighbor]))

        return {"error": "No accessible route found between chosen points"}

# Cryptographic chain hashing for auditability
def compute_event_hash(batch_id: str, stage: str, timestamp_str: str, prev_hash: str) -> str:
    content = f"{batch_id}|{stage}|{timestamp_str}|{prev_hash}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

