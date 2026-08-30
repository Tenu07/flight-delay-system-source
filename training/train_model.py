"""Train the production XGBoost artifact from a cleaned BTS CSV.

Expected columns (case-insensitive aliases are normalised below):
flight_date, scheduled departure time, distance, previous arrival delay,
taxi-out time, temperature, wind speed, visibility, precipitation, and
arrival delay minutes. The script intentionally uses a chronological split
to avoid training on future flights and evaluating on the past.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from xgboost import XGBClassifier

FEATURES = ["dep_hour", "day_of_week", "month", "distance", "prev_arr_delay", "taxi_out", "temperature", "wind_speed", "visibility", "precipitation"]
ALIASES = {
    "fl_date": "flight_date", "flightdate": "flight_date", "crs_dep_time": "dep_time", "deptime": "dep_time",
    "distance": "distance", "prev_arr_delay": "prev_arr_delay", "taxiout": "taxi_out", "taxi_out": "taxi_out",
    "temperature": "temperature", "wind_speed": "wind_speed", "visibility": "visibility", "precipitation": "precipitation",
    "arr_delay": "arr_delay", "arrdel15": "arr_del15"
}


def normalise(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.rename(columns={column: ALIASES.get(column.strip().lower(), column.strip().lower()) for column in frame.columns})
    if "flight_date" not in frame or "dep_time" not in frame:
        raise ValueError("Input must contain flight_date/FL_DATE and dep_time/CRS_DEP_TIME")
    frame["flight_date"] = pd.to_datetime(frame["flight_date"], errors="coerce")
    dep = frame["dep_time"].astype(str).str.replace(r"\.0$", "", regex=True).str.zfill(4)
    frame["dep_hour"] = pd.to_numeric(dep.str[:2], errors="coerce").clip(0, 23)
    frame["day_of_week"] = frame["flight_date"].dt.dayofweek
    frame["month"] = frame["flight_date"].dt.month
    defaults = {"prev_arr_delay": 0, "taxi_out": 15, "temperature": 20, "wind_speed": 4.5, "visibility": 10, "precipitation": 0}
    for name, default in defaults.items():
        if name not in frame: frame[name] = default
        frame[name] = pd.to_numeric(frame[name], errors="coerce").fillna(default)
    frame["distance"] = pd.to_numeric(frame["distance"], errors="coerce")
    if "arr_del15" in frame:
        frame["target"] = pd.to_numeric(frame["arr_del15"], errors="coerce")
    elif "arr_delay" in frame:
        frame["target"] = (pd.to_numeric(frame["arr_delay"], errors="coerce") >= 15).astype(int)
    else:
        raise ValueError("Input must contain ARR_DEL15 or ARR_DELAY")
    return frame.dropna(subset=["flight_date", "distance", "target"]).sort_values("flight_date")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", type=Path)
    parser.add_argument("--model-out", type=Path, default=Path("../ml-predictor/artifacts/flight_delay_model.pkl"))
    parser.add_argument("--metrics-out", type=Path, default=Path("../ml-analyser/artifacts/model_metrics.json"))
    args = parser.parse_args()
    frame = normalise(pd.read_csv(args.csv, low_memory=False))
    boundary = int(len(frame) * 0.8)
    train, test = frame.iloc[:boundary], frame.iloc[boundary:]
    model = XGBClassifier(n_estimators=450, max_depth=7, learning_rate=0.05, subsample=0.85, colsample_bytree=0.85, eval_metric="logloss", random_state=42, n_jobs=-1)
    model.fit(train[FEATURES], train["target"])
    probability = model.predict_proba(test[FEATURES])[:, 1]
    prediction = (probability >= 0.5).astype(int)
    metrics = {"auc_roc": round(roc_auc_score(test["target"], probability), 4), "f1": round(f1_score(test["target"], prediction), 4), "precision": round(precision_score(test["target"], prediction), 4), "recall": round(recall_score(test["target"], prediction), 4), "accuracy": round(accuracy_score(test["target"], prediction), 4), "confusion_matrix": confusion_matrix(test["target"], prediction).tolist(), "test_rows": len(test)}
    args.model_out.parent.mkdir(parents=True, exist_ok=True); args.metrics_out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, args.model_out); args.metrics_out.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
