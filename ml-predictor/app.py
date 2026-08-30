from __future__ import annotations

import math
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import requests
import shap
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

FEATURES = ["dep_hour", "day_of_week", "month", "distance", "prev_arr_delay", "taxi_out", "temperature", "wind_speed", "visibility", "precipitation"]
LABELS = {
    "dep_hour": "Scheduled departure hour", "day_of_week": "Day of week", "month": "Seasonal travel pattern",
    "distance": "Flight distance", "prev_arr_delay": "Previous aircraft delay", "taxi_out": "Airport congestion (taxi-out)",
    "temperature": "Origin temperature", "wind_speed": "Origin wind speed", "visibility": "Origin visibility", "precipitation": "Origin precipitation"
}
AIRPORT_COORDS = {
    "ATL": (33.6407, -84.4277), "LAX": (33.9416, -118.4085), "ORD": (41.9742, -87.9073),
    "DFW": (32.8998, -97.0403), "DEN": (39.8561, -104.6737), "JFK": (40.6413, -73.7781),
    "SFO": (37.6213, -122.3790), "SEA": (47.4502, -122.3088), "LAS": (36.0840, -115.1537),
    "MCO": (28.4312, -81.3081), "EWR": (40.6895, -74.1745), "CLT": (35.2144, -80.9473),
    "PHX": (33.4373, -112.0078), "IAH": (29.9902, -95.3368), "MIA": (25.7959, -80.2870),
    "BOS": (42.3656, -71.0096), "MSP": (44.8848, -93.2223), "DTW": (42.2162, -83.3554),
    "PHL": (39.8744, -75.2424), "LGA": (40.7769, -73.8740)
}

MODEL_PATH = Path(os.getenv("MODEL_PATH", "artifacts/flight_delay_model.pkl"))
MODEL = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None
try:
    EXPLAINER = shap.TreeExplainer(MODEL) if MODEL is not None else None
except Exception:
    EXPLAINER = None
WEATHER_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}


def envelope(data: Any, status: int = 200):
    return jsonify({"success": True, "data": data}), status


def weather_for(airport: str) -> dict[str, Any]:
    ttl = int(os.getenv("WEATHER_CACHE_TTL_SECONDS", "1800"))
    cached = WEATHER_CACHE.get(airport)
    if cached and time.time() - cached[0] < ttl:
        return {**cached[1], "source": "cache"}

    api_key = os.getenv("OPENWEATHER_API_KEY")
    coords = AIRPORT_COORDS.get(airport)
    if api_key and coords:
        try:
            response = requests.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": coords[0], "lon": coords[1], "appid": api_key, "units": "metric"}, timeout=2.5
            )
            response.raise_for_status()
            raw = response.json()
            weather = {
                "temperature": raw["main"]["temp"], "wind_speed": raw.get("wind", {}).get("speed", 0),
                "visibility": raw.get("visibility", 10000) / 1000, "precipitation": raw.get("rain", {}).get("1h", 0),
                "condition": raw.get("weather", [{}])[0].get("description", "unknown"), "source": "live"
            }
            WEATHER_CACHE[airport] = (time.time(), weather)
            return weather
        except requests.RequestException:
            if cached:
                return {**cached[1], "source": "stale-cache", "warning": "Live weather unavailable"}

    # Stable local defaults keep development and academic demonstrations reproducible.
    return {"temperature": 20.0, "wind_speed": 4.5, "visibility": 10.0, "precipitation": 0.0, "condition": "clear", "source": "development-fallback", "warning": "Set OPENWEATHER_API_KEY for live weather"}


def feature_row(payload: dict[str, Any], weather: dict[str, Any]) -> pd.DataFrame:
    departure = datetime.fromisoformat(f"{payload['flight_date']}T{payload['dep_time']}")
    values = {
        "dep_hour": departure.hour + departure.minute / 60, "day_of_week": departure.weekday(), "month": departure.month,
        "distance": float(payload["distance"]), "prev_arr_delay": float(payload.get("prev_arr_delay", 0)),
        "taxi_out": float(payload.get("taxi_out", 15)), "temperature": float(weather["temperature"]),
        "wind_speed": float(weather["wind_speed"]), "visibility": float(weather["visibility"]),
        "precipitation": float(weather["precipitation"])
    }
    return pd.DataFrame([values], columns=FEATURES)


