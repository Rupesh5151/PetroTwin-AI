# PETRO-TWIN AI: Scientific Limitations & Scope Boundaries
## Honest Technical Disclosure for SIH 2026 Evaluation

---

### 1. Transparent Model Boundaries
In strict accordance with scientific integrity and the SIH data honesty mandate:

1. **Not a 3D Full-Field Reservoir Simulator:** PETRO-TWIN AI is a well-to-surface digital twin focused on near-wellbore thermal decay, oil mobility, and sucker rod lift mechanics. It is **not** a 300,000-cell 3D compositional reservoir simulator (like CMG STARS or ECLIPSE). It employs physics-informed semi-analytical Marx-Langenheim heat balances and 1D wellbore discretization.
2. **Simulation Calibration Basis:** Because real-time field SCADA feeds from Oil India Limited are proprietary and unavailable in the public SIH repository, the demo operates in **Literature-Calibrated Simulation Mode** based on published Baghewala SPE technical papers (SPE-39535, SPE-129198).
3. **Pluggable Architecture (Tier C):** All ingestion endpoints are engineered to accept live Oil India telemetry without architectural alterations once field data sharing is cleared.
4. **Decision Support, Not Autonomous Control:** The system is explicitly configured as a **Human-in-the-Loop Decision Support System (DSS)**. It generates recommendations with quantified confidence intervals, requiring production engineer approval before operational dispatch.
