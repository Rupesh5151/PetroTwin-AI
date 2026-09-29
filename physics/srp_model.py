"""
PETRO-TWIN AI: Physics-Informed Sucker Rod Pumping (SRP) Dynamics Model
======================================================================
Implements standard API RP 11L / Gibbs-Neely rod kinematics, dynamic polished rod load calculation,
Couette viscous drag, downstroke net rod acceleration, and dynamometer card synthesis.

Equations & Principles:
1. Angular velocity: omega = 2 * pi * (SPM / 60) [rad/s]
2. Maximum rod velocity: v_max = (S * omega) / 2 [m/s]
3. Maximum rod acceleration: a_max = (S * omega^2) / 2 [m/s^2]
4. Acceleration factor: alpha = (S * SPM^2) / 70500 (API 11L approximation in English units)
5. Weight of rods in air: W_r
   Buoyant weight of rods in fluid: W_rf = W_r * (1 - rho_fluid / rho_steel)
6. Weight of fluid column: W_f = Area_plunger * Depth_pump * rho_fluid * g
7. Peak Polished Rod Load (PPRL):
   PPRL = W_rf + W_f + W_r * (a_max / g) + F_viscous_up
8. Minimum Polished Rod Load (MPRL):
   MPRL = W_rf - W_r * (a_max / g) - F_viscous_down
9. Rod Floating Criterion:
   If F_viscous_down >= W_rf - W_r * (a_max / g), then Net Downstroke Force <= 0.
   The rods float in the viscous oil, leading to slack bridle cables and subsequent impact pounding.
"""

import math
from typing import Dict, Any, List, Tuple


