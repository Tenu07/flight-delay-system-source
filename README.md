# FlightSignal AI — Flight Delay Prediction and Analysis System

This repository implements the supplied system architecture as a runnable five-service application:

- React single-page application with Tailwind CSS, React Router, Axios, Recharts, an SVG risk gauge, and SHAP waterfall chart
- Node.js/Express API with JWT authentication, role-based access control, prediction orchestration, history, feedback, and admin analytics
- MongoDB persistence using the three requested collections: `users`, `predictions`, and `feedback`
- Flask prediction service for XGBoost inference, live OpenWeather data, batch prediction, and local SHAP explanations
- Flask route-analysis service for route, carrier, time, seasonal, and model-performance views

The project includes a transparent development fallback so the complete interface works before a trained model file is added. The fallback is clearly labelled in every response and must not be presented as a trained research result.

## Quick start with Docker

1. Copy `.env.example` to `.env`.
2. Replace `JWT_SECRET`, `MONGO_ROOT_PASSWORD`, and `ADMIN_REGISTRATION_KEY`.
3. Add `OPENWEATHER_API_KEY` if live weather is required. Without it, the predictor returns an explicit development weather fallback.
4. From this directory run:

   ```bash
   docker compose up --build
   ```

5. Open:

   - Web application: http://localhost:3000
   - Express health check: http://localhost:4000/api/health
   - Predictor health check: http://localhost:5001/health
   - Analyser health check: http://localhost:5002/health

MongoDB is exposed on port 27017 for local development. Remove that port mapping before an internet-facing deployment.

## Local development without Docker

Prerequisites: Node.js 20+, Python 3.11+, and MongoDB 7.

Run each service in a separate terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

```bash
cd ml-predictor
python -m venv .venv
.venv/Scripts/activate        # Windows
pip install -r requirements.txt
python app.py
```

```bash
cd ml-analyser
python -m venv .venv
.venv/Scripts/activate        # Windows
pip install -r requirements.txt
python app.py
```

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## Training and installing the XGBoost model

The runtime expects `ml-predictor/artifacts/flight_delay_model.pkl`. Train it from a cleaned BTS CSV with:

```bash
cd training
pip install -r requirements.txt
python train_model.py path/to/bts_flights.csv
```

The training script:

- normalises common BTS column names;
- creates departure-hour, weekday, and month features;
- applies the standard 15-minute arrival-delay target;
- uses a chronological 80/20 split to reduce temporal leakage;
- trains XGBoost; and
- writes both the model artifact and the analyser's `model_metrics.json`.

For final academic evaluation, extend the script with route/carrier encoders, cross-validated hyperparameter selection, class weighting or carefully evaluated resampling, and weather joins. Record all preprocessing in the persisted model pipeline so training and inference remain identical.

## Accounts and administrator access

User registration is public. An administrator account can be created only when the value entered in the registration form matches `ADMIN_REGISTRATION_KEY`. After initial setup, disable public admin creation or provision administrators through a one-off database migration.

JWTs are stored in local storage to match the supplied architecture. For a higher-security production deployment, prefer short-lived access tokens held in memory plus rotating, secure, HTTP-only refresh cookies.

## API map

### Express API

- `/api/auth`: register, login, logout, current user
- `/api/users`: profile update and account deletion
- `/api/predictions`: predict, paginated/filterable history, user statistics, route trends, deletion
- `/api/analysis`: route, carrier, and heatmap proxies
- `/api/feedback`: submit/update and list own feedback
- `/api/admin`: system statistics, user list, role update, and user deletion
- `/api/airports`, `/api/airlines`: reference data

### Predictor (`:5001`)

- `GET /health`
- `GET /model-info`
- `POST /predict`
- `POST /predict/batch` (maximum 100 flights)
- `GET /features/importance`

### Route analyser (`:5002`)

- `POST /analyze/route`
- `POST /analyze/carrier`
- `POST /analyze/heatmap`
- `GET /model/metrics`

The route analyser currently produces deterministic, route-specific demonstration aggregates until BTS route statistics are connected. This prevents random UI changes while keeping untrained values visibly identified as demonstrations.


## Admin account details

User name: admin@flightsignal.ai 
password: FlightAdmin@2026


## Tests and checks

```bash
cd backend && npm test
cd ml-predictor && pytest -q
cd ml-analyser && pytest -q
cd frontend && npm test
```

Before deployment, also run `npm audit`, pin an approved CORS origin, place all services behind TLS, rotate secrets, add database backups, and load-test `POST /api/predictions/predict` with at least 50 concurrent clients.

## Project structure

```text
backend/          Express API, models, middleware, routes, test
frontend/         React pages and visualisations
ml-predictor/     Inference, weather, SHAP, model artifact mount
ml-analyser/      Route analytics and evaluation metrics
training/         Reproducible XGBoost training entry point
docker-compose.yml
```

## Scope and disclaimer

The intended coverage is US domestic passenger flights and pre-departure delay risk. ATC events, NOTAMs, international routes, gate assignments, aircraft tracking, and automated rebooking remain outside scope. Predictions are indicative only and should not be the sole basis for travel decisions.
