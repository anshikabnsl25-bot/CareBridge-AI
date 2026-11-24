import unittest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.core_engines import calculate_triage_score, HospitalNavigator, compute_event_hash

class TestCoreEngines(unittest.TestCase):
    def test_triage_urgent_emergency(self):
        result = calculate_triage_score(
            age=55,
            symptoms="Severe chest pain and difficulty breathing",
            duration_days=1,
            temp_f=98.6,
            sys_bp=190,
            dia_bp=115,
            hr_bpm=125,
            spo2_pct=88.0
        )
        self.assertEqual(result["priority_level"], "Urgent review")
        self.assertTrue(result["emergency_warning"])
        self.assertGreater(result["risk_score"], 0.7)
        self.assertEqual(result["recommended_specialty"], "Cardiology")

    def test_triage_routine(self):
        result = calculate_triage_score(
            age=28,
            symptoms="Mild itching and skin rash on arm",
            duration_days=2,
            temp_f=98.4,
            sys_bp=118,
            dia_bp=76,
            hr_bpm=72,
            spo2_pct=99.0
        )
        self.assertEqual(result["priority_level"], "Routine review")
        self.assertFalse(result["emergency_warning"])
        self.assertEqual(result["recommended_specialty"], "Dermatology")

    def test_dijkstra_hospital_navigation(self):
        nodes = [
            {"id": "A", "label": "Entrance", "floor": 0},
            {"id": "B", "label": "Desk", "floor": 0},
            {"id": "C", "label": "Elevator", "floor": 0},
            {"id": "D", "label": "Floor 1 OPD", "floor": 1}
        ]
        edges = [
            {"source_node": "A", "target_node": "B", "distance_meters": 10.0, "is_accessible": True},
            {"source_node": "B", "target_node": "C", "distance_meters": 15.0, "is_accessible": True},
            {"source_node": "C", "target_node": "D", "distance_meters": 20.0, "is_accessible": True}
        ]
        nav = HospitalNavigator(nodes, edges)
        route = nav.find_shortest_path("A", "D")
        self.assertEqual(route["total_distance_meters"], 45.0)
        self.assertEqual(route["path_nodes"], ["A", "B", "C", "D"])
        self.assertTrue(route["floor_changes"])
        self.assertEqual(len(route["detailed_steps"]), 3)

    def test_supply_chain_hash_integrity(self):
        h1 = compute_event_hash("BATCH-1", "Manufacturer", "2026-11-24", "00000000")
        h2 = compute_event_hash("BATCH-1", "Distributor", "2026-11-25", h1)
        self.assertEqual(len(h1), 64)
        self.assertNotEqual(h1, h2)

if __name__ == "__main__":
    unittest.main()