class SRPModel:
    """
    Sucker Rod Pump kinematics, dynamics, and dynamometer simulator.
    """
    def __init__(self,
                 pump_depth_m: float = 900.0,
                 plunger_diameter_mm: float = 57.15,
                 rod_weight_air_n: float = 31200.0,
                 tubing_id_mm: float = 62.0,
                 rod_outer_diameter_mm: float = 22.22,
                 fluid_density_kg_m3: float = 945.0,
                 steel_density_kg_m3: float = 7850.0):
        self.pump_depth_m = pump_depth_m
        self.plunger_diameter_m = plunger_diameter_mm / 1000.0
        self.plunger_area_m2 = (math.pi / 4.0) * (self.plunger_diameter_m ** 2)
        self.w_r = rod_weight_air_n  # Newtons (~7,014 lbf)
        self.tubing_id_m = tubing_id_mm / 1000.0
        self.rod_od_m = rod_outer_diameter_mm / 1000.0
        self.rho_f = fluid_density_kg_m3
        self.rho_s = steel_density_kg_m3

        # Buoyancy factor
        self.buoyancy_factor = 1.0 - (self.rho_f / self.rho_s)
        self.w_rf = self.w_r * self.buoyancy_factor

        # Fluid load on plunger (N)
        self.w_f = self.plunger_area_m2 * self.pump_depth_m * self.rho_f * 9.81

    def calculate_kinematics(self, stroke_length_m: float, spm: float) -> Dict[str, float]:
        """
        Calculates crank kinematics, peak rod velocity, and peak acceleration.
        """
        omega = 2.0 * math.pi * (spm / 60.0)  # rad/s
        v_max = (stroke_length_m * omega) / 2.0  # m/s
        a_max = (stroke_length_m * (omega ** 2)) / 2.0  # m/s2
        dynamic_inertial_n = (self.w_r / 9.81) * a_max
        return {
            "omega_rad_s": round(omega, 3),
            "v_max_m_s": round(v_max, 3),
            "a_max_m_s2": round(a_max, 3),
            "inertial_force_n": round(dynamic_inertial_n, 1)
        }

    def calculate_viscous_drag(self, stroke_length_m: float, spm: float, avg_viscosity_cp: float) -> float:
        """
        Calculates total upward resisting viscous force during downstroke in Newtons:
        Includes Couette shear along the rod string plus viscous throttling through the traveling valve.
        """
        kin = self.calculate_kinematics(stroke_length_m, spm)
        v_avg = (2.0 * stroke_length_m * spm) / 60.0
        r_rod = self.rod_od_m / 2.0
        r_tubing = self.tubing_id_m / 2.0
        
        # Annular Couette shear factor
        geom_factor = (2.0 * math.pi) / math.log(max(1.05, r_tubing / r_rod))
        mu_pa_s = avg_viscosity_cp * 0.001
        
        rod_drag_n = geom_factor * mu_pa_s * v_avg * self.pump_depth_m
        
        # Traveling valve viscous throttling during downstroke:
        # Liquid must squeeze through traveling valve orifice and plunger barrel clearance
        # At high viscosity (cP > 1000), Hagen-Poiseuille resistance across plunger creates severe backpressure
        valve_orifice_radius = 0.015  # 30 mm valve port
        plunger_length = 1.2  # meters
        # Viscous pressure drop across valve / plunger (Pa)
        delta_p_valve = (8.0 * mu_pa_s * plunger_length * v_avg) / (valve_orifice_radius ** 2)
        valve_thrust_n = delta_p_valve * self.plunger_area_m2 * 0.65

        total_resistance_n = rod_drag_n + valve_thrust_n
        return float(round(total_resistance_n, 1))

    def evaluate_srp_performance(self, stroke_length_m: float, spm: float, avg_viscosity_cp: float,
                                 pump_fillage: float = 0.88) -> Dict[str, Any]:
        """
        Comprehensive SRP performance, rod loading, and rod-floating risk calculation.
        """
        kin = self.calculate_kinematics(stroke_length_m, spm)
        drag_n = self.calculate_viscous_drag(stroke_length_m, spm, avg_viscosity_cp)
        inertial_n = kin["inertial_force_n"]

        # Peak Polished Rod Load (Upstroke peak)
        pprl_n = self.w_rf + self.w_f + inertial_n + drag_n
        pprl_lbs = pprl_n * 0.224809

        # Minimum Polished Rod Load (Downstroke trough)
        mprl_n = self.w_rf - inertial_n - drag_n
        mprl_lbs = mprl_n * 0.224809

        # Downstroke Net Accelerating Force on Rod String
        net_downstroke_force_n = self.w_rf - drag_n - inertial_n
        net_downstroke_force_lbs = net_downstroke_force_n * 0.224809

        # In an SRP rod string, rods cannot withstand compressive thrust without buckling.
        # Downward motion at the pump is driven primarily by the bottom sinker bars (~28-30% of string weight),
        # while the upper rod string experiences high annular Couette drag.
        effective_sinking_weight_n = self.w_rf * 0.30  # Sinker bar gravitational pulling capacity
        sinking_force_margin_n = effective_sinking_weight_n - (drag_n * 0.5 + inertial_n)
        sinking_margin_lbs = sinking_force_margin_n * 0.224809

        # Terminal velocity of bottom rod assembly through viscous fluid
        v_avg = (2.0 * stroke_length_m * spm) / 60.0
        drag_per_velocity = drag_n / max(0.001, v_avg)
        v_terminal_m_s = effective_sinking_weight_n / max(1.0, drag_per_velocity * 0.5)
        
        velocity_ratio = kin["v_max_m_s"] / max(0.05, v_terminal_m_s)
        
        # Rod float risk: logistic curve based on velocity ratio and sinking margin
        rod_float_risk = 1.0 / (1.0 + math.exp(-6.5 * (velocity_ratio - 0.75)))
        rod_float_risk = float(round(max(0.01, min(0.99, rod_float_risk)), 3))
        rod_floating_flag = (velocity_ratio >= 0.80) or (sinking_margin_lbs < 200.0)

        # Impact loading risk directly correlates with rod float severity and shock acceleration
        impact_load_risk = float(round(min(1.0, rod_float_risk * 1.12), 3))

        # Pump displacement: V = Plunger_Area * Stroke * SPM * 1440 min/day (m3/day -> bbl/day)
        disp_m3_day = self.plunger_area_m2 * stroke_length_m * spm * 1440.0
        disp_bbl_day = disp_m3_day * 6.28981
        
        # Volumetric pump efficiency drops with high fluid viscosity due to valve lag and slippage
        visc_penalty = max(0.55, 1.0 - 0.000045 * avg_viscosity_cp)
        effective_fillage = min(1.0, pump_fillage * visc_penalty)
        estimated_production_bbl = disp_bbl_day * effective_fillage
        pump_efficiency_pct = effective_fillage * 100.0

        # Power estimation
        hydraulic_power_kw = (disp_m3_day * self.rho_f * 9.81 * self.pump_depth_m) / (86400.0 * 1000.0)
        # Total mechanical shaft power including friction & rod drag
        mechanical_power_kw = hydraulic_power_kw + (drag_n * kin["v_max_m_s"]) / 1000.0
        motor_efficiency = 0.82
        electrical_power_kw = mechanical_power_kw / motor_efficiency
        kwh_per_barrel = (electrical_power_kw * 24.0) / max(1.0, estimated_production_bbl)

        return {
            "stroke_length_m": stroke_length_m,
            "spm": spm,
            "v_max_m_s": kin["v_max_m_s"],
            "pprl_lbs": round(pprl_lbs, 1),
            "mprl_lbs": round(mprl_lbs, 1),
            "net_downstroke_force_lbs": round(net_downstroke_force_lbs, 1),
            "viscous_drag_lbf": round(drag_n * 0.224809, 1),
            "rod_floating_detected": rod_floating_flag,
            "rod_floating_risk": round(rod_float_risk, 3),
            "impact_loading_risk": impact_load_risk,
            "theoretical_displacement_bpd": round(disp_bbl_day, 1),
            "estimated_production_bpd": round(estimated_production_bbl, 1),
            "pump_efficiency_pct": round(pump_efficiency_pct, 1),
            "electrical_power_kw": round(electrical_power_kw, 2),
            "kwh_per_barrel": round(kwh_per_barrel, 2),
            "gearbox_peak_torque_in_lbs": round(pprl_lbs * (stroke_length_m * 39.3701 / 2.0) * 0.95, 0)
        }

    def generate_dynamometer_card(self, stroke_length_m: float, spm: float, avg_viscosity_cp: float,
                                  num_points: int = 40) -> List[Dict[str, Any]]:
        """
        Synthesizes a realistic surface and downhole dynamometer card (Load vs Position).
        Models valve opening/closing delays and viscous drag hysteresis.
        """
        perf = self.evaluate_srp_performance(stroke_length_m, spm, avg_viscosity_cp)
        pprl = perf["pprl_lbs"]
        mprl = perf["mprl_lbs"]
        drag_lbs = perf["viscous_drag_lbf"]
        is_floating = perf["rod_floating_detected"]

        card_points = []
        for i in range(num_points):
            theta = (2.0 * math.pi * i) / num_points  # crank angle in radians
            
            # Position: 0 at bottom of stroke, stroke_length at top of stroke
            # Surface position via simple harmonic motion approximation
            pos_m = (stroke_length_m / 2.0) * (1.0 - math.cos(theta))
            pos_in = pos_m * 39.3701

            # Upstroke is theta from 0 to pi; Downstroke is theta from pi to 2pi
            if theta <= math.pi:
                # UPSTROKE: Traveling valve closed, standing valve open, carrying fluid load
                # Load builds rapidly at bottom of stroke (SV opens, TV closes)
                fill_phase = min(1.0, theta / 0.5)
                surface_load = mprl + (pprl - mprl) * fill_phase + 0.15 * drag_lbs * math.sin(theta)
                downhole_load = (self.w_rf * 0.224809) + (self.w_f * 0.224809) * fill_phase
            else:
                # DOWNSTROKE: TV open, SV closed, rod falling through viscous fluid
                down_phase = min(1.0, (theta - math.pi) / 0.5)
                if is_floating:
                    # Rod floating distortion: load plummets near bottom, followed by sharp spike near turnaround
                    surface_load = mprl - drag_lbs * 0.6
                    if theta > 1.8 * math.pi:
                        # Impact pounding shock spike as unit catches floating rod
                        surface_load += (pprl * 0.45) * ((theta - 1.8 * math.pi) / (0.2 * math.pi))
                else:
                    surface_load = pprl - (pprl - mprl) * down_phase - 0.12 * drag_lbs * math.sin(theta - math.pi)
                
                downhole_load = self.w_rf * 0.224809 - (self.w_f * 0.224809) * (1.0 - down_phase)

            card_points.append({
                "crank_angle_deg": round(math.degrees(theta), 1),
                "position_in": round(pos_in, 2),
                "position_m": round(pos_m, 3),
                "surface_load_lbs": round(max(200.0, surface_load), 1),
                "downhole_load_lbs": round(max(100.0, downhole_load), 1)
            })

        return card_points
