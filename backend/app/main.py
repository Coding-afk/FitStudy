from fastapi import Depends, FastAPI

from app.core.auth import get_current_user
from app.api.routes import workouts

from app.api.routes import (
    workout_results,
    survey_response,
    profile,
)

from app.api.routes.gamification import (
    router as gamification_router,
)

from app.api.routes.assignments import (
    router as assignments_router,
)

app = FastAPI(
    title="FitStudy API",
)
app.include_router(workouts.router)
app.include_router(workout_results.router)
app.include_router(survey_response.router)
app.include_router(
    gamification_router
)
app.include_router(profile.router)
app.include_router(
    assignments_router
)

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