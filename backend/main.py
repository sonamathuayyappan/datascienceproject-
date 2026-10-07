"""
WATERWISE FastAPI Backend Service
Provides endpoints for water consumption prediction, model evaluation metrics,
feature importances, and exploratory data analysis (EDA).
"""
import os
import sys
import json
import types
from typing import Optional, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np

# Workaround for Windows Application Control blocking _hist_gradient_boosting DLL
if 'sklearn.ensemble._hist_gradient_boosting.gradient_boosting' not in sys.modules:
    m = types.ModuleType('sklearn.ensemble._hist_gradient_boosting.gradient_boosting')
    m.HistGradientBoostingClassifier = None
    m.HistGradientBoostingRegressor = None
    sys.modules['sklearn.ensemble._hist_gradient_boosting'] = types.ModuleType('sklearn.ensemble._hist_gradient_boosting')
    sys.modules['sklearn.ensemble._hist_gradient_boosting.gradient_boosting'] = m

import joblib

app = FastAPI(
    title="WATERWISE API",
    description="Interactive Water Consumption Prediction API",
    version="1.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
models = {}
metadata = {}
eda_cache = {}

def get_base_dir():
    # Locate models relative to this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if os.path.exists(os.path.join(current_dir, "models")):
        return current_dir
    if os.path.exists(os.path.join(current_dir, "..", "models")):
        return os.path.abspath(os.path.join(current_dir, ".."))
    return current_dir

@app.on_event("startup")
def load_artifacts():
    global models, metadata, eda_cache
    base_dir = get_base_dir()
    models_dir = os.path.join(base_dir, "models")
    
    # Load metadata
    meta_path = os.path.join(models_dir, "metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    else:
        raise RuntimeError(f"Metadata file not found at {meta_path}")

    # Load EDA cache
    eda_path = os.path.join(models_dir, "eda_cache.json")
    if os.path.exists(eda_path):
        with open(eda_path, "r", encoding="utf-8") as f:
            eda_cache = json.load(f)

    # Load serialized models
    lr_path = os.path.join(models_dir, "linear_regression.joblib")
    rf_path = os.path.join(models_dir, "random_forest.joblib")

    if os.path.exists(lr_path):
        models["linear_regression"] = joblib.load(lr_path)
    if os.path.exists(rf_path):
        models["random_forest"] = joblib.load(rf_path)

    print("WATERWISE artifacts successfully loaded into memory.")


class PredictionRequest(BaseModel):
    age: int = Field(..., ge=18, le=64, description="Age in years (18-64)")
    gender: Literal["Male", "Female", "Other"] = Field(..., description="Gender")
    city: str = Field(..., description="City of residence")
    temperature: float = Field(..., ge=15.0, le=42.0, description="Ambient temperature in °C (15.0-42.0)")
    activity_level: Literal["Low", "Medium", "High"] = Field(..., description="Physical activity level")
    model: Optional[str] = Field("random_forest", description="Model name: 'random_forest' or 'linear_regression'")


class PredictionResponse(BaseModel):
    predicted_liters: float
    model_used: str
    feature_vector: list[float]
    feature_labels: list[str]
    benchmark_difference: float
    status_label: str


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "WATERWISE API",
        "models_loaded": list(models.keys())
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest):
    model_key = (payload.model or "random_forest").lower()
    if "linear" in model_key:
        model_name = "linear_regression"
        display_model = "Linear Regression"
    else:
        model_name = "random_forest"
        display_model = "Random Forest Regression"

    if model_name not in models:
        raise HTTPException(status_code=500, detail=f"Model {model_name} not available")

    # Encode categorical features
    enc = metadata.get("encodings", {})
    gender_map = enc.get("gender", {"Female": 0, "Male": 1, "Other": 2})
    city_map = enc.get("city", {})
    act_map = enc.get("activity", {"High": 0, "Low": 1, "Medium": 2})

    # Fallback for unrecognized city
    city_enc = float(city_map.get(payload.city, 0))
    gender_enc = float(gender_map.get(payload.gender, 1))
    act_enc = float(act_map.get(payload.activity_level, 2))

    # Feature vector in exact specified order:
    # [Age, Gender_encoded, City_encoded, Temperature_C, Activity_encoded]
    feature_vector = [
        float(payload.age),
        gender_enc,
        city_enc,
        float(payload.temperature),
        act_enc
    ]

    model = models[model_name]
    X_input = np.array([feature_vector], dtype=float)
    raw_pred = float(model.predict(X_input)[0])

    # Bound prediction realistically
    pred_liters = round(max(1.0, min(5.5, raw_pred)), 3)

    # Compute consumer-friendly status relative to dataset stats (mean 2.72, std 0.55)
    mean_val = 2.72
    std_val = 0.55
    diff = round(pred_liters - mean_val, 3)

    if pred_liters > mean_val + 0.5 * std_val:
        status_label = "Above average — stay hydrated"
    elif pred_liters < mean_val - 0.5 * std_val:
        status_label = "Below average for today's conditions"
    else:
        status_label = "Typical for your profile"

    return PredictionResponse(
        predicted_liters=pred_liters,
        model_used=display_model,
        feature_vector=feature_vector,
        feature_labels=["Age", "Gender_encoded", "City_encoded", "Temperature_C", "Activity_encoded"],
        benchmark_difference=diff,
        status_label=status_label
    )


@app.get("/metrics")
def get_metrics():
    # Return genuine benchmark metrics as specified in Section 4
    return metadata.get("metrics", {
        "linear_regression": {
            "name": "Linear Regression",
            "rmse": 0.384,
            "mae": 0.324,
            "r2": 0.523
        },
        "random_forest": {
            "name": "Random Forest Regression",
            "rmse": 0.165,
            "mae": 0.138,
            "r2": 0.912,
            "parameters": {"n_estimators": 100, "random_state": 42}
        }
    })


@app.get("/feature-importance")
def get_feature_importance():
    return metadata.get("feature_importance", [])


@app.get("/eda")
def get_eda():
    return eda_cache


@app.get("/options")
def get_options():
    return {
        "cities": metadata.get("cities", [
            "Karachi", "Lahore", "Islamabad", "Rawalpindi",
            "Faisalabad", "Multan", "Peshawar", "Quetta"
        ]),
        "genders": metadata.get("genders", ["Male", "Female", "Other"]),
        "activities": ["Low", "Medium", "High"],
        "dataset_stats": metadata.get("dataset_stats", {
            "mean": 2.72,
            "std": 0.55,
            "min": 1.30,
            "max": 4.17
        })
    }
