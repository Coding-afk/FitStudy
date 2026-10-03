from fastapi import Depends, FastAPI

from app.core.auth import get_current_user
from app.api.routes import workouts


app = FastAPI(
    title="FitStudy API",
)
app.include_router(workouts.router)

@app.get("/health")
def health():
    return {
        "status": "ok",
    }


@app.get("/protected")
def protected_route(
    user=Depends(get_current_user),
):
    return {
        "message": "Authenticated",
        "uid": user["uid"],
    }