from fastapi import FastAPI

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