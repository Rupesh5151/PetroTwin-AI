# PETRO-TWIN AI: REST & WebSocket API Specification
## OpenAPI 3.0 Endpoints and STOMP / WebSocket Event Channels

---

### 1. REST Endpoints Overview

#### 1.1 Well Management & State
* `GET /api/wells`: List all wells in the field with current cycle and operating status.
* `GET /api/wells/{id}`: Detailed static completion and reservoir metadata for a well.
* `GET /api/wells/{id}/state`: Current cyber-physical state vector of the Digital Twin.
* `GET /api/wells/{id}/telemetry/latest`: Most recent telemetry packet.
* `GET /api/wells/{id}/telemetry/history?days=30`: Time-series sensor history.
* `GET /api/wells/{id}/css/cycles`: Historical CSS injection, soak, and production cycle records.
* `GET /api/wells/{id}/srp/dyno-card`: Current surface and downhole dynamometer card points.

#### 1.2 Digital Twin Simulation & What-If Lab
* `POST /api/scenarios/simulate`: Runs a counterfactual what-if simulation for a hypothetical CSS + SRP configuration.
* `POST /api/digital-twin/time-machine`: Evaluates thermodynamic and mechanical state at a chosen day $T+N$.

#### 1.3 Machine Learning & Predictions
* `POST /api/predictions/production`: Multi-horizon (1, 7, 30 day) production forecast with 95% confidence intervals.
* `POST /api/predictions/failure`: Failure hazard probabilities (rod float, parted rod, pump unseating).
* `POST /api/predictions/anomalies`: Current anomaly flags and isolation forest scores.

#### 1.4 Optimization & Recommendations
* `POST /api/optimization/run`: Executes constrained multi-objective Pareto optimization.
* `GET /api/recommendations/latest/{well_id}`: Retrieves active AI recommendation.
* `POST /api/recommendations/{id}/action`: Engineer approval or rejection with audit comment.

#### 1.5 Agentic AI Copilot
* `POST /api/copilot/query`: Natural language prompt processed by supervisor agent calling deterministic tools.

---

### 2. WebSocket Real-Time Channels
* `/topic/well/{id}/telemetry`: High-frequency streaming telemetry (temperature, pressure, oil rate, loads, SPM).
* `/topic/well/{id}/dyno`: Dynamometer stroke position and load points (updated every stroke cycle).
* `/topic/well/{id}/alerts`: Safety alerts (rod floating detected, impact loading warning).
* `/topic/system/health`: Service latency, queue status, and data quality metrics.
