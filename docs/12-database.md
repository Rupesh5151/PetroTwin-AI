# PETRO-TWIN AI: Database Schema & Entity Relationships
## PostgreSQL & TimescaleDB Data Models

---

### 1. Entity Relationship Overview
The database layout supports relational entities, time-series telemetry hypertables, and immutable audit logs:

```sql
-- Wells Registry
CREATE TABLE wells (
    well_id VARCHAR(50) PRIMARY KEY,
    well_name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) DEFAULT 'Baghewala',
    reservoir_name VARCHAR(100) DEFAULT 'Jodhpur Sandstone',
    depth_m NUMERIC(8,2) NOT NULL,
    pump_depth_m NUMERIC(8,2) NOT NULL,
    tubing_id_mm NUMERIC(6,2) NOT NULL,
    casing_id_mm NUMERIC(6,2) NOT NULL,
    active_cycle_number INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'ACTIVE_PRODUCTION',
    data_source_mode VARCHAR(30) DEFAULT 'SIMULATION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-Frequency Telemetry (TimescaleDB Hypertable)
CREATE TABLE telemetry (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    bottomhole_temp_c NUMERIC(6,2),
    bottomhole_pressure_bar NUMERIC(6,2),
    wellhead_pressure_bar NUMERIC(6,2),
    oil_rate_bpd NUMERIC(8,2),
    water_rate_bpd NUMERIC(8,2),
    steam_rate_bpd NUMERIC(8,2),
    viscosity_est_cp NUMERIC(8,2),
    spm NUMERIC(5,2),
    stroke_length_m NUMERIC(4,2),
    vfd_frequency_hz NUMERIC(5,2),
    peak_polished_rod_load_lbs NUMERIC(8,2),
    min_polished_rod_load_lbs NUMERIC(8,2),
    motor_power_kw NUMERIC(6,2),
    rod_floating_detected BOOLEAN DEFAULT FALSE,
    rod_floating_risk NUMERIC(5,4),
    data_quality_status VARCHAR(20) DEFAULT 'GOOD'
);

-- CSS Cycle Records
CREATE TABLE css_cycles (
    cycle_id VARCHAR(60) PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    cycle_number INT NOT NULL,
    steam_mass_tons NUMERIC(8,2) NOT NULL,
    steam_temp_c NUMERIC(6,2) NOT NULL,
    steam_pressure_bar NUMERIC(6,2) NOT NULL,
    soak_days NUMERIC(4,1) NOT NULL,
    production_days INT,
    cumulative_oil_bbl NUMERIC(10,2),
    cumulative_sor NUMERIC(6,2),
    cycle_status VARCHAR(30) DEFAULT 'COMPLETED',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- AI Recommendations & Human-in-the-Loop Audit
CREATE TABLE recommendations (
    recommendation_id VARCHAR(60) PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(30) NOT NULL,
    opt_engine_version VARCHAR(30) NOT NULL,
    recommended_spm NUMERIC(5,2),
    recommended_stroke_m NUMERIC(4,2),
    recommended_vfd_hz NUMERIC(5,2),
    recommended_next_steam_tons NUMERIC(8,2),
    recommended_soak_days NUMERIC(4,1),
    expected_prod_change_pct NUMERIC(5,2),
    expected_sor_change_pct NUMERIC(5,2),
    expected_energy_change_pct NUMERIC(5,2),
    expected_risk_change_pct NUMERIC(5,2),
    confidence_pct NUMERIC(5,2),
    rationale TEXT,
    approval_status VARCHAR(30) DEFAULT 'PENDING_REVIEW', -- APPROVED, REJECTED
    reviewed_by VARCHAR(50),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    audit_notes TEXT
);

-- Immutable Security & Operational Audit Log
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50),
    user_role VARCHAR(30),
    action VARCHAR(100) NOT NULL,
    well_id VARCHAR(50),
    request_ip VARCHAR(50),
    details JSONB
);
```
