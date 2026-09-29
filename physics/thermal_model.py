"""
PETRO-TWIN AI: Physics-Informed Thermal Decay & Heat Balance Model
==================================================================
Models reservoir thermodynamic heating and progressive cooling during Cyclic Steam Stimulation (CSS).
Based on Marx-Langenheim thermal balance, sensible/latent heat distribution, and post-soak conductive/convective dissipation.

Key Formulation:
1. Total Heat Injected:
   Q_inj = M_steam * [C_w * (T_steam - T_native) + x_steam * L_v]  [kJ]
2. Heated Zone Radius & Initial Temperature Post-Soak:
   Delta_T_initial = (Q_inj * thermal_efficiency) / (pi * R_h^2 * h * rho_Cp_bulk)
   T_peak = min(T_steam - 15.0, T_native + Delta_T_initial)
3. Production Cooling Curve:
   T_res(t) = T_native + (T_peak - T_native) * exp(-lambda_eff * t) - alpha_prod * N_p(t)
"""

import math
from typing import Dict, Any, List


class ThermalModel:
    """
    Thermodynamic CSS heating and thermal decay model.
    """
    def __init__(self,
                 native_temp_c: float = 47.0,
                 steam_temp_c: float = 295.0,
                 steam_quality: float = 0.78,
                 latent_heat_kj_kg: float = 1420.0,
                 water_cp_kj_kg_k: float = 4.184,
                 formation_thickness_m: float = 18.0,
                 porosity: float = 0.26,
                 rock_density_kg_m3: float = 2450.0,
                 rock_cp_kj_kg_k: float = 0.92,
                 conduction_decay_rate: float = 0.0135):
        self.native_temp = native_temp_c
        self.steam_temp = steam_temp_c
        self.steam_quality = steam_quality
        self.latent_heat = latent_heat_kj_kg
        self.water_cp = water_cp_kj_kg_k
        self.h = formation_thickness_m
        self.porosity = porosity
        self.rock_density = rock_density_kg_m3
        self.rock_cp = rock_cp_kj_kg_k
        self.lambda_cond = conduction_decay_rate

        # Volumetric heat capacity of saturated porous medium (kJ / m3 / K)
        oil_cp = 2.1
        oil_density = 945.0
        bulk_rock_matrix = (1.0 - self.porosity) * self.rock_density * self.rock_cp
        bulk_fluid_matrix = self.porosity * oil_density * oil_cp
        self.bulk_volumetric_cp = bulk_rock_matrix + bulk_fluid_matrix  # ~2,500 kJ/m3/K

    def calculate_injection_heat(self, steam_mass_tons: float, steam_quality: float = None) -> float:
        """
        Total enthalpy injected (kJ).
        """
        q_steam = self.steam_quality if steam_quality is None else steam_quality
        m_kg = steam_mass_tons * 1000.0
        sensible_heat = self.water_cp * (self.steam_temp - self.native_temp)
        latent_contrib = q_steam * self.latent_heat
        h_total_per_kg = sensible_heat + latent_contrib
        return m_kg * h_total_per_kg

    def calculate_peak_temperature(self, steam_mass_tons: float, soak_days: float, 
                                  thermal_efficiency: float = 0.72) -> Dict[str, float]:
        """
        Estimates peak reservoir temperature and effective heated radius post-soaking.
        """
        q_total_kj = self.calculate_injection_heat(steam_mass_tons)
        # Soaking thermal losses to overburden/underburden during soak period
        soak_retention = math.exp(-0.012 * soak_days)
        q_retained_kj = q_total_kj * thermal_efficiency * soak_retention

        # Effective heated zone radius (approx 15-35 meters depending on volume)
        # Assuming average temperature rise inside thermal radius
        target_delta_t = (self.steam_temp - self.native_temp) * 0.75
        heated_volume_m3 = q_retained_kj / (self.bulk_volumetric_cp * target_delta_t)
        heated_radius_m = math.sqrt(max(4.0, heated_volume_m3 / (math.pi * self.h)))
        heated_radius_m = min(45.0, heated_radius_m)

        peak_t = self.native_temp + (q_retained_kj / (math.pi * (heated_radius_m**2) * self.h * self.bulk_volumetric_cp))
        peak_t = min(self.steam_temp - 25.0, max(self.native_temp + 15.0, peak_t))

        return {
            "peak_temperature_c": float(round(peak_t, 2)),
            "heated_radius_m": float(round(heated_radius_m, 2)),
            "total_heat_injected_gj": float(round(q_total_kj / 1e6, 2)),
            "heat_retained_post_soak_gj": float(round(q_retained_kj / 1e6, 2))
        }

    def predict_temperature_at_day(self, day_in_production: float, peak_temp_c: float,
                                   avg_daily_prod_bbl: float = 90.0) -> float:
        """
        Predicts reservoir temperature at a given day of the production phase.
        Accounts for conduction loss to formation boundaries and fluid enthalpy withdrawal.
        """
        if day_in_production <= 0:
            return peak_temp_c

        # Convective cooling from fluid production (cold fluid replacement)
        convection_rate = 0.00008 * avg_daily_prod_bbl
        eff_lambda = self.lambda_cond + convection_rate

        delta_t = (peak_temp_c - self.native_temp) * math.exp(-eff_lambda * day_in_production)
        predicted_t = self.native_temp + delta_t

        return float(round(max(self.native_temp, predicted_t), 2))

    def generate_cooling_curve(self, peak_temp_c: float, max_days: int = 180, step_days: int = 5) -> List[Dict[str, Any]]:
        """
        Generates simulated time-series cooling curve for Digital Twin time machine.
        """
        curve = []
        for day in range(0, max_days + 1, step_days):
            t_res = self.predict_temperature_at_day(float(day), peak_temp_c)
            curve.append({
                "day": day,
                "reservoir_temperature_c": t_res,
                "thermal_decay_fraction": round(1.0 - (t_res - self.native_temp) / (peak_temp_c - self.native_temp + 1e-5), 3)
            })
        return curve
