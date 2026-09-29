from fastapi import FastAPI
from app.core.firebase import db

app = FastAPI(
    title="FitStudy API",
    description="Backend API for FitStudy",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "application": "FitStudy API",
        "message": "Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }

@app.get("/health/firebase")
def firebase_health():
    db.collection("system").document("health").set(
        {
            "status": "ok"
        }
    )

    return {
        "firebase": "connected"
    }