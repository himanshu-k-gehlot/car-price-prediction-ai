"""
Train a Random Forest Regressor on the synthetic used-car dataset.
Saves the trained pipeline to model/car_price_model.pkl
Also saves model metrics to model/model_metrics.json
"""
import json
import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# ── 1. Load data ────────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "car_data.csv")
if not os.path.exists(DATA_PATH):
    print("Dataset not found. Generating it now...")
    import subprocess
    subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "generate_data.py")], check=True)

df = pd.read_csv(DATA_PATH)
print(f"Loaded {len(df)} rows.")

# ── 2. Feature / target split ────────────────────────────────────────────────
FEATURES = ["brand", "model_year", "kilometers_driven", "fuel_type",
            "transmission", "engine_cc", "owner_count", "mileage"]
TARGET = "price"  # ₹ lakhs

X = df[FEATURES].copy()
y = df[TARGET].copy()

# ── 3. Train / test split ────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── 4. Preprocessing pipeline ───────────────────────────────────────────────
categorical_features = ["brand", "fuel_type", "transmission"]
numerical_features = ["model_year", "kilometers_driven", "engine_cc",
                      "owner_count", "mileage"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
        ("num", "passthrough", numerical_features),
    ]
)

# ── 5. Model pipeline ────────────────────────────────────────────────────────
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )),
])

# ── 6. Train ─────────────────────────────────────────────────────────────────
print("Training Random Forest model...")
pipeline.fit(X_train, y_train)
print("Training complete.")

# ── 7. Evaluate ──────────────────────────────────────────────────────────────
y_pred = pipeline.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\nModel Evaluation on Test Set ({len(y_test)} samples):")
print(f"  MAE  : Rs.{mae:.4f} Lakhs")
print(f"  RMSE : Rs.{rmse:.4f} Lakhs")
print(f"  R2   : {r2:.4f}")

# ── 8. Save model ─────────────────────────────────────────────────────────────
os.makedirs(os.path.join(os.path.dirname(__file__), "model"), exist_ok=True)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "car_price_model.pkl")
joblib.dump(pipeline, MODEL_PATH)
print(f"\nModel saved to {MODEL_PATH}")

# ── 9. Save metrics ───────────────────────────────────────────────────────────
METRICS_PATH = os.path.join(os.path.dirname(__file__), "model", "model_metrics.json")
metrics = {
    "algorithm": "Random Forest Regression",
    "n_estimators": 200,
    "training_samples": len(X_train),
    "test_samples": len(X_test),
    "mae_lakhs": round(mae, 4),
    "rmse_lakhs": round(rmse, 4),
    "r2_score": round(r2, 4),
    "features": FEATURES,
    "target": TARGET,
}
with open(METRICS_PATH, "w") as f:
    json.dump(metrics, f, indent=2)
print(f"Metrics saved to {METRICS_PATH}")
