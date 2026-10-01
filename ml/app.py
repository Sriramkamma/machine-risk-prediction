from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib


# =========================================
# CREATE FASTAPI APPLICATION
# =========================================

app = FastAPI(
    title="Machine Risk Prediction ML Service"
)


# =========================================
# LOAD TRAINED MODEL
# =========================================

model = joblib.load("risk_model.joblib")


# =========================================
# REQUEST DATA MODEL
# =========================================

class MachineInput(BaseModel):
    Temperature: float
    Pressure: float
    Vibration: str


# =========================================
# ROOT ENDPOINT
# =========================================

@app.get("/")
def home():
    return {
        "message": "Machine Risk Prediction ML Service is running"
    }


# =========================================
# PREDICTION ENDPOINT
# =========================================

@app.post("/predict")
def predict_risk(machine: MachineInput):

    # Convert vibration text into numeric value
    vibration_mapping = {
        "Low": 0,
        "Medium": 1,
        "High": 2
    }

    vibration_value = vibration_mapping.get(machine.Vibration)

    if vibration_value is None:
        return {
            "error": "Vibration must be Low, Medium, or High"
        }

    # Create dataframe with the same feature
    # names used during model training
    input_data = pd.DataFrame(
        [
            {
                "Temperature": machine.Temperature,
                "Pressure": machine.Pressure,
                "Vibration": vibration_value
            }
        ]
    )

    # Ask the trained model for a prediction
    prediction = model.predict(input_data)[0]

    return {
        "risk": prediction
    }