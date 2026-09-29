-- PETRO-TWIN AI: V1 Initial Schema Migration
-- Standard PostgreSQL & H2 compatible syntax

CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR(30) PRIMARY KEY,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(30) REFERENCES roles(role_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservoirs (
    reservoir_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    basin VARCHAR(100) NOT NULL,
    formation VARCHAR(100) NOT NULL,
    initial_temperature_c NUMERIC(6,2),
    initial_pressure_bar NUMERIC(6,2),
    api_gravity NUMERIC(4,2),
    native_viscosity_cp NUMERIC(8,2)
);

CREATE TABLE IF NOT EXISTS wells (
    well_id VARCHAR(50) PRIMARY KEY,
    well_name VARCHAR(100) NOT NULL,
    reservoir_id VARCHAR(50) REFERENCES reservoirs(reservoir_id),
    depth_m NUMERIC(8,2) NOT NULL,
    pump_depth_m NUMERIC(8,2) NOT NULL,
    tubing_id_mm NUMERIC(6,2) NOT NULL,
    casing_id_mm NUMERIC(6,2) NOT NULL,
    active_cycle_number INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'ACTIVE_PRODUCTION',
    data_source_mode VARCHAR(30) DEFAULT 'SIMULATION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS well_completion (
    completion_id VARCHAR(50) PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    tubing_od_in NUMERIC(4,2),
    casing_od_in NUMERIC(4,2),
    perforation_top_m NUMERIC(8,2),
    perforation_bottom_m NUMERIC(8,2),
    sand_control_type VARCHAR(50),
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry (
    telemetry_id BIGSERIAL PRIMARY KEY,
    time TIMESTAMP NOT NULL,
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

CREATE TABLE IF NOT EXISTS css_cycles (
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
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS steam_injection (
    injection_id BIGSERIAL PRIMARY KEY,
    cycle_id VARCHAR(60) REFERENCES css_cycles(cycle_id),
    injection_day INT NOT NULL,
    daily_steam_tons NUMERIC(8,2),
    wellhead_temp_c NUMERIC(6,2),
    wellhead_pressure_bar NUMERIC(6,2),
    steam_quality NUMERIC(4,3)
);

CREATE TABLE IF NOT EXISTS srp_operations (
    operation_id BIGSERIAL PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    spm NUMERIC(5,2) NOT NULL,
    stroke_length_m NUMERIC(4,2) NOT NULL,
    vfd_frequency_hz NUMERIC(5,2) NOT NULL,
    mode VARCHAR(30) DEFAULT 'THERMAL_TRACKING'
);

CREATE TABLE IF NOT EXISTS production_history (
    record_id BIGSERIAL PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    production_date DATE NOT NULL,
    oil_bpd NUMERIC(8,2) NOT NULL,
    water_bpd NUMERIC(8,2),
    gas_mscfd NUMERIC(8,2),
    hours_on_stream NUMERIC(4,2) DEFAULT 24.0
);

CREATE TABLE IF NOT EXISTS failure_events (
    event_id BIGSERIAL PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failure_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    workover_required BOOLEAN DEFAULT FALSE,
    estimated_cost_inr NUMERIC(12,2)
);

CREATE TABLE IF NOT EXISTS model_versions (
    model_version_id VARCHAR(50) PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version_string VARCHAR(30) NOT NULL,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    training_dataset VARCHAR(255),
    mae NUMERIC(6,3),
    rmse NUMERIC(6,3),
    status VARCHAR(30) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id BIGSERIAL PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    model_version_id VARCHAR(50) REFERENCES model_versions(model_version_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    horizon_days INT NOT NULL,
    predicted_production_bpd NUMERIC(8,2),
    lower_95_bpd NUMERIC(8,2),
    upper_95_bpd NUMERIC(8,2),
    confidence_level VARCHAR(20) DEFAULT 'HIGH'
);

CREATE TABLE IF NOT EXISTS anomalies (
    anomaly_id BIGSERIAL PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anomaly_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    anomaly_score NUMERIC(6,4),
    root_cause TEXT
);

CREATE TABLE IF NOT EXISTS scenarios (
    scenario_id VARCHAR(60) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    created_by VARCHAR(50) REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    steam_volume_tons NUMERIC(8,2),
    soak_days NUMERIC(4,1),
    spm NUMERIC(5,2),
    stroke_length_m NUMERIC(4,2),
    simulated_production_bpd NUMERIC(8,2),
    simulated_sor NUMERIC(6,2),
    simulated_risk NUMERIC(5,4),
    is_feasible BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS optimization_runs (
    run_id VARCHAR(60) PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    algorithm VARCHAR(100) NOT NULL,
    weight_prod NUMERIC(4,3),
    weight_sor NUMERIC(4,3),
    weight_energy NUMERIC(4,3),
    weight_risk NUMERIC(4,3),
    status VARCHAR(30) DEFAULT 'CONVERGED'
);

CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id VARCHAR(60) PRIMARY KEY,
    run_id VARCHAR(60) REFERENCES optimization_runs(run_id),
    well_id VARCHAR(50) REFERENCES wells(well_id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recommended_spm NUMERIC(5,2),
    recommended_stroke_m NUMERIC(4,2),
    recommended_vfd_hz NUMERIC(5,2),
    recommended_steam_tons NUMERIC(8,2),
    recommended_soak_days NUMERIC(4,1),
    expected_prod_change_pct NUMERIC(5,2),
    expected_sor_change_pct NUMERIC(5,2),
    expected_energy_change_pct NUMERIC(5,2),
    expected_risk_change_pct NUMERIC(5,2),
    confidence_pct NUMERIC(5,2),
    rationale TEXT,
    approval_status VARCHAR(30) DEFAULT 'PENDING_REVIEW',
    reviewed_by VARCHAR(50),
    reviewed_at TIMESTAMP,
    audit_notes TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    well_id VARCHAR(50),
    request_ip VARCHAR(50),
    details TEXT
);

CREATE TABLE IF NOT EXISTS agent_sessions (
    session_id VARCHAR(60) PRIMARY KEY,
    well_id VARCHAR(50) REFERENCES wells(well_id),
    user_id VARCHAR(50) REFERENCES users(user_id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    query_count INT DEFAULT 0
);
