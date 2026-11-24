# AI/ML Model Cards & Experimental Evaluation: CareBridge AI

## 1. Clinical Triage Risk Stratification Model
* **Model Type:** `RandomForestClassifier` (80 estimators, max depth 6)
* **Target Objective:** Assist frontline health workers in categorizing patient urgency (`Routine review`, `Priority review`, `Urgent review`).
* **Input Features:** Age, Temperature (°F), Systolic BP, Diastolic BP, Heart Rate, Oxygen Saturation ($\text{SpO}_2$), Symptom Duration, Chest Pain indicator, Dyspnea indicator.
* **Training Dataset:** 2,500 synthetic clinical records simulated with realistic Gaussian distributions and clinical thresholds.
* **Evaluation Metrics:**
  * **Test Accuracy:** 93.4%
  * **Macro Avg F1-Score:** 0.928
* **Feature Importance:**
  1. $\text{SpO}_2$ Saturation ($34.2\%$)
  2. Systolic Blood Pressure ($23.8\%$)
  3. Chest Pain flag ($18.5\%$)
  4. Temperature ($11.2\%$)
  5. Age vulnerability ($6.8\%$)
* **Limitations & Safety:** Research prototype decision-support engine. Does NOT diagnose diseases. Red-flag symptoms trigger immediate hospital bypass.

---

## 2. Dynamic Hospital Queue Waiting-Time Model
* **Model Type:** `GradientBoostingRegressor` (100 estimators, max depth 4)
* **Target Objective:** Predict minutes of waiting time per patient based on department load.
* **Input Features:** Current queue length, active doctor count, hour of day, departmental consultation base factor.
* **Training Dataset:** 3,000 simulated historical queue transactions.
* **Evaluation Metrics:**
  * **Mean Absolute Error (MAE):** 5.84 minutes
  * **$R^2$ Score:** 0.990 (significant improvement over linear average baseline $\text{MAE} \approx 14.2$ min)

---

## 3. Suspicious Medicine Scan Anomaly Detection Model
* **Model Type:** `IsolationForest` (contamination rate = 0.06)
* **Target Objective:** Detect unusual repeat scan velocity and geographical dispersion indicative of counterfeit QR packaging clones.
* **Input Features:** Cumulative scan count, geographical spread in kilometers, scan velocity per hour.
