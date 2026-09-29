"""
Unit and Integration Tests for PETRO-TWIN AI ML Service & Agent Supervisor
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml_service.models.production_forecaster import ProductionForecaster
from ml_service.models.failure_predictor import FailurePredictor
from ml_service.models.anomaly_detector import AnomalyDetector
from ml_service.optimizer.pareto_optimizer import ParetoOptimizer
from agent.agent_supervisor import AgentSupervisor


class TestMLService(unittest.TestCase):
    def setUp(self):
        self.forecaster = ProductionForecaster()
        self.failure_predictor = FailurePredictor()
        self.anomaly_detector = AnomalyDetector()
        self.optimizer = ParetoOptimizer()
        self.agent = AgentSupervisor()

    def test_production_forecaster_horizons(self):
        """Production forecaster must predict t+1, t+7, and t+30 with expanding uncertainty intervals."""
        res = self.forecaster.predict(temp_c=80.0, pressure_bar=50.0, spm=6.5, stroke_length_m=2.4, days_since_injection=45)
        self.assertIn("forecast_horizons", res)
        h = res["forecast_horizons"]
        
        self.assertGreater(h["t_plus_1"]["prediction_bpd"], 0)
        self.assertGreater(h["t_plus_30"]["uncertainty_pct"], h["t_plus_1"]["uncertainty_pct"])
        self.assertLess(h["t_plus_1"]["lower_95_bpd"], h["t_plus_1"]["prediction_bpd"])
        self.assertGreater(h["t_plus_1"]["upper_95_bpd"], h["t_plus_1"]["prediction_bpd"])

    def test_failure_predictor_multi_hazard(self):
        """Failure predictor must evaluate rod float, impact load, parted rod, and feature attribution."""
        res = self.failure_predictor.predict_failure_risks(stroke_length_m=2.4, spm=8.5, temp_c=50.0)
        self.assertIn("risks", res)
        self.assertIn("rod_floating", res["risks"])
        self.assertIn("parted_rod", res["risks"])
        self.assertIn("feature_attribution_shap", res)
        # Cold temperature + high SPM must trigger elevated rod float risk
        self.assertGreater(res["risks"]["rod_floating"]["probability"], 0.40)
        self.assertGreater(len(res["feature_attribution_shap"]), 0)

    def test_anomaly_detector_boundary(self):
        """Anomaly detector must flag extreme load as anomalous."""
        # Normal frame
        norm_res = self.anomaly_detector.detect(temp_c=85.0, pressure_bar=48.0, pprl_lbs=14500.0,
                                               mprl_lbs=3200.0, oil_rate_bpd=95.0, motor_power_kw=18.0)
        self.assertFalse(norm_res["is_anomaly"])

        # Anomalous frame (dangerous structural overload > 22,000 lbs)
        abnorm_res = self.anomaly_detector.detect(temp_c=85.0, pressure_bar=48.0, pprl_lbs=24000.0,
                                                 mprl_lbs=200.0, oil_rate_bpd=2.0, motor_power_kw=32.0)
        self.assertTrue(abnorm_res["is_anomaly"])
        self.assertIn(abnorm_res["severity"], ["WARNING", "CRITICAL"])

    def test_pareto_optimizer_convergence(self):
        """Optimizer must return a feasible plan and a populated Pareto frontier."""
        current_state = {"oil_rate_bpd": 80.0, "sor": 4.5, "energy_kwh_bbl": 2.2, "failure_risk": 0.42}
        opt_res = self.optimizer.run_optimization(current_state)
        self.assertEqual(opt_res["status"], "OPTIMIZATION_CONVERGED")
        self.assertIn("recommended_plan", opt_res)
        self.assertIn("pareto_frontier", opt_res)
        self.assertGreater(len(opt_res["pareto_frontier"]), 5)
        
        plan = opt_res["recommended_plan"]
        self.assertGreater(plan["srp"]["spm"], 2.0)
        self.assertLess(plan["srp"]["spm"], 10.0)

    def test_agent_supervisor_tools_and_query(self):
        """Agent must execute deterministic tools and answer query with structured evidence."""
        query_res = self.agent.handle_user_query("What do you recommend for next CSS cycle?")
        self.assertIn("answer", query_res)
        self.assertIn("tools_used", query_res)
        self.assertIn("evidence_data", query_res)
        self.assertIn("get_well_state", query_res["tools_used"])
        self.assertIn("optimize_operations", query_res["tools_used"])


if __name__ == "__main__":
    unittest.main()
