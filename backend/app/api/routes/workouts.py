"""Read-only workout-definition endpoints backed by the Firestore workouts collection."""

from fastapi import APIRouter, HTTPException

from app.core.firebase import db

router = APIRouter(
    prefix="/workouts",
    tags=["workouts"],
)

# Public workout definitions are read-only through this router; result writes use
# /workout-results where authentication and validation are enforced.
@router.get("")
def get_all_workouts():

    documents = (
        db.collection("workouts").order_by("workoutNumber").stream()
    )

    workouts = []

    for doc in documents:
        workouts.append(doc.to_dict())

    return workouts

@router.get("/{workout_id}")
def get_workout(workout_id: str):

    document = (
        db.collection("workouts").document(workout_id).get()
    )

    if not document.exists:
        raise HTTPException(status_code=404, detail="Workout not found")

    return document.to_dict()