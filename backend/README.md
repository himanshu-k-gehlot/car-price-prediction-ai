# AutoPrice AI — Backend

FastAPI backend serving a Random Forest used-car price prediction model.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Train the model

```bash
python train_model.py
```

This will:
1. Auto-generate `data/car_data.csv` (3,000 synthetic rows) if it doesn't exist.
2. Train a `RandomForestRegressor` pipeline.
3. Save the trained pipeline to `model/car_price_model.pkl`.
4. Save evaluation metrics to `model/model_metrics.json`.

Sample output:
```
Loaded 3000 rows.
Training Random Forest model...
Training complete.

Model Evaluation on Test Set (600 samples):
  MAE  : ₹0.XXXX Lakhs
  RMSE : ₹0.XXXX Lakhs
  R²   : 0.XXXX

Model saved to model/car_price_model.pkl
Metrics saved to model/model_metrics.json
```

## Start the API server

```bash
uvicorn main:app --reload
```

Server runs on: http://localhost:8000

API docs (Swagger): http://localhost:8000/docs

## Endpoints

| Method | Path       | Description                        |
|--------|------------|------------------------------------|
| GET    | /health    | Health check                       |
| GET    | /metrics   | ML model evaluation metrics        |
| POST   | /predict   | Predict price for a given car      |

### POST /predict — example

Request:
```json
{
  "brand": "Hyundai",
  "model_year": 2021,
  "kilometers_driven": 35000,
  "fuel_type": "Petrol",
  "transmission": "Automatic",
  "engine_cc": 1197,
  "owner_count": 1,
  "mileage": 18.5
}
```

Response:
```json
{
  "predicted_price": 685000.00,
  "formatted_price": "₹6.85 Lakhs",
  "lower_estimate": "₹6.17 Lakhs",
  "upper_estimate": "₹7.54 Lakhs",
  "lower_price": 616500.00,
  "upper_price": 753500.00
}
```

> Price range is a ±10% approximation band, not a statistical confidence interval.
