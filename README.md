# WATERWISE — Interactive Water Consumption Prediction Dashboard

**WATERWISE** is an interactive web dashboard that predicts an individual's daily water consumption (in litres) from demographic, locational, environmental, and behavioural inputs, using machine learning models trained on a 36,500-record dataset.

---

## Architecture & Views

The application provides two unified views selectable from the header:

- **Simple View**: Clean, consumer-facing interface for individuals seeking daily hydration guidance. Displays an illustrative animated water bottle, glass equivalents, and simple status indicators with zero technical jargon.
- **Expert View**: Comprehensive analytical dashboard for analysts and evaluators, exposing:
  - **6.1 Prediction Panel**: Dual model selection (Linear Regression vs. Random Forest) and raw 5-dimensional feature vector inspector (`[Age, Gender_encoded, City_encoded, Temperature_C, Activity_encoded]`).
  - **6.2 Model Comparison Panel**: Side-by-side performance evaluation (RMSE, MAE, R²) and auto-generated comparison narrative.
  - **6.3 Feature Importance Panel**: Ranked Gini importance horizontal bar chart.
  - **6.4 Exploratory Data Analysis Panel**: 36,500-record target histogram, 6×6 correlation matrix heatmap, gender & activity quantile distributions, and temperature scatter plot.
  - **6.5 Actual vs. Predicted Panel**: Held-out test set scatter plot overlaid for both models against the 45° identity line.

---

## Confirmed Model Benchmarks

| Model | RMSE (L) | MAE (L) | R² |
|---|---|---|---|
| Linear Regression | 0.384 | 0.324 | 0.523 |
| **Random Forest Regression** (n_estimators=100, random_state=42) | **0.165** | **0.138** | **0.912** |

---

## Running the Application

### 1. Backend Service (FastAPI)
```bash
# Navigate to workspace root
cd c:\Users\ADMIN\WATERWISE

# Start FastAPI server on port 8001
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001
```
Backend API documentation is available at `http://127.0.0.1:8001/docs`.

### 2. Frontend Development Server (React + Vite + Tailwind CSS)
```bash
# In a separate terminal
cd c:\Users\ADMIN\WATERWISE\frontend

# Start Vite dev server on port 5173
npm run dev
```
Open **http://localhost:5173** in your web browser.

---

## Endpoints

- `POST /api/predict`: Executes model inference for given inputs.
- `GET /api/metrics`: Retrieves benchmark comparison table.
- `GET /api/feature-importance`: Retrieves Random Forest feature importances.
- `GET /api/eda`: Precomputed summary statistics and chart datasets across all 36,500 records.
- `GET /api/options`: Available cities, genders, activity levels, and baseline statistics.
- `GET /api/health`: Liveness probe.
