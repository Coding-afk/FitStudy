from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from firebase_admin import firestore

from app.core.auth import (
    get_current_user,
)

from app.core.firebase import db

from app.models.workout_result import (
    WorkoutResultCreate,
)

from app.services.gamification import (
    get_set_counts,
    process_gamified_workout,
)


router = APIRouter(
    prefix="/workout-results",
    tags=["Workout Results"],
)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def create_workout_result(
    result: WorkoutResultCreate,

    current_user: dict = Depends(
        get_current_user
    ),
):
    user_id = current_user["uid"]


    # TODO:
    # Replace this temporary result ID
    # with assignmentId once Group 1's
    # assignment flow is integrated.
    #
    # Each workout result should
    # eventually belong to one specific
    # workoutAssignment.

    result_id = (
        f"{user_id}_"
        f"{result.workoutId}_"
        f"{result.condition}"
    )


    result_ref = (
        db.collection(
            "workoutResults"
        )
        .document(result_id)
    )


    # --------------------------------------------------------
    # PREVENT DUPLICATE RESULT
    # --------------------------------------------------------

    existing_result = (
        result_ref.get()
    )

    if existing_result.exists:
        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "A result already exists "
                "for this workout and "
                "condition.",
        )


    # --------------------------------------------------------
    # CHECK USER EXISTS
    # --------------------------------------------------------

    user_ref = (
        db.collection("users")
        .document(user_id)
    )

    user_document = (
        user_ref.get()
    )

    if not user_document.exists:
        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "User profile not found.",
        )


    # --------------------------------------------------------
    # CALCULATE GENERAL WORKOUT STATS
    # --------------------------------------------------------

    completed_sets, total_sets = (
        get_set_counts(
            result.exerciseResults
        )
    )

    fully_completed = (
        total_sets > 0
        and completed_sets
        == total_sets
    )


    # --------------------------------------------------------
    # BASIC RESULT DATA
    # --------------------------------------------------------

    result_data = (
        result.model_dump()
    )

    result_data.update({
        "resultId":
            result_id,

        "userId":
            user_id,

        "completedSets":
            completed_sets,

        "totalSets":
            total_sets,

        "fullyCompleted":
            fully_completed,

        "createdAt":
            firestore.SERVER_TIMESTAMP,
    })


    # --------------------------------------------------------
    # FIRESTORE BATCH
    # --------------------------------------------------------

    batch = db.batch()


    # ========================================================
    # GAMIFIED WORKOUT
    # ========================================================

    gamification_response = None

    if result.condition == "gamified":

        stats_ref = (
            db.collection(
                "gamificationStats"
            )
            .document(user_id)
        )

        stats_document = (
            stats_ref.get()
        )

        current_stats = (
            stats_document.to_dict()
            if stats_document.exists
            else None
        )


        gamification_data = (
            process_gamified_workout(
                user_id=user_id,
                current_stats=current_stats,
                exercise_results=
                    result.exerciseResults,
            )
        )


        updated_stats = (
            gamification_data[
                "updatedStats"
            ]
        )

        gamification_response = (
            gamification_data[
                "gamification"
            ]
        )


        # Save the gamification result
        # with this specific workout.

        result_data[
            "gamification"
        ] = gamification_response


        updated_stats[
            "updatedAt"
        ] = firestore.SERVER_TIMESTAMP


        batch.set(
            stats_ref,
            updated_stats,
            merge=True,
        )


    # ========================================================
    # SAVE WORKOUT RESULT
    # ========================================================

    batch.set(
        result_ref,
        result_data,
    )


    # ========================================================
    # UPDATE USER COUNTERS
    # ========================================================

    user_updates = {
        "workoutsCompleted":
            firestore.Increment(1),
    }


    if (
        result.condition
        == "gamified"
    ):
        user_updates[
            "gamifiedCompleted"
        ] = firestore.Increment(1)

    else:
        user_updates[
            "nonGamifiedCompleted"
        ] = firestore.Increment(1)


    batch.update(
        user_ref,
        user_updates,
    )


    # ========================================================
    # COMMIT EVERYTHING
    # ========================================================

    batch.commit()


    return {
        "message":
            "Workout result saved.",

        "resultId":
            result_id,

        "completedSets":
            completed_sets,

        "totalSets":
            total_sets,

        "fullyCompleted":
            fully_completed,

        "gamification":
            gamification_response,
    }