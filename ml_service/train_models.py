"""
PETRO-TWIN AI: End-to-End Model Training Pipeline
=================================================
Trains, validates, and serializes the core Machine Learning models for SIH26120:
1. Hybrid Production Forecaster Residual Model (GradientBoostingRegressor)
2. Rod Floating Hazard Classifier (RandomForestClassifier)
3. Parted Rod Fatigue Failure Predictor (GradientBoostingClassifier)
4. Multivariate Telemetry Anomaly Detector (IsolationForest)

Outputs model binaries and training evaluation report into `ml_service/saved_models/`.
"""

import os
import sys
import json
import math
import joblib
import numpy as np
from datetime import datetime
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier, GradientBoostingClassifier, IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score, accuracy_score, f1_score, roc_auc_score, classification_report

# Ensure repository root is on sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from physics.viscosity_model import ViscosityModel
from physics.thermal_model import ThermalModel
from physics.srp_model import SRPModel


def generate_training_dataset(n_samples: int = 3500, random_seed: int = 42):
    """
    Synthesizes physically grounded production and failure dataset calibrated
    to Baghewala heavy oil reservoir physics (SPE-39534, SPE-101168, API RP 11L).
    """
    np.random.seed(random_seed)
    visc_model = ViscosityModel()
    srp_model = SRPModel()
    thermal_model = ThermalModel()

    print(f"[*] Generating {n_samples} physics-consistent operational records for Baghewala Field...")

    records_X = []
    y_actual_rates = []
    y_residuals = []
    y_rod_floats = []
    y_parted_rods = []
    y_anomalies = []

    # Nominal reservoir parameters
    k_darcy = 850.0 * 9.869233e-16  # 850 mD permeability
    h_pay = 18.0                    # 18m pay thickness
    r_drainage = 120.0              # 120m drainage radius
    r_well = 0.108                  # 7-inch casing

    for i in range(n_samples):
        # 1. Cycle state: day 1 to 120
        day = np.random.uniform(1.0, 120.0)
        cycle_num = np.random.randint(1, 9)
        steam_slug = np.random.uniform(1200.0, 1800.0)

        # 2. Reservoir thermal dissipation (Marx-Langenheim)
        peak_info = thermal_model.calculate_peak_temperature(steam_slug, soak_days=float(np.random.uniform(5.0, 9.0)))
        peak_t = peak_info["peak_temperature_c"]
        calc_temp = thermal_model.predict_temperature_at_day(day, peak_t, avg_daily_prod_bbl=90.0)
        temp_c = float(calc_temp + np.random.normal(0, 1.2))
        temp_c = max(47.0, min(240.0, temp_c))

        # 3. Reservoir pressure decay
        pressure_bar = float(55.0 - (day / 120.0) * 32.0 + np.random.normal(0, 1.2))
        pressure_bar = max(15.0, min(65.0, pressure_bar))

        # 4. Oil viscosity (ASTM D341)
        viscosity_cp = float(visc_model.calculate_viscosity(temp_c, pressure_bar))

        # 5. Pumping operational parameters
        spm = float(np.random.uniform(3.5, 7.5))
        stroke_length_m = float(np.random.choice([1.8, 2.1, 2.4, 2.8]))

        # 6. Darcy Inflow
        delta_p_pa = max(5.0, pressure_bar - 8.0) * 1e5
        mu_pa_s = max(0.005, viscosity_cp * 0.001)
        geom_ln = math.log(r_drainage / r_well)
        darcy_inflow_bpd = ((2.0 * math.pi * k_darcy * h_pay * delta_p_pa) / (mu_pa_s * geom_ln)) * 86400.0 * 6.28981 * 0.75

        # 7. SRP Lifting Performance
        srp_eval = srp_model.evaluate_srp_performance(stroke_length_m, spm, viscosity_cp)
        q_pump_bpd = srp_eval["estimated_production_bpd"]

        # Physics baseline
        physics_baseline = min(q_pump_bpd, max(8.0, darcy_inflow_bpd))

        # Empirical true production includes slight non-linear formation skin, emulsion, and gas slippage
        skin_noise = np.random.normal(0.0, 2.8)
        actual_oil_bpd = max(3.0, physics_baseline + skin_noise)
        residual = actual_oil_bpd - physics_baseline

        recent_oil_bpd = actual_oil_bpd * np.random.uniform(0.92, 1.08)
        lag_1 = recent_oil_bpd * np.random.uniform(0.97, 1.03)
        lag_7 = recent_oil_bpd * np.random.uniform(0.93, 1.07)

        # 8. Failure Hazards
        # Rod floating occurs if horsehead velocity exceeds terminal sinking velocity or high risk
        is_rod_floating = int(srp_eval["rod_floating_detected"] or srp_eval["rod_floating_risk"] > 0.50)

        # Parted rod occurs under high cyclic stress + impact loading
        pprl = srp_eval["pprl_lbs"]
        mprl = srp_eval["mprl_lbs"]
        fatigue_stress = ((pprl - mprl) * 4.0) / (math.pi * (0.875 ** 2))
        is_parted_rod = int((fatigue_stress > 21500.0 and srp_eval["impact_loading_risk"] > 0.6) or 
                            (pprl > 23000.0) or (is_rod_floating and day > 90 and np.random.rand() < 0.25))

        # Anomaly label
        is_anomaly = int(pprl > 21500.0 or mprl < 650.0 or actual_oil_bpd < 6.0 or temp_c < 46.0)

        # Feature vector for production forecaster:
        # [temp_c, viscosity_cp, spm, stroke_length_m, day, recent_oil_bpd, lag_1, lag_7, darcy_inflow_bpd, q_pump_bpd]
        feature_row = [
            temp_c,
            viscosity_cp,
            spm,
            stroke_length_m,
            day,
            recent_oil_bpd,
            lag_1,
            lag_7,
            darcy_inflow_bpd,
            q_pump_bpd
        ]

        records_X.append(feature_row)
        y_actual_rates.append(actual_oil_bpd)
        y_residuals.append(residual)
        y_rod_floats.append(is_rod_floating)
        y_parted_rods.append(is_parted_rod)
        y_anomalies.append(is_anomaly)

    return (
        np.array(records_X),
        np.array(y_actual_rates),
        np.array(y_residuals),
        np.array(y_rod_floats),
        np.array(y_parted_rods),
        np.array(y_anomalies)
    )


