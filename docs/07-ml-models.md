# PETRO-TWIN AI: Machine Learning Architecture & Models
## Hybrid Physics-ML, Production Forecasting, Failure Intelligence, and Anomaly Detection

---

### 1. Hybrid Physics + ML Modeling Philosophy
Pure deep learning models in petroleum engineering suffer from severe out-of-distribution hallucinations and violation of mass/energy conservation. Pure physics models suffer from idealized assumptions (heterogeneity, wax deposition, changing reservoir boundary conditions).
**PETRO-TWIN AI adopts the Hybrid Residual Architecture:**
$$\hat{y}(t) = f_{\text{physics}}(u(t), \theta) + g_{\text{ML}}(x(t), \mathbf{w}) \pm 1.96 \cdot \hat{\sigma}_{\text{uncertainty}}$$
Where:
* $f_{\text{physics}}$ enforces thermodynamics (heat balance, Walther viscosity, Darcy flow, API 11L mechanics).
* $g_{\text{ML}}$ captures unmodeled real-world empirical residuals (asphaltene flocculation, sand influx, motor mechanical friction).

---

### 2. Model 1: Heavy Oil Production Forecaster
* **Algorithms Evaluated:** Baseline Drift, Ridge Regression, Random Forest, LightGBM/XGBoost, and 1D-CNN/TCN temporal models.
* **Input Features:**
  * Lags: $q_o(t-1), q_o(t-3), q_o(t-7), q_o(t-14)$
  * Rolling Statistics: 7-day rolling mean, 7-day rolling standard deviation
  * Physical Drivers: Reservoir Temperature $T_{\text{res}}$, Estimated Viscosity $\mu$, Darcy Mobility $M_o$
  * Operating Parameters: Stroke Length $S$, Strokes Per Minute $\text{SPM}$, VFD Frequency
  * Thermal State: Cumulative Days since Steam Injection $t_{\text{prod}}$, Steam Volume injected $M_{\text{steam}}$
* **Forecast Horizons:** $t+1$, $t+7$, $t+30$ days with 95% conformal prediction intervals.

---

### 3. Model 2: Failure Intelligence & Survival Risk
* **Target Classes:**
  1. `ROD_FLOATING`: Viscous drag outrunning rod sinking velocity.
  2. `PARTED_ROD`: Cyclical fatigue failure under impact pounding.
  3. `PUMP_UNSETTING`: Frictional thrust and hydraulic pressure lifting the bottomhole pump off its seating nipple.
* **Architecture:** Calibrated ensemble classifier with logistic probability outputs + survival analysis hazard rate estimation.
* **Explainability:** Feature attribution (SHAP / TreeSHAP) quantifying the exact % contribution of temperature, viscosity, SPM, and load spikes to the current failure probability.

---

### 4. Model 3: Sensor Anomaly Detection
* **Algorithm:** Isolation Forest + Rolling Z-Score Hybrid.
* **Variables Monitored:** High-frequency polished rod load, motor current/power, wellhead pressure, flowline temperature.
* **Objective:** Catches sudden sensor spikes, stuck valves, parted rods, or gas interference within 60 seconds of onset.
