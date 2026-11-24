# Judge Q&A & Technical Defense: CareBridge AI

### Q1: Why combine three separate modules into one platform instead of focusing on just one?
**Answer:** In rural Bharat, healthcare failures are systemic and chained together. A patient who travels to a district hospital without specialist pre-review often arrives on the wrong day, gets lost in overcrowded corridors, waits 5 hours in the wrong queue, and finally receives medicine without knowing if it is genuine. Solving only one problem leaves the patient stranded at the next step. CareBridge AI creates a continuous, unbroken patient continuum from village PHC to hospital pharmacy.

### Q2: Is the AI clinical triage engine attempting to replace licensed doctors?
**Answer:** Absolutely not. CareConnect is strictly a *clinician-in-the-loop decision-support and prioritization assistant*. It calculates transparent risk scores and highlights missing information for human specialists. It does not provide autonomous clinical diagnoses or prescribe medication. In any scenario where red-flag indicators (such as chest pain or $\text{SpO}_2 < 90\%$) appear, the system forces an immediate emergency bypass warning instructing the patient to seek physical emergency care immediately.

### Q3: Why does matching a medicine record not guarantee that the medicine is authentic?
**Answer:** A counterfeit syndicate can photocopy or replicate a valid QR code on thousands of counterfeit packages. MediTrust explicitly addresses this: first, by informing users that a database match alone is not a guarantee of genuine status without tamper-evident seal inspection; and second, by actively flagging high-frequency repeat scans of the same serial number across dispersed IP locations via Isolation Forest anomaly detection.

### Q4: How does CareNav handle multi-floor transitions and accessibility?
**Answer:** CareNav models the hospital as an indoor graph using Dijkstra's algorithm. Elevator and ramp connections between floors are weighted edges. When a patient or staff member toggles "Accessible route only", stairs are pruned from the graph, ensuring patients in wheelchairs or with mobility limitations are routed exclusively through functional ramps and elevator banks.

### Q5: How is CareBridge AI engineered for low-end devices and weak rural networks?
**Answer:** 
1. **Low-Bandwidth Mode:** Disables non-essential graphics and heavy assets.
2. **Offline-First Map Data:** Hospital nodes, edges, and public facility guidelines are cached client-side in the PWA application shell.
3. **Voice & Accessibility:** Built using native Web Speech APIs requiring zero external cloud audio subscriptions.
4. **Resilient Sync:** Vitals and queue states reconcile automatically upon network restoration.