def train_and_evaluate_all():
    """
    Main training execution function.
    """
    print("=" * 75)
    print("  PETRO-TWIN AI: TRAINING SUITE FOR SMART INDIA HACKATHON 2026")
    print("  Baghewala Field CSS + SRP Optimization Models")
    print("=" * 75)

    saved_models_dir = os.path.join(root_dir, "ml_service", "saved_models")
    os.makedirs(saved_models_dir, exist_ok=True)

    X, y_actual, y_residual, y_rod_float, y_parted_rod, y_anomaly = generate_training_dataset(3500)

    # Split for production residual model
    X_train, X_test, y_res_train, y_res_test, y_act_train, y_act_test = train_test_split(
        X, y_residual, y_actual, test_size=0.20, random_state=42
    )

    metrics_report = {
        "timestamp": datetime.now().isoformat(),
        "training_dataset_samples": int(X.shape[0]),
        "features": [
            "temp_c", "viscosity_cp", "spm", "stroke_length_m", "day",
            "recent_oil_bpd", "lag_1", "lag_7", "darcy_inflow_bpd", "q_pump_bpd"
        ]
    }

    # -------------------------------------------------------------------------
    # 1. Train Hybrid Production Forecaster Residual Model
    # -------------------------------------------------------------------------
    print("\n[1/4] Training Production Forecaster Residual Model (GradientBoostingRegressor)...")
    forecaster_model = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=4,
        subsample=0.85,
        random_state=42
    )
    forecaster_model.fit(X_train, y_res_train)

    pred_res_test = forecaster_model.predict(X_test)
    mae_res = mean_absolute_error(y_res_test, pred_res_test)
    rmse_res = root_mean_squared_error(y_res_test, pred_res_test)
    r2_res = r2_score(y_res_test, pred_res_test)

    # Cross-validation
    cv_scores = cross_val_score(forecaster_model, X_train, y_res_train, cv=5, scoring="neg_mean_absolute_error")
    cv_mae = -cv_scores.mean()

    # Total hybrid error on actual production:
    # y_hybrid = physics_baseline + predicted_residual
    physics_baseline_test = np.minimum(X_test[:, 9], np.maximum(8.0, X_test[:, 8]))
    hybrid_pred_oil = physics_baseline_test + pred_res_test
    hybrid_mae = mean_absolute_error(y_act_test, hybrid_pred_oil)
    hybrid_r2 = r2_score(y_act_test, hybrid_pred_oil)

    print(f"      -> Residual MAE: {mae_res:.3f} bbl/d | RMSE: {rmse_res:.3f} bbl/d | R2: {r2_res:.4f}")
    print(f"      -> 5-Fold Cross-Validation MAE: {cv_mae:.3f} bbl/d")
    print(f"      -> Net Hybrid Oil Rate MAE: {hybrid_mae:.3f} bbl/d | Hybrid R2: {hybrid_r2:.4f}")

    metrics_report["production_forecaster"] = {
        "model_type": "GradientBoostingRegressor",
        "residual_mae_bpd": round(float(mae_res), 3),
        "residual_rmse_bpd": round(float(rmse_res), 3),
        "residual_r2": round(float(r2_res), 4),
        "cv_mae_bpd": round(float(cv_mae), 3),
        "hybrid_oil_mae_bpd": round(float(hybrid_mae), 3),
        "hybrid_oil_r2": round(float(hybrid_r2), 4)
    }

    joblib.dump(forecaster_model, os.path.join(saved_models_dir, "production_forecaster_residual.joblib"))

    # -------------------------------------------------------------------------
    # 2. Train Rod Floating Hazard Classifier
    # -------------------------------------------------------------------------
    print("\n[2/4] Training Rod Floating Hazard Classifier (RandomForestClassifier)...")
    # Features for failure models: [temp_c, viscosity_cp, spm, stroke_length_m, day]
    X_fail = X[:, :5]
    X_f_train, X_f_test, y_rf_train, y_rf_test = train_test_split(X_fail, y_rod_float, test_size=0.20, random_state=42)

    rf_classifier = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    rf_classifier.fit(X_f_train, y_rf_train)

    pred_rf = rf_classifier.predict(X_f_test)
    pred_rf_prob = rf_classifier.predict_proba(X_f_test)[:, 1]
    acc_rf = accuracy_score(y_rf_test, pred_rf)
    f1_rf = f1_score(y_rf_test, pred_rf)
    auc_rf = roc_auc_score(y_rf_test, pred_rf_prob)

    print(f"      -> Accuracy: {acc_rf*100:.2f}% | F1-Score: {f1_rf:.4f} | ROC-AUC: {auc_rf:.4f}")

    metrics_report["rod_floating_classifier"] = {
        "model_type": "RandomForestClassifier",
        "accuracy": round(float(acc_rf), 4),
        "f1_score": round(float(f1_rf), 4),
        "roc_auc": round(float(auc_rf), 4)
    }
    joblib.dump(rf_classifier, os.path.join(saved_models_dir, "rod_floating_classifier.joblib"))

    # -------------------------------------------------------------------------
    # 3. Train Parted Rod Fatigue Predictor
    # -------------------------------------------------------------------------
    print("\n[3/4] Training Parted Rod Fatigue Hazard Predictor (GradientBoostingClassifier)...")
    X_p_train, X_p_test, y_pr_train, y_pr_test = train_test_split(X_fail, y_parted_rod, test_size=0.20, random_state=42)

    pr_classifier = GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
    pr_classifier.fit(X_p_train, y_pr_train)

    pred_pr = pr_classifier.predict(X_p_test)
    pred_pr_prob = pr_classifier.predict_proba(X_p_test)[:, 1]
    acc_pr = accuracy_score(y_pr_test, pred_pr)
    f1_pr = f1_score(y_pr_test, pred_pr, zero_division=0)
    auc_pr = roc_auc_score(y_pr_test, pred_pr_prob)

    print(f"      -> Accuracy: {acc_pr*100:.2f}% | F1-Score: {f1_pr:.4f} | ROC-AUC: {auc_pr:.4f}")

    metrics_report["parted_rod_classifier"] = {
        "model_type": "GradientBoostingClassifier",
        "accuracy": round(float(acc_pr), 4),
        "f1_score": round(float(f1_pr), 4),
        "roc_auc": round(float(auc_pr), 4)
    }
    joblib.dump(pr_classifier, os.path.join(saved_models_dir, "parted_rod_classifier.joblib"))

    # -------------------------------------------------------------------------
    # 4. Train Multivariate Telemetry Anomaly Detector (IsolationForest)
    # -------------------------------------------------------------------------
    print("\n[4/4] Fitting Telemetry Anomaly Detector (IsolationForest)...")
    # Features for anomaly detector: [temp_c, pressure_bar, pprl_lbs, mprl_lbs, oil_rate_bpd, motor_power_kw]
    np.random.seed(42)
    n_iso = 3000
    temps_iso = np.random.normal(85.0, 16.0, n_iso)
    press_iso = np.random.normal(48.0, 5.0, n_iso)
    pprl_iso = np.random.normal(14500.0, 1200.0, n_iso)
    mprl_iso = np.random.normal(3200.0, 500.0, n_iso)
    rates_iso = np.random.normal(95.0, 15.0, n_iso)
    power_iso = np.random.normal(18.5, 3.0, n_iso)
    X_iso = np.column_stack([temps_iso, press_iso, pprl_iso, mprl_iso, rates_iso, power_iso])

    iso_detector = IsolationForest(n_estimators=150, contamination=0.04, random_state=42)
    iso_detector.fit(X_iso)

    inlier_ratio = float((iso_detector.predict(X_iso) == 1).mean())
    print(f"      -> Isolation Forest fitted: Nominal Inlier Coverage = {inlier_ratio*100:.1f}%")

    metrics_report["anomaly_detector"] = {
        "model_type": "IsolationForest",
        "contamination": 0.04,
        "n_estimators": 150,
        "inlier_ratio": round(inlier_ratio, 4)
    }
    joblib.dump(iso_detector, os.path.join(saved_models_dir, "anomaly_detector.joblib"))

    # -------------------------------------------------------------------------
    # Save Metrics File
    # -------------------------------------------------------------------------
    metrics_path = os.path.join(saved_models_dir, "training_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_report, f, indent=2)

    print("\n" + "=" * 75)
    print(" [OK] ALL MODELS TRAINED AND SAVED SUCCESSFULLY!")
    print(f" Saved Model Directory: {saved_models_dir}")
    print(f" Metrics Report: {metrics_path}")
    print("=" * 75)

    return metrics_report


if __name__ == "__main__":
    train_and_evaluate_all()
