"""
Unit tests for PETRO-TWIN AI Physics Modules
"""

import unittest
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from physics.viscosity_model import ViscosityModel
from physics.thermal_model import ThermalModel
from physics.wellbore_model import WellboreModel
from physics.srp_model import SRPModel


class TestPhysicsModels(unittest.TestCase):
    def setUp(self):
        self.visc_model = ViscosityModel()
        self.thermal_model = ThermalModel()
        self.wellbore_model = WellboreModel(viscosity_model=self.visc_model)
        self.srp_model = SRPModel()

    def test_viscosity_temperature_inversion(self):
        """Viscosity must drop exponentially as temperature rises."""
        v_47 = self.visc_model.calculate_viscosity(47.0)
        v_100 = self.visc_model.calculate_viscosity(100.0)
        v_200 = self.visc_model.calculate_viscosity(200.0)

        self.assertGreater(v_47, 1000.0, "Native viscosity at 47C should exceed 1,000 cP")
        self.assertLess(v_100, 350.0, "Viscosity at 100C should be well below 350 cP")
        self.assertLess(v_200, 30.0, "Viscosity at 200C should be well below 30 cP")
        self.assertGreater(v_47, v_100, "Higher temp must yield lower viscosity")
        self.assertGreater(v_100, v_200, "Higher temp must yield lower viscosity")

    def test_thermal_injection_and_decay(self):
        """Thermal model must calculate realistic peak temperature and monotone cooling."""
        res = self.thermal_model.calculate_peak_temperature(steam_mass_tons=2500.0, soak_days=6.0)
        peak_t = res["peak_temperature_c"]
        self.assertGreater(peak_t, 120.0, "Peak post-soak temp must exceed 120C")
        self.assertLessEqual(peak_t, 280.0, "Peak temp must not exceed steam ceiling")

        day_10 = self.thermal_model.predict_temperature_at_day(10.0, peak_t)
        day_60 = self.thermal_model.predict_temperature_at_day(60.0, peak_t)
        day_120 = self.thermal_model.predict_temperature_at_day(120.0, peak_t)

        self.assertGreater(peak_t, day_10)
        self.assertGreater(day_10, day_60)
        self.assertGreater(day_60, day_120)
        self.assertGreaterEqual(day_120, 47.0, "Cooling should not drop below native reservoir temp")

    def test_wellbore_discretization(self):
        """Wellbore model must yield multi-segment profile with increasing temp and pressure."""
        profile = self.wellbore_model.discretize_profile(bottomhole_temp_c=180.0, bottomhole_pressure_bar=60.0)
        self.assertEqual(len(profile), 11)
        # Surface segment should be cooler than bottomhole
        self.assertLess(profile[0]["temperature_c"], profile[-1]["temperature_c"])
        # Surface pressure should be lower than bottomhole
        self.assertLess(profile[0]["pressure_bar"], profile[-1]["pressure_bar"])
        # Viscosity at surface should be higher than bottomhole due to cooler temperature
        self.assertGreater(profile[0]["viscosity_cp"], profile[-1]["viscosity_cp"])

    def test_srp_rod_floating_detection(self):
        """High viscosity and high SPM should trigger rod floating risk."""
        # Case A: Low viscosity hot crude, low SPM -> No rod float
        perf_safe = self.srp_model.evaluate_srp_performance(stroke_length_m=2.4, spm=5.0, avg_viscosity_cp=80.0)
        self.assertFalse(perf_safe["rod_floating_detected"])
        self.assertLess(perf_safe["rod_floating_risk"], 0.3)

        # Case B: High viscosity cold crude (3,500 cP) with aggressive 8.5 SPM -> Must trigger rod floating
        perf_float = self.srp_model.evaluate_srp_performance(stroke_length_m=2.4, spm=8.5, avg_viscosity_cp=3500.0)
        self.assertTrue(perf_float["rod_floating_detected"])
        self.assertGreater(perf_float["rod_floating_risk"], 0.7)

    def test_dynamometer_card_synthesis(self):
        """Dyno card must return valid closed-loop points."""
        card = self.srp_model.generate_dynamometer_card(stroke_length_m=2.4, spm=6.0, avg_viscosity_cp=200.0)
        self.assertEqual(len(card), 40)
        # All surface loads must be positive
        for pt in card:
            self.assertGreater(pt["surface_load_lbs"], 0)
            self.assertGreaterEqual(pt["position_m"], 0)


if __name__ == "__main__":
    unittest.main()
