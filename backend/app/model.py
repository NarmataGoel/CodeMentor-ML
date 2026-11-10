import joblib
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "performance_model.pkl"
)

model = joblib.load(MODEL_PATH)

MODEL_FEATURES = [
    "previous_attempts",
    "previous_success_rate",
    "recent_success_rate_5",
    "previous_problem_attempts",
    "previous_problem_success_rate",
    "hour",
    "day_of_week",
    "days_since_first_submission",
]


def predict_success(features):
    """
    Predict the probability that a student
    will successfully solve a problem.
    """

    feature_data = pd.DataFrame(
        features,
        columns=MODEL_FEATURES
    )

    probability = model.predict_proba(feature_data)[0][1]

    prediction = int(probability >= 0.5)

    return {
        "prediction": prediction,
        "success_probability": float(probability)
    }