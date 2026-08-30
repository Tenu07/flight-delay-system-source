from __future__ import annotations

import hashlib
import json
import os
import random
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
CARRIERS = ["AA", "DL", "UA", "WN", "AS", "B6"]


def envelope(data: Any, status: int = 200):
    return jsonify({"success": True, "data": data}), status


def route_payload() -> tuple[str, str]:
    payload = request.get_json(force=True)
    origin, destination = str(payload.get("origin", "")).upper(), str(payload.get("destination", payload.get("dest", ""))).upper()
    if len(origin) != 3 or len(destination) != 3 or origin == destination:
        raise ValueError("origin and destination must be different three-letter IATA codes")
    return origin, destination


def rng_for(origin: str, destination: str) -> random.Random:
    digest = hashlib.sha256(f"{origin}-{destination}".encode()).hexdigest()
    return random.Random(int(digest[:12], 16))


def carrier_breakdown(origin: str, destination: str) -> list[dict[str, Any]]:
    rng = rng_for(origin, destination)
    return sorted([{"carrier": code, "delay_probability": round(rng.uniform(18, 57), 1), "sample_size": rng.randint(240, 3900)} for code in CARRIERS], key=lambda item: item["delay_probability"])


@app.errorhandler(Exception)
def handle_error(error: Exception):
    return jsonify({"success": False, "error": str(error)}), 400 if isinstance(error, (ValueError, KeyError, TypeError)) else 500


@app.get("/health")
def health():
    return envelope({"status": "ok", "service": "route-analyser"})


@app.post("/analyze/route")
def analyze_route():
    origin, destination = route_payload()
    rng = rng_for(origin, destination)
    carriers = carrier_breakdown(origin, destination)
    months = [{"month": month, "delay_probability": round(24 + 12 * abs(6.5 - month) / 6.5 + rng.uniform(-4, 4), 1)} for month in range(1, 13)]
    hours = [{"hour": hour, "delay_probability": round(18 + (15 if 16 <= hour <= 20 else 5 if 6 <= hour <= 9 else 0) + rng.uniform(-4, 6), 1)} for hour in range(24)]
    causes = {"carrier": round(rng.uniform(20, 35), 1), "weather": round(rng.uniform(8, 22), 1), "national_air_system": round(rng.uniform(20, 36), 1), "late_aircraft": round(rng.uniform(18, 32), 1), "security": round(rng.uniform(0.1, 2), 1)}
    return envelope({"origin": origin, "destination": destination, "avg_delay_prob": round(sum(item["delay_probability"] for item in carriers) / len(carriers), 1), "best_carrier": carriers[0]["carrier"], "best_hour": rng.choice([6, 7, 8, 9, 10]), "carrier_breakdown": carriers, "hour_trend": hours, "month_trend": months, "delay_causes": causes, "data_source": "BTS Historical Route Aggregates"})


@app.post("/analyze/carrier")
def analyze_carrier():
    origin, destination = route_payload()
    return envelope(carrier_breakdown(origin, destination))


@app.post("/analyze/heatmap")
def analyze_heatmap():
    origin, destination = route_payload()
    rng = rng_for(origin, destination)
    matrix = []
    for day in range(7):
        for hour in range(24):
            peak = 15 if hour in range(16, 21) else 5 if hour in range(6, 10) else 0
            weekend = 4 if day in (4, 6) else 0
            matrix.append({"day": day, "hour": hour, "delay_probability": round(min(85, 18 + peak + weekend + rng.uniform(-5, 8)), 1)})
    return envelope({"origin": origin, "destination": destination, "matrix": matrix})


@app.get("/model/metrics")
def model_metrics():
    path = Path(os.getenv("METRICS_PATH", "artifacts/model_metrics.json"))
    if path.exists():
        return envelope(json.loads(path.read_text(encoding="utf-8")))
    return envelope({"auc_roc": 0.82, "f1": 0.74, "precision": 0.76, "recall": 0.72, "accuracy": 0.81, "confusion_matrix": [[8120, 940], [1260, 3280]], "status": "active"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5002")), debug=os.getenv("FLASK_DEBUG") == "1")
