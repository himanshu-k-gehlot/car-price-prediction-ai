"""
AutoPrice AI – FastAPI Backend
Loads a pre-trained Random Forest pipeline and serves predictions.
"""
import json
import os
from contextlib import asynccontextmanager

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator

# ── Model / metrics paths ────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "car_price_model.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "model", "model_metrics.json")

_model = None
_metrics: dict = {}


def load_model():
    global _model, _metrics
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Model file not found at {MODEL_PATH}. "
            "Please run `python train_model.py` first."
        )
    _model = joblib.load(MODEL_PATH)
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH) as f:
            _metrics = json.load(f)


# ── App setup ────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(_app: FastAPI):
    load_model()
    yield


app = FastAPI(
    title="AutoPrice AI API",
    description="Used-car price prediction using Random Forest ML model.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ──────────────────────────────────────────────────────────────────
VALID_BRANDS = [
    "Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota",
    "Kia", "Mahindra", "Volkswagen", "Skoda", "Renault",
]
VALID_FUELS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]
VALID_TRANSMISSIONS = ["Manual", "Automatic"]


class CarInput(BaseModel):
    # Suppress the model_ namespace warning – we intentionally use model_year
    model_config = ConfigDict(protected_namespaces=())

    brand: str = Field(..., description="Car brand name")
    model_year: int = Field(..., ge=2000, le=2026, description="Manufacturing year")
    kilometers_driven: float = Field(..., ge=0, le=1_000_000, description="Kilometers driven")
    fuel_type: str = Field(..., description="Fuel type")
    transmission: str = Field(..., description="Transmission type")
    engine_cc: float = Field(..., ge=0, le=6000, description="Engine capacity in cc (0 for Electric)")
    owner_count: int = Field(..., ge=1, le=10, description="Number of previous owners")
    mileage: float = Field(..., ge=0, le=1000, description="Mileage km/l (or range km for EV)")

    @field_validator("brand")
    @classmethod
    def validate_brand(cls, v: str) -> str:
        if v not in VALID_BRANDS:
            raise ValueError(f"Brand must be one of: {', '.join(VALID_BRANDS)}")
        return v

    @field_validator("fuel_type")
    @classmethod
    def validate_fuel(cls, v: str) -> str:
        if v not in VALID_FUELS:
            raise ValueError(f"fuel_type must be one of: {', '.join(VALID_FUELS)}")
        return v

    @field_validator("transmission")
    @classmethod
    def validate_transmission(cls, v: str) -> str:
        if v not in VALID_TRANSMISSIONS:
            raise ValueError(f"transmission must be one of: {', '.join(VALID_TRANSMISSIONS)}")
        return v


class PredictionResponse(BaseModel):
    predicted_price: float
    formatted_price: str
    lower_estimate: str
    upper_estimate: str
    lower_price: float
    upper_price: float


class HealthResponse(BaseModel):
    status: str


class MetricsResponse(BaseModel):
    algorithm: str
    training_samples: int
    test_samples: int
    mae_lakhs: float
    rmse_lakhs: float
    r2_score: float
    features: list[str]


# ── Helpers ──────────────────────────────────────────────────────────────────
def format_lakhs(value: float) -> str:
    return f"\u20b9{value:.2f} Lakhs"


def predict_price(car: CarInput) -> tuple[float, float, float]:
    """
    Run the ML pipeline and return (predicted, lower, upper) in INR lakhs.
    The price range is a ±10% approximation band around the point estimate.
    This is NOT a statistically guaranteed confidence interval.
    """
    if _model is None:
        raise RuntimeError("Model is not loaded.")

    df = pd.DataFrame([{
        "brand": car.brand,
        "model_year": car.model_year,
        "kilometers_driven": car.kilometers_driven,
        "fuel_type": car.fuel_type,
        "transmission": car.transmission,
        "engine_cc": car.engine_cc,
        "owner_count": car.owner_count,
        "mileage": car.mileage,
    }])

    prediction = float(_model.predict(df)[0])
    prediction = max(0.5, prediction)

    lower = prediction * 0.90
    upper = prediction * 1.10
    return prediction, lower, upper


# ── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return {"status": "healthy"}


@app.get("/metrics", response_model=MetricsResponse, tags=["Model"])
async def get_metrics():
    if not _metrics:
        raise HTTPException(status_code=503, detail="Metrics not available. Train the model first.")
    return _metrics


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(car: CarInput):
    """
    Predict the estimated selling price of a used car (INR Lakhs).
    Note: Prices are ML-based estimates, not official valuations.
    """
    try:
        predicted, lower, upper = predict_price(car)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Prediction failed. Please try again.") from exc

    predicted_rupees = predicted * 100_000

    return PredictionResponse(
        predicted_price=round(predicted_rupees, 2),
        formatted_price=format_lakhs(predicted),
        lower_estimate=format_lakhs(lower),
        upper_estimate=format_lakhs(upper),
        lower_price=round(lower * 100_000, 2),
        upper_price=round(upper * 100_000, 2),
    )
