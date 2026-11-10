from datetime import datetime, timezone
from typing import Optional
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.model import predict_success
from app.database import client, problems_collection
from app.features import build_student_features
from app.weakness import calculate_weak_topics
from app.recommendations import build_recommendations

app = FastAPI(
    title="CodeMentor ML API",
    description="ML backend for CodeMentor",
    version="1.0.0"
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    previous_attempts: int
    previous_success_rate: float
    recent_success_rate_5: float
    previous_problem_attempts: int
    previous_problem_success_rate: float
    hour: int
    day_of_week: int
    days_since_first_submission: float


class AttemptHistoryItem(BaseModel):
    attempts: int
    solved: bool
    timeTaken: Optional[float] = None
    date: str


class ProblemCreate(BaseModel):
    userId: str
    title: str
    difficulty: str
    status: str
    tags: list[str] = Field(default_factory=list)

    attempts: int = 1
    attemptHistory: list[AttemptHistoryItem] = Field(
        default_factory=list
    )

    timeTaken: Optional[float] = None
    date: Optional[str] = None


@app.get("/")
def root():
    return {"message": "CodeMentor ML API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/db-health")
def database_health():
    try:
        client.admin.command("ping")

        return {
            "status": "connected",
            "database": "MongoDB Atlas"
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }


@app.post("/predict")
def predict(request: PredictionRequest):

    features = [[
        request.previous_attempts,
        request.previous_success_rate,
        request.recent_success_rate_5,
        request.previous_problem_attempts,
        request.previous_problem_success_rate,
        request.hour,
        request.day_of_week,
        request.days_since_first_submission
    ]]

    result = predict_success(features)

    return result
class StudentPredictionRequest(BaseModel):
    problemTitle: str


@app.post("/predict/{user_id}")
def predict_for_student(
    user_id: str,
    request: StudentPredictionRequest
):
    problems = list(
        problems_collection.find(
            {"userId": user_id}
        )
    )

    features = build_student_features(
        problems,
        target_problem_title=request.problemTitle
    )

    feature_values = [[
        features["previous_attempts"],
        features["previous_success_rate"],
        features["recent_success_rate_5"],
        features["previous_problem_attempts"],
        features["previous_problem_success_rate"],
        features["hour"],
        features["day_of_week"],
        features["days_since_first_submission"],
    ]]

    result = predict_success(feature_values)

    return {
        "userId": user_id,
        "problemTitle": request.problemTitle,
        "features": features,
        "prediction": result["prediction"],
        "success_probability": result["success_probability"],
    }


@app.post("/problems")
def create_problem(problem: ProblemCreate):

    document = problem.model_dump()

    document["createdAt"] = datetime.now(timezone.utc)

    result = problems_collection.insert_one(document)

    return {
        "message": "Problem saved successfully",
        "id": str(result.inserted_id)
    }

@app.get("/problems")
def get_problems(userId: str):
    problems = list(
        problems_collection.find(
            {"userId": userId}
        )
    )

    for problem in problems:
        problem["id"] = str(problem["_id"])
        del problem["_id"]

    return problems

@app.put("/problems/{problem_id}")
def update_problem(problem_id: str, problem: ProblemCreate):
    from bson import ObjectId

    try:
        object_id = ObjectId(problem_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid problem ID"
        )

    document = problem.model_dump()

    result = problems_collection.update_one(
        {"_id": object_id},
        {"$set": document}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    return {
        "message": "Problem updated successfully",
        "id": problem_id
    }

@app.delete("/problems/{problem_id}")
def delete_problem(problem_id: str):
    from bson import ObjectId

    try:
        object_id = ObjectId(problem_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid problem ID"
        )

    result = problems_collection.delete_one(
        {"_id": object_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    return {
        "message": "Problem deleted successfully",
        "id": problem_id
    }

@app.get("/weak-topics/{user_id}")
def get_weak_topics(user_id: str):
    problems = list(
        problems_collection.find(
            {"userId": user_id}
        )
    )

    weak_topics = calculate_weak_topics(
    problems,
    top_n=None
)

    return {
        "userId": user_id,
        "weakTopics": weak_topics,
    }

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    problems = list(
        problems_collection.find(
            {"userId": user_id}
        )
    )

    recommendations = build_recommendations(
        problems,
        top_n=5
    )

    return {
        "userId": user_id,
        "recommendations": recommendations,
    }