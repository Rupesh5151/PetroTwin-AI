// PETRO-TWIN AI: Core Data Models & TypeScript Types

export type WellId = 'BW-DEMO-001' | 'BW-DEMO-002' | 'BW-DEMO-003';

export interface WellSummary {
  well_id: string;
  name: string;
  depth_m: number;
  pump_depth_m: number;
  cycle_number: number;
  days_in_production: number;
  status: string;
}

export interface TelemetryFrame {
  timestamp: string;
  well_id: string;
  data_source_mode: string;
  scientific_honesty_disclaimer: string;
  cycle_info: {
    cycle_number: number;
    days_in_production: number;
    steam_injected_tons: number;
    soak_days: number;
    sor_cumulative: number;
  };
  thermal_state: {
    reservoir_temperature_c: number;
    peak_cycle_temperature_c: number;
    cooling_rate_deg_per_week: number;
  };
  fluid_state: {
    estimated_viscosity_cp: number;
    darcy_mobility_md_cp: number;
    oil_density_kg_m3: number;
  };
  production_state: {
    oil_rate_bpd: number;
    water_rate_bpd: number;
    cumulative_oil_bbl: number;
    pump_volumetric_efficiency_pct: number;
  };
  srp_operating_state: {
    spm: number;
    stroke_length_m: number;
    vfd_frequency_hz: number;
    pprl_lbs: number;
    mprl_lbs: number;
    motor_power_kw: number;
    kwh_per_barrel: number;
    rod_floating_detected: boolean;
    rod_floating_risk: number;
    impact_loading_risk: number;
  };
  pressure_state: {
    bottomhole_pressure_bar: number;
    wellhead_pressure_bar: number;
  };
  wellbore_profile_summary: Array<{
    depth_m: number;
    temperature_c: number;
    pressure_bar: number;
    viscosity_cp: number;
  }>;
  data_quality_score: string;
}

export interface DynoCardPoint {
  crank_angle_deg: number;
  position_in: number;
  position_m: number;
  surface_load_lbs: number;
  downhole_load_lbs: number;
}

export interface DynoCardData {
  well_id: string;
  stroke_length_m: number;
  spm: number;
  viscosity_cp: number;
  rod_floating_detected: boolean;
  card_points: DynoCardPoint[];
}

export interface ProductionForecast {
  model_name: string;
  model_version: string;
  training_dataset: string;
  current_viscosity_cp: number;
  physics_baseline_bpd: number;
  ml_residual_bpd: number;
  forecast_horizons: {
    t_plus_1: { day: number; prediction_bpd: number; lower_95_bpd: number; upper_95_bpd: number; uncertainty_pct: number };
    t_plus_7: { day: number; prediction_bpd: number; lower_95_bpd: number; upper_95_bpd: number; uncertainty_pct: number };
    t_plus_30: { day: number; prediction_bpd: number; lower_95_bpd: number; upper_95_bpd: number; uncertainty_pct: number };
  };
  data_quality: string;
  confidence: string;
}

export interface FailureIntelligence {
  model_version: string;
  overall_health_score: number;
  current_viscosity_cp: number;
  risks: {
    rod_floating: { probability: number; level: string; is_active_threat: boolean };
    impact_loading: { probability: number; level: string; is_active_threat: boolean };
    parted_rod: { probability: number; level: string; is_active_threat: boolean };
    pump_unseating: { probability: number; level: string; is_active_threat: boolean };
  };
  mechanical_loads: {
    pprl_lbs: number;
    mprl_lbs: number;
    viscous_drag_lbf: number;
    net_downstroke_force_lbs: number;
  };
  feature_attribution_shap: Array<{
    feature: string;
    contribution_pct: number;
  }>;
  proactive_action_recommended: boolean;
  recommended_action: string;
}

export interface ParetoPoint {
  production_bpd: number;
  sor: number;
  energy_kwh_bbl: number;
  failure_risk: number;
  spm: number;
  stroke_m: number;
  steam_tons: number;
  composite_score: number;
}

export interface OptimizationResult {
  status: string;
  algorithm: string;
  recommended_plan: {
    css: {
      steam_volume_tons: number;
      soak_time_days: number;
      injection_pressure_bar: number;
      target_cutoff_days: number;
    };
    srp: {
      stroke_length_m: number;
      spm: number;
      vfd_frequency_hz: number;
      operating_mode: string;
    };
  };
  expected_outcome: {
    production_bpd: number;
    production_change_pct: number;
    sor: number;
    sor_change_pct: number;
    energy_kwh_bbl: number;
    energy_change_pct: number;
    failure_risk: number;
    failure_risk_change_pct: number;
    confidence_pct: number;
  };
  constraint_verification: Record<string, string>;
  pareto_frontier: ParetoPoint[];
  rejected_alternatives_sample: Array<{
    spm: number;
    stroke_m: number;
    steam_tons: number;
    production_bpd: number;
    rejection_reason: string;
  }>;
  decision_support_disclaimer: string;
}
