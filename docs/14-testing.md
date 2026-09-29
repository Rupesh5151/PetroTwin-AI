# PETRO-TWIN AI: Verification, Testing & Quality Assurance
## Multi-Layer Test Strategy: Unit, Physics Sanity, ML Leakage, and End-to-End

---

### 1. Multi-Layer Testing Matrix

```text
┌────────────────────────────────────────────────────────┐
│ Layer 5: End-to-End (E2E) Browser & UI Workflow Tests  │
│ Playwright automated test scripts for complete demo    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Layer 4: API & WebSocket Integration Tests             │
│ FastAPI TestClient & REST Assured verification         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Layer 3: Optimization & Feasibility Boundary Tests     │
│ Infeasible parameter penalty tests, constraint bounds  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Layer 2: Machine Learning Leakage & Invariant Tests    │
│ Chronological split checks, conformal interval coverage│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Layer 1: Physics Conservation & Equation Unit Tests    │
│ First-principles thermal balance, Walther viscosity    │
└────────────────────────────────────────────────────────┘
```

---

### 2. Physics Unit & Sanity Invariants
* **Viscosity Inversion Check:** Viscosity must decrease monotonically with temperature ($\partial \mu / \partial T < 0$).
* **Thermal Conservation:** Cumulative heat post-soak must equal injected enthalpy minus conductive dissipation ($Q_{\text{retained}} \le Q_{\text{inj}}$).
* **Rod-Floating Detection Sensitivity:** High-viscosity cold crude with aggressive SPM must consistently trigger rod floating flag ($F_{\text{net, down}} \le 0$ or $v_{\text{max}} \ge v_{\text{term}}$).
* **Dynamometer Closure:** The generated dynamometer card load-displacement curve must form a closed loop across a 360-degree crank cycle.

---

### 3. Automated Test Execution Commands
```bash
# Run Physics Unit Tests
python -m unittest tests/test_physics.py

# Run ML & Model Inference Tests
python -m unittest tests/test_ml_models.py

# Run Optimization & Constraint Engine Tests
python -m unittest tests/test_optimization.py

# Run Complete Suite
python -m unittest discover tests/
```
