# PETRO-TWIN AI: Digital Twin Core Architecture
## Cyber-Physical State Estimation, What-If Simulation, and Time-Machine

---

### 1. Cyber-Physical State Vector
The PETRO-TWIN Digital Twin maintains a continuous, calibrated state vector $\mathbf{X}(t)$ representing the well system:
$$\mathbf{X}(t) = \begin{bmatrix}
T_{\text{res}}(t) \\
P_{\text{res}}(t) \\
\mu_{\text{fluid}}(t) \\
M_o(t) \\
\mathbf{T}_{\text{wellbore}}(z, t) \\
\mathbf{P}_{\text{wellbore}}(z, t) \\
\text{PPRL}(t) \\
\text{MPRL}(t) \\
F_{\text{net, down}}(t) \\
P_{\text{rod\_float}}(t) \\
q_o(t) \\
\text{SOR}_{\text{cum}}(t)
\end{bmatrix}$$

---

### 2. Digital Twin Closed-Loop Workflow
The twin operates on an event-driven and cyclical update loop:
```text
[Telemetry Packet Ingested]
             │
             ▼
[Data Quality Filter: Missing, Range, Spike Checks]
             │
             ▼
[Physics State Reconciliation (Enthalpy & Mass Balance)]
             │
             ▼
[ML Residual Calibration (Corrects First-Principles Drift)]
             │
             ▼
[Digital Twin State Vector Updated & Broadcast via WebSocket]
             │
             ▼
[Real-Time Safety & Rod-Floating Anomaly Evaluator]
             │
             ▼
[Predictive Simulation (t+1, t+7, t+30 Days Forecast)]
             │
             ▼
[Constrained Multi-Objective Optimizer (If State Drift > Trigger)]
             │
             ▼
[Human-In-The-Loop Operational Decision Card & Audit Log]
```

---

### 3. Digital Twin Time Machine
The platform features an interactive **Time Machine** engine:
* Operators can scrub along a 0 to 180-day production timeline.
* The simulator animates the thermal dissipation plume in the Jodhpur Sandstone.
* Visualizes the cooling front moving inward from the reservoir boundary, the exponential rebound in fluid viscosity, the corresponding rise in polished rod load, and the progression of rod-floating risk from Safe ($<15\%$) to Warning ($>45\%$) to Critical ($>85\%$).
