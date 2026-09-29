"""
PETRO-TWIN AI: Correlated Telemetry & Physics Simulator
========================================================
Generates physically correlated telemetry streams adhering strictly to the
SIH26120 Data Honesty mandate:
WATERMARK: "SIMULATED / SYNTHETIC - NOT OIL INDIA FIELD DATA"

Thermodynamic & Mechanical Coupling:
Steam Cycle Injected -> Reservoir Temp Rises -> Viscosity Drops -> Darcy Inflow Surges ->
Production Rises -> Time Passes -> Conduction & Fluid Withdrawal Cool Reservoir ->
Viscosity Spikes -> Annular Drag Multiplies -> Polished Rod Loads Distort ->
Rod Floating & Impact Pounding Hazards Elevate.
"""

import math
import random
import time
from typing import Dict, Any, List

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from physics.viscosity_model import ViscosityModel
from physics.thermal_model import ThermalModel
from physics.srp_model import SRPModel
from physics.wellbore_model import WellboreModel


class TelemetrySimulator:
    """
    Correlated time-series and real-time telemetry generator for Baghewala Field demo wells.
    """
    def __init__(self):
        self.visc_model = ViscosityModel()
        self.thermal_model = ThermalModel()
        self.srp_model = SRPModel()
        self.wellbore_model = WellboreModel(viscosity_model=self.visc_model)

        # Well states
        self.wells_state = {
            "BW-DEMO-001": {
                "name": "Baghewala Demo Well 001",
                "depth_m": 950.0,
                "pump_depth_m": 900.0,
                "cycle_number": 3,
                "steam_injected_tons": 2400.0,
                "soak_days": 6.0,
                "peak_temperature_c": 192.0,
                "days_in_production": 68,  # Mid-to-late cycle (cooling in progress)
                "spm": 6.8,
                "stroke_length_m": 2.4,
                "vfd_hz": 44.0,
                "bottomhole_pressure_bar": 52.0,
                "wellhead_pressure_bar": 4.5,
                "cumulative_oil_bbl": 7450.0,
                "sor": 3.8
            },
            "BW-DEMO-002": {
                "name": "Baghewala Demo Well 002 (Early Flush Cycle)",
                "depth_m": 960.0,
                "pump_depth_m": 910.0,
                "cycle_number": 4,
                "steam_injected_tons": 2800.0,
                "soak_days": 7.0,
                "peak_temperature_c": 215.0,
                "days_in_production": 14,  # Early cycle (hot, high production)
                "spm": 7.2,
                "stroke_length_m": 2.6,
                "vfd_hz": 46.5,
                "bottomhole_pressure_bar": 58.0,
                "wellhead_pressure_bar": 6.2,
                "cumulative_oil_bbl": 2450.0,
                "sor": 2.6
            },
            "BW-DEMO-003": {
                "name": "Baghewala Demo Well 003 (Critical Cooling Stage)",
                "depth_m": 940.0,
                "pump_depth_m": 890.0,
                "cycle_number": 2,
                "steam_injected_tons": 2100.0,
                "soak_days": 5.0,
                "peak_temperature_c": 178.0,
                "days_in_production": 105,  # Late cycle (cold, severe rod float threat)
                "spm": 7.8,  # Dangerously high for late cycle
                "stroke_length_m": 2.4,
                "vfd_hz": 50.4,
                "bottomhole_pressure_bar": 44.0,
                "wellhead_pressure_bar": 3.8,
                "cumulative_oil_bbl": 8800.0,
                "sor": 5.1
            }
        }

    def generate_current_telemetry(self, well_id: str = "BW-DEMO-001") -> Dict[str, Any]:
        """
        Synthesizes a realistic, thermodynamically correlated telemetry frame.
        """
        w = self.wells_state.get(well_id, self.wells_state["BW-DEMO-001"])
        
        # 1. Thermal state at current production day
        day = w["days_in_production"]
        peak_t = w["peak_temperature_c"]
        res_temp_c = self.thermal_model.predict_temperature_at_day(float(day), peak_t)
        
        # Sensor noise (+/- 0.3 C)
        noisy_temp = res_temp_c + random.uniform(-0.35, 0.35)
        
        # 2. Viscosity at this temperature
        viscosity_cp = self.visc_model.calculate_viscosity(noisy_temp, w["bottomhole_pressure_bar"])
        
        # 3. SRP Mechanics and Dynamic Loads
        srp_eval = self.srp_model.evaluate_srp_performance(w["stroke_length_m"], w["spm"], viscosity_cp)
        
        # Production with small random reservoir heterogeneity variance (+/- 1.5%)
        base_prod = srp_eval["estimated_production_bpd"]
        noisy_prod = max(2.0, base_prod * (1.0 + random.uniform(-0.015, 0.015)))
        
        # Motor power and load
        pprl = srp_eval["pprl_lbs"] + random.uniform(-80.0, 80.0)
        mprl = srp_eval["mprl_lbs"] + random.uniform(-40.0, 40.0)
        motor_kw = srp_eval["electrical_power_kw"] + random.uniform(-0.25, 0.25)

        # Wellbore profile
        wellbore = self.wellbore_model.discretize_profile(res_temp_c, w["bottomhole_pressure_bar"])

        return {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "well_id": well_id,
            "data_source_mode": "SIMULATION",
            "scientific_honesty_disclaimer": "SIMULATED / SYNTHETIC - NOT OIL INDIA FIELD DATA",
            "cycle_info": {
                "cycle_number": w["cycle_number"],
                "days_in_production": day,
                "steam_injected_tons": w["steam_injected_tons"],
                "soak_days": w["soak_days"],
                "sor_cumulative": w["sor"]
            },
            "thermal_state": {
                "reservoir_temperature_c": round(noisy_temp, 2),
                "peak_cycle_temperature_c": peak_t,
                "cooling_rate_deg_per_week": round(2.8 * math.exp(-0.015 * day), 2)
            },
            "fluid_state": {
                "estimated_viscosity_cp": round(viscosity_cp, 1),
                "darcy_mobility_md_cp": self.visc_model.calculate_mobility(noisy_temp),
                "oil_density_kg_m3": 945.0
            },
            "production_state": {
                "oil_rate_bpd": round(noisy_prod, 1),
                "water_rate_bpd": round(noisy_prod * 0.35, 1),
                "cumulative_oil_bbl": round(w["cumulative_oil_bbl"], 1),
                "pump_volumetric_efficiency_pct": srp_eval["pump_efficiency_pct"]
            },
            "srp_operating_state": {
                "spm": w["spm"],
                "stroke_length_m": w["stroke_length_m"],
                "vfd_frequency_hz": w["vfd_hz"],
                "pprl_lbs": round(pprl, 1),
                "mprl_lbs": round(mprl, 1),
                "motor_power_kw": round(motor_kw, 2),
                "kwh_per_barrel": srp_eval["kwh_per_barrel"],
                "rod_floating_detected": srp_eval["rod_floating_detected"],
                "rod_floating_risk": srp_eval["rod_floating_risk"],
                "impact_loading_risk": srp_eval["impact_loading_risk"]
            },
            "pressure_state": {
                "bottomhole_pressure_bar": w["bottomhole_pressure_bar"],
                "wellhead_pressure_bar": w["wellhead_pressure_bar"]
            },
            "wellbore_profile_summary": wellbore[::2],  # Sampled points
            "data_quality_score": "GOOD"
        }

    def generate_historical_time_series(self, well_id: str = "BW-DEMO-001", days: int = 90) -> List[Dict[str, Any]]:
        """
        Generates 90-day historical time-series demonstrating progressive thermal decay and risk buildup.
        """
        w = self.wells_state.get(well_id, self.wells_state["BW-DEMO-001"])
        history = []
        peak_t = w["peak_temperature_c"]

        for d in range(1, days + 1):
            t_res = self.thermal_model.predict_temperature_at_day(float(d), peak_t)
            visc = self.visc_model.calculate_viscosity(t_res)
            srp = self.srp_model.evaluate_srp_performance(w["stroke_length_m"], w["spm"], visc)

            history.append({
                "day": d,
                "reservoir_temperature_c": round(t_res, 1),
                "viscosity_cp": round(visc, 1),
                "oil_rate_bpd": round(srp["estimated_production_bpd"] * (1.0 + random.uniform(-0.02, 0.02)), 1),
                "pprl_lbs": round(srp["pprl_lbs"], 0),
                "mprl_lbs": round(srp["mprl_lbs"], 0),
                "rod_floating_risk": srp["rod_floating_risk"],
                "motor_power_kw": round(srp["electrical_power_kw"], 2),
                "rod_floating_flag": srp["rod_floating_detected"]
            })

        return history
