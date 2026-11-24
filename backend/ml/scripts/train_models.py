import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error, r2_score
import joblib
import os
import json

def train_triage_model():
    """Trains a Random Forest triage classifier on synthetic clinical data with documented features."""
    np.random.seed(42)
    n_samples = 2500

    age = np.random.randint(1, 85, n_samples)
    temp = np.random.normal(99.0, 2.0, n_samples)
    sys_bp = np.random.normal(125, 20, n_samples)
    dia_bp = np.random.normal(82, 12, n_samples)
    hr = np.random.normal(82, 18, n_samples)
    spo2 = np.clip(np.random.normal(96, 4, n_samples), 70, 100)
    duration = np.random.exponential(4, n_samples)
    has_chest_pain = np.random.binomial(1, 0.12, n_samples)
    has_dyspnea = np.random.binomial(1, 0.15, n_samples)

    # Priority target: 0 = Routine, 1 = Priority, 2 = Urgent
    labels = []
    for i in range(n_samples):
        score = 0
        if has_chest_pain[i] or has_dyspnea[i]:
            score += 3
        if spo2[i] < 92:
            score += 3
        elif spo2[i] < 95:
            score += 1
        if sys_bp[i] > 160 or dia_bp[i] > 100:
            score += 2
        if temp[i] > 102.5:
            score += 2
        if age[i] > 65 or age[i] < 5:
            score += 1
        
        if score >= 4:
            labels.append(2) # Urgent
        elif score >= 2:
            labels.append(1) # Priority
        else:
            labels.append(0) # Routine

    df = pd.DataFrame({
        "age": age,
        "temp": temp,
        "sys_bp": sys_bp,
        "dia_bp": dia_bp,
        "hr": hr,
        "spo2": spo2,
        "duration": duration,
        "chest_pain": has_chest_pain,
        "dyspnea": has_dyspnea,
        "label": labels
    })

    X = df.drop(columns=["label"])
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    clf = RandomForestClassifier(n_estimators=80, max_depth=6, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    report = classification_report(y_test, y_pred, output_dict=True)

    os.makedirs("backend/ml/models", exist_ok=True)
    joblib.dump(clf, "backend/ml/models/triage_rf_model.pkl")

    with open("backend/ml/models/triage_metrics.json", "w") as f:
        json.dump({
            "model": "RandomForestClassifier",
            "accuracy": report["accuracy"],
            "macro_avg_f1": report["macro avg"]["f1-score"],
            "feature_importance": dict(zip(X.columns, clf.feature_importances_.tolist()))
        }, f, indent=2)

    print("Triage model trained successfully. Accuracy:", round(report["accuracy"], 3))

def train_queue_wait_time_model():
    """Trains a Gradient Boosting Regressor for dynamic public hospital waiting time estimation."""
    np.random.seed(101)
    n_samples = 3000

    queue_len = np.random.randint(1, 45, n_samples)
    active_doctors = np.random.randint(1, 5, n_samples)
    hour_of_day = np.random.randint(8, 18, n_samples)
    dept_factor = np.random.choice([10, 14, 18, 22], n_samples) # e.g. general vs specialist

    # True waiting time with realistic non-linear operational noise
    wait_time = (queue_len / active_doctors) * dept_factor * (1 + 0.15 * np.sin(hour_of_day / 2.0)) + np.random.normal(0, 3, n_samples)
    wait_time = np.clip(wait_time, 2, 240)

    X = pd.DataFrame({
        "queue_length": queue_len,
        "active_doctors": active_doctors,
        "hour_of_day": hour_of_day,
        "dept_consult_base": dept_factor
    })
    y = wait_time

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    reg = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    reg.fit(X_train, y_train)

    preds = reg.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    joblib.dump(reg, "backend/ml/models/queue_wait_model.pkl")

    with open("backend/ml/models/queue_metrics.json", "w") as f:
        json.dump({
            "model": "GradientBoostingRegressor",
            "mae_minutes": round(mae, 2),
            "r2_score": round(r2, 3),
            "feature_importance": dict(zip(X.columns, reg.feature_importances_.tolist()))
        }, f, indent=2)

    print(f"Queue waiting time model trained. MAE: {mae:.2f} mins, R2: {r2:.3f}")

def train_suspicious_verification_detector():
    """Isolation Forest for anomaly detection in medicine batch/serial verification logs."""
    np.random.seed(99)
    # Normal verification: 1-3 scans, scan intervals over days, few unique IPs
    n_normal = 1200
    scans_normal = np.random.poisson(2, n_normal) + 1
    geo_spread_km = np.random.exponential(15, n_normal)
    scan_velocity_per_hr = np.random.exponential(0.5, n_normal)

    # Suspicious duplicate / counterfeit scans: rapid bursts across distant locations
    n_suspicious = 80
    scans_susp = np.random.randint(8, 60, n_suspicious)
    geo_spread_susp = np.random.uniform(200, 1500, n_suspicious)
    scan_velocity_susp = np.random.uniform(5, 30, n_suspicious)

    X_normal = np.column_stack([scans_normal, geo_spread_km, scan_velocity_per_hr])
    X_susp = np.column_stack([scans_susp, geo_spread_susp, scan_velocity_susp])
    X = np.vstack([X_normal, X_susp])

    iso_forest = IsolationForest(contamination=0.06, random_state=42)
    iso_forest.fit(X)

    joblib.dump(iso_forest, "backend/ml/models/suspicious_scan_detector.pkl")
    print("Isolation Forest anomaly detector saved.")

if __name__ == "__main__":
    train_triage_model()
    train_queue_wait_time_model()
    train_suspicious_verification_detector()

