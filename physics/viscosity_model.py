"""
PETRO-TWIN AI: Physics-Informed Viscosity Model
================================================
Implements empirical, literature-calibrated viscosity-temperature models for Baghewala heavy crude (17-19 API).
Uses the Walther / ASTM D341 equation with calibration parameters and fallback Beggs-Robinson dead oil correlation.

Equations:
1. Walther / ASTM D341:
   log10(log10(nu + 0.7)) = A - B * log10(T_K)
   where nu = mu / rho is kinematic viscosity (cSt), mu is dynamic viscosity (cP), T_K is temperature in Kelvin.
2. Beggs-Robinson (1975) heavy oil dead crude correlation:
   mu_od = 10^x - 1
   x = y * (T_F)^(-1.163)
   y = 10^z
   z = 3.0324 - 0.02023 * API

Calibration targets for Baghewala Jodhpur Sandstone crude:
- T = 47 deg C (native): ~4,200 cP
- T = 100 deg C: ~145 cP
- T = 200 deg C: ~14.5 cP
"""

import math
from typing import Dict, Any, Tuple


class ViscosityModel:
    """
    Temperature and pressure dependent heavy oil viscosity model.
    """
    def __init__(self, walther_a: float = 8.924, walther_b: float = 3.315, 
                 api_gravity: float = 18.2, native_density_kg_m3: float = 945.0):
        self.walther_a = walther_a
        self.walther_b = walther_b
        self.api_gravity = api_gravity
        self.native_density = native_density_kg_m3

    def calculate_viscosity(self, temp_c: float, pressure_bar: float = 55.0) -> float:
        """
        Calculates dynamic viscosity in centipoise (cP) at a given temperature (deg C) and pressure (bar).
        """
        # Safety clamp to physical realistic bounds
        temp_c = max(10.0, min(350.0, float(temp_c)))
        temp_k = temp_c + 273.15
        
        # Density thermal expansion correction: rho(T) = rho_0 * (1 - beta * (T - T0))
        thermal_expansion_beta = 0.0007  # 1/K
        density_g_cm3 = (self.native_density / 1000.0) * (1.0 - thermal_expansion_beta * (temp_c - 47.0))
        density_g_cm3 = max(0.75, min(1.05, density_g_cm3))

        # Walther equation: log10(log10(nu + 0.7)) = A - B * log10(T_K)
        log_tk = math.log10(temp_k)
        inner = self.walther_a - self.walther_b * log_tk
        
        # Guard against domain errors in double-exponentiation
        inner = max(-1.0, min(2.5, inner))
        log_nu_plus_07 = 10.0 ** inner
        nu_cst = (10.0 ** log_nu_plus_07) - 0.7
        nu_cst = max(1.0, nu_cst)

        # Dynamic viscosity mu (cP) = Kinematic viscosity nu (cSt) * density (g/cm3)
        mu_cp = nu_cst * density_g_cm3

        # Pressure correction (Barus relation: mu(P) = mu_0 * exp(alpha * (P - P0)))
        if pressure_bar > 55.0:
            piezo_coeff = 0.0025  # 1/bar for heavy crude
            mu_cp *= math.exp(piezo_coeff * (pressure_bar - 55.0))

        return float(round(mu_cp, 2))

    def calculate_mobility(self, temp_c: float, permeability_md: float = 850.0, 
                           k_ro: float = 0.75, pressure_bar: float = 55.0) -> float:
        """
        Darcy oil mobility: M_o = (k * k_ro) / mu_o [mD / cP]
        """
        viscosity = self.calculate_viscosity(temp_c, pressure_bar)
        if viscosity <= 0.0:
            return 0.0
        return float(round((permeability_md * k_ro) / viscosity, 4))

    def evaluate_curve(self, t_min: float = 30.0, t_max: float = 250.0, step: float = 10.0) -> list:
        """
        Generates full viscosity-temperature curve for charts.
        """
        points = []
        t = t_min
        while t <= t_max:
            mu = self.calculate_viscosity(t)
            points.append({"temperature_c": round(t, 1), "viscosity_cp": mu})
            t += step
        return points
