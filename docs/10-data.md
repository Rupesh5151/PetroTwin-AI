# PETRO-TWIN AI: Data Architecture & Governance
## Tiered Data Architecture, Validation Engine, and Replay System

---

### 1. The 3-Tier Data Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│ TIER A: Verified Public Petrotechnical Benchmarks                      │
│ - Equinor Volve Open Data (CC BY 4.0): Pressure/Temp time-series       │
│ - PetroBench SRP Dynamometer Cards (MIT License)                       │
│ - SPE Literature Case Studies (SPE-39535, SPE-129198, SPE-165364)      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER B: Literature-Calibrated Baghewala Simulator                      │
│ - Thermodynamically coupled Jodhpur Sandstone heavy oil model          │
│ - Fully correlated streams (Steam, Temp, Viscosity, Drag, Risk)        │
│ - STRICT MANDATORY LABEL: "SIMULATED / SYNTHETIC - NOT OIL INDIA DATA" │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER C: Future Oil India Limited Real Data Ingestion Adapters          │
│ - CSVDataAdapter (Historical well files)                               │
│ - PostgresDataAdapter (Enterprise relational warehouse)                │
│ - RESTDataAdapter (Secure HTTPS webhook)                               │
│ - MQTTDataAdapter (Live field SCADA / IoT broker)                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Data Quality & Sanitization Pipeline
Every incoming telemetry packet is scored across 7 data-integrity gates before entering the Digital Twin:
1. **Timestamp Monotonicity:** Verifies no negative time steps or duplicate timestamps.
2. **Physical Boundary Checks:** Rejects unphysical values (e.g., negative oil rates, negative temperatures, negative polished rod loads).
3. **Sensor Spike Filter:** Flags rates of change exceeding $3\sigma$ from rolling 15-minute standard deviation.
4. **Sensor Dropout / Stale Data:** Detects frozen sensors transmitting identical floating-point numbers continuously.
5. **Unit Verification:** Enforces explicit conversion between SI, metric, and oilfield standard units.
6. **Data Quality Score:** Outputs a quality rating: `GOOD`, `WARNING`, or `CRITICAL_REJECT`.
