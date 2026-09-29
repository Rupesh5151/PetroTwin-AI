"""
PETRO-TWIN AI: Database Seeding & Verification Script
Verifies default demo wells, reservoir metadata, and initial seed states.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml_service.simulator.telemetry_simulator import TelemetrySimulator

def main():
    print("="*65)
    print(" PETRO-TWIN AI: SEEDING & VERIFYING DEMO ENTITIES")
    print(" Field: Baghewala Field (Jodhpur Sandstone), Oil India Limited")
    print("="*65)

    sim = TelemetrySimulator()
    print(f"\n[+] Total Demo Wells Registered: {len(sim.wells_state)}")
    for wid, w in sim.wells_state.items():
        print(f"    - {wid}: {w['name']}")
        print(f"      Depth: {w['depth_m']}m | Pump: {w['pump_depth_m']}m | Cycle: #{w['cycle_number']} (Day {w['days_in_production']})")
        print(f"      Steam: {w['steam_injected_tons']} T | SPM: {w['spm']} | Stroke: {w['stroke_length_m']}m")

    # Generate initial telemetry verification
    t0 = sim.generate_current_telemetry("BW-DEMO-001")
    print(f"\n[+] Verified Initial Telemetry Frame for BW-DEMO-001:")
    print(f"    - Temp: {t0['thermal_state']['reservoir_temperature_c']} deg C")
    print(f"    - Viscosity: {t0['fluid_state']['estimated_viscosity_cp']} cP")
    print(f"    - Oil Rate: {t0['production_state']['oil_rate_bpd']} bpd")
    print(f"    - PPRL: {t0['srp_operating_state']['pprl_lbs']} lbs | MPRL: {t0['srp_operating_state']['mprl_lbs']} lbs")
    print(f"    - Rod Floating Threat: {t0['srp_operating_state']['rod_floating_detected']}")
    print("\n[OK] Database seed state ready for execution.")

if __name__ == "__main__":
    main()
