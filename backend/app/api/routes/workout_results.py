from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from firebase_admin import firestore

from app.core.auth import (
    get_current_user,
)

from app.core.firebase import db

from app.models.workout_result import (
    WorkoutResultCreate,
)


router = APIRouter(
    prefix="/workout-results",
    tags=["Workout Results"],
)


@router.post("")
def create_workout_result(
    result: WorkoutResultCreate,

    user=Depends(
        get_current_user
    ),
):
    uid = user["uid"]

    

    # TODO:
    # Replace this temporary result ID with assignmentId
    # once Group 1's assignment flow is integrated.
    #
    # Each workout completion should eventually belong
    # to a specific workoutAssignment rather than only
    # userId + workoutId + condition.
    
    result_id = (
        f"{uid}_"
        f"{result.workoutId}_"
        f"{result.condition}"
    )


    result_ref = (
        db.collection(
            "workoutResults"
        )
        .document(result_id)
    )


    if result_ref.get().exists:
        raise HTTPException(
            status_code=409,

            detail=(
                "Workout result "
                "already exists"
            ),
        )


    user_ref = (
        db.collection("users")
        .document(uid)
    )


    if not user_ref.get().exists:
        raise HTTPException(
            status_code=400,

            detail=(
                "User profile "
                "not found"
            ),
        )


    result_ref.set({
        "resultId":
            result_id,

        "userId":
            uid,

        "workoutId":
            result.workoutId,

        "condition":
            result.condition,

        "startedAt":
            result.startedAt,

        "completedAt":
            result.completedAt,

        "completionTimeSeconds":
            result.completionTimeSeconds,

        "exerciseResults": [
            exercise.model_dump()

            for exercise
            in result.exerciseResults
        ],

        "createdAt":
            firestore.SERVER_TIMESTAMP,
    })


    updates = {
        "workoutsCompleted":
            firestore.Increment(1)
    }


    if (
        result.condition ==
        "non-gamified"
    ):
        updates[
            "nonGamifiedCompleted"
        ] = firestore.Increment(1)

    else:
        updates[
            "gamifiedCompleted"
        ] = firestore.Increment(1)


    user_ref.update(updates)


    return {
        "message":
            "Workout result saved",

        "resultId":
            result_id,
    }