def heuristic_probability(row: pd.Series) -> float:
    # Transparent fallback for running the repository before a trained artifact is supplied.
    score = -1.65
    score += 0.052 * max(row.prev_arr_delay, 0) + 0.035 * max(row.taxi_out - 15, 0)
    score += 0.11 * max(row.wind_speed - 5, 0) + 0.25 * row.precipitation
    score += 0.10 * max(8 - row.visibility, 0)
    score += 0.45 if row.dep_hour >= 17 else (0.20 if row.dep_hour >= 14 else 0)
    score += 0.18 if row.day_of_week in (4, 6) else 0
    return float(1 / (1 + math.exp(-score)))


def explain(row: pd.Series, probability: float) -> list[dict[str, Any]]:
    if EXPLAINER is not None:
        raw = EXPLAINER.shap_values(pd.DataFrame([row], columns=FEATURES))
        values = np.asarray(raw)
        if values.ndim == 3:
            values = values[:, :, -1]
        values = values.reshape(-1)
        ranked = sorted(zip(FEATURES, values), key=lambda item: abs(float(item[1])), reverse=True)[:5]
        return [{"feature": feature, "label": LABELS[feature], "value": float(row[feature]), "shap_value": round(float(value), 4), "direction": "increase" if value >= 0 else "decrease"} for feature, value in ranked]
    contributions = {
        "prev_arr_delay": 0.052 * max(row.prev_arr_delay, 0), "taxi_out": 0.035 * max(row.taxi_out - 15, 0),
        "wind_speed": 0.11 * max(row.wind_speed - 5, 0), "visibility": 0.10 * min(row.visibility - 8, 0),
        "precipitation": 0.25 * row.precipitation, "dep_hour": 0.45 if row.dep_hour >= 17 else 0,
        "day_of_week": 0.18 if row.day_of_week in (4, 6) else -0.05, "distance": 0.00008 * (row.distance - 800)
    }
    top = sorted(contributions.items(), key=lambda item: abs(item[1]), reverse=True)[:5]
    return [{"feature": feature, "label": LABELS[feature], "value": float(row[feature]), "shap_value": round(value, 4), "direction": "increase" if value >= 0 else "decrease"} for feature, value in top]


def predict_one(payload: dict[str, Any]) -> dict[str, Any]:
    for name in ["origin", "destination", "carrier", "dep_time", "flight_date", "distance"]:
        if name not in payload or payload[name] in (None, ""):
            raise ValueError(f"Missing required field: {name}")
    weather = weather_for(str(payload["origin"]).upper())
    frame = feature_row(payload, weather)
    if MODEL is not None:
        probability = float(MODEL.predict_proba(frame)[0, 1])
        model_used = type(MODEL).__name__
    else:
        probability = heuristic_probability(frame.iloc[0])
        model_used = "Transparent development fallback (replace with XGBoost artifact)"
    percent = round(probability * 100, 2)
    risk = "Low" if percent < 30 else "Moderate" if percent <= 60 else "High"
    colour = {"Low": "#16a34a", "Moderate": "#d97706", "High": "#dc2626"}[risk]
    return {"delay_probability": percent, "risk_category": risk, "risk_colour": colour, "shap_explanation": explain(frame.iloc[0], probability), "weather": weather, "model_used": model_used}


@app.errorhandler(Exception)
def handle_error(error: Exception):
    status = 400 if isinstance(error, (ValueError, KeyError, TypeError)) else 500
    return jsonify({"success": False, "error": str(error)}), status


@app.get("/health")
def health():
    return envelope({"status": "ok", "model_loaded": MODEL is not None})


@app.get("/model-info")
def model_info():
    return envelope({"model_type": type(MODEL).__name__ if MODEL is not None else "development-fallback", "features": FEATURES, "target_auc_roc": 0.78, "artifact_path": str(MODEL_PATH)})


@app.post("/predict")
def predict():
    return envelope(predict_one(request.get_json(force=True)))


@app.post("/predict/batch")
def predict_batch():
    payload = request.get_json(force=True)
    flights = payload if isinstance(payload, list) else payload.get("flights", [])
    if len(flights) > 100:
        raise ValueError("Batch size cannot exceed 100")
    return envelope([predict_one(flight) for flight in flights])


@app.get("/features/importance")
def importance():
    if MODEL is not None and hasattr(MODEL, "feature_importances_"):
        raw = np.asarray(MODEL.feature_importances_, dtype=float)
        values = (raw / raw.sum()).tolist() if raw.sum() else raw.tolist()
    else:
        values = [0.24, 0.18, 0.14, 0.11, 0.09, 0.08, 0.06, 0.04, 0.035, 0.025]
    return envelope([{"feature": feature, "label": LABELS[feature], "importance": value} for feature, value in zip(FEATURES, values)])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5001")), debug=os.getenv("FLASK_DEBUG") == "1")
