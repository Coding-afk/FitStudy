from fastapi import Depends, FastAPI

from app.core.auth import get_current_user


app = FastAPI(
    title="FitStudy API",
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