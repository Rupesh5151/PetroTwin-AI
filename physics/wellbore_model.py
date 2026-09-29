"""
PETRO-TWIN AI: Physics-Informed Wellbore Discretization Model
============================================================
Discretizes the 950-meter wellbore into depth segments to calculate:
- Temperature profile T(z)
- Hydrostatic & frictional pressure profile P(z)
- Dynamic viscosity profile mu(z)
- Segmental rod viscous shear drag
"""

import math
from typing import List, Dict, Any
from .viscosity_model import ViscosityModel


class WellboreModel:
    """
    1D discretized wellbore temperature and pressure hydraulics simulator.
    """
    def __init__(self,
                 total_depth_m: float = 950.0,
                 pump_depth_m: float = 900.0,
                 tubing_id_mm: float = 62.0,
                 casing_id_mm: float = 152.4,
                 surface_ambient_temp_c: float = 32.0,
                 viscosity_model: ViscosityModel = None):
        self.td = total_depth_m
        self.pump_depth = pump_depth_m
        self.tubing_id = tubing_id_mm / 1000.0  # meters
        self.casing_id = casing_id_mm / 1000.0
        self.t_ambient_surf = surface_ambient_temp_c
        self.visc_model = viscosity_model or ViscosityModel()

    def discretize_profile(self, bottomhole_temp_c: float, bottomhole_pressure_bar: float = 45.0,
                           wellhead_backpressure_bar: float = 4.0, num_segments: int = 10) -> List[Dict[str, Any]]:
        """
        Calculates depth-dependent thermodynamic and hydraulic conditions.
        """
        dz = self.td / float(num_segments)
        profile = []

        for i in range(num_segments + 1):
            depth_m = i * dz
            # Hasan-Kabir wellbore heat loss approximation during upward fluid flow
            # Surface fluid is cooler due to ambient heat loss through casing and desert soil
            depth_fraction = depth_m / self.td
            # Non-linear thermal gradient: fluid cools more rapidly near surface
            temp_c = self.t_ambient_surf + (bottomhole_temp_c - self.t_ambient_surf) * (depth_fraction ** 0.65)
            
            # Hydrostatic pressure gradient with depth
            press_bar = wellhead_backpressure_bar + (bottomhole_pressure_bar - wellhead_backpressure_bar) * depth_fraction
            
            # Local fluid viscosity at depth
            visc_cp = self.visc_model.calculate_viscosity(temp_c, press_bar)
            
            # Local density (kg/m3)
            density = 945.0 * (1.0 - 0.0007 * (temp_c - 47.0))

            profile.append({
                "segment_index": i,
                "depth_m": round(depth_m, 1),
                "temperature_c": round(temp_c, 2),
                "pressure_bar": round(press_bar, 2),
                "viscosity_cp": round(visc_cp, 1),
                "density_kg_m3": round(density, 1),
                "is_pump_zone": abs(depth_m - self.pump_depth) <= (dz / 2.0)
            })

        return profile

    def calculate_integrated_viscous_drag(self, profile: List[Dict[str, Any]], rod_diameter_mm: float,
                                         rod_velocity_m_s: float) -> float:
        """
        Integrates Couette flow viscous shear force across all wellbore segments.
        F_drag = integral( [2 * pi * mu * v] / ln(r_tubing / r_rod) ) dz
        """
        r_rod = (rod_diameter_mm / 1000.0) / 2.0
        r_tubing = self.tubing_id / 2.0
        geom_factor = (2.0 * math.pi) / math.log(r_tubing / r_rod)

        total_drag_n = 0.0
        for i in range(len(profile) - 1):
            seg1 = profile[i]
            seg2 = profile[i + 1]
            seg_dz = seg2["depth_m"] - seg1["depth_m"]
            
            # Average dynamic viscosity in segment in Pa.s (1 cP = 0.001 Pa.s)
            avg_mu_pa_s = ((seg1["viscosity_cp"] + seg2["viscosity_cp"]) / 2.0) * 0.001
            
            # Viscous shear force on moving rod: F = geom_factor * mu * v * dz
            seg_drag = geom_factor * avg_mu_pa_s * abs(rod_velocity_m_s) * seg_dz
            total_drag_n += seg_drag

        return float(round(total_drag_n, 2))
