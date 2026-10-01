import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

import joblib


# =========================================
# 1. CREATE SYNTHETIC TRAINING DATA
# =========================================

data = [
    # Temperature, Pressure, Vibration, Risk
    [45, 80, 0, "Low"],
    [50, 90, 0, "Low"],
    [55, 95, 0, "Low"],
    [60, 100, 0, "Low"],
    [62, 105, 1, "Medium"],
    [65, 110, 1, "Medium"],
    [70, 115, 1, "Medium"],
    [72, 120, 1, "Medium"],
    [75, 125, 2, "High"],
    [80, 130, 2, "High"],
    [85, 120, 2, "High"],
    [90, 140, 2, "High"],
    [95, 150, 2, "High"],

    [48, 85, 0, "Low"],
    [52, 92, 0, "Low"],
    [58, 98, 0, "Low"],
    [64, 105, 1, "Medium"],
    [68, 110, 1, "Medium"],
    [73, 118, 1, "Medium"],
    [78, 125, 2, "High"],
    [82, 135, 2, "High"],
    [88, 145, 2, "High"],
]


# =========================================
# 2. CREATE DATAFRAME
# =========================================

df = pd.DataFrame(
    data,
    columns=[
        "Temperature",
        "Pressure",
        "Vibration",
        "Risk",
    ],
)


# =========================================
# 3. SEPARATE FEATURES AND TARGET
# =========================================

X = df[
    [
        "Temperature",
        "Pressure",
        "Vibration",
    ]
]

y = df["Risk"]


# =========================================
# 4. SPLIT DATA
# =========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)


# =========================================
# 5. CREATE MODEL
# =========================================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
)


# =========================================
# 6. TRAIN MODEL
# =========================================

model.fit(X_train, y_train)


# =========================================
# 7. TEST MODEL
# =========================================

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("Model training completed.")
print(f"Accuracy: {accuracy:.2f}")

print("\nClassification Report:")
print(classification_report(y_test, predictions))


# =========================================
# 8. SAVE TRAINED MODEL
# =========================================

joblib.dump(model, "risk_model.joblib")

print("\nModel saved as risk_model.joblib")