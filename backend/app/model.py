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

    return predict_success_batch(features)[0]


def predict_success_batch(features):
    """Predict success probabilities for several feature rows at once."""
    if not features:
        return []

    feature_data = pd.DataFrame(features, columns=MODEL_FEATURES)
    probabilities = model.predict_proba(feature_data)[:, 1]

    return [
        {
            "prediction": int(probability >= 0.5),
            "success_probability": float(probability),
        }
        for probability in probabilities
    ]
