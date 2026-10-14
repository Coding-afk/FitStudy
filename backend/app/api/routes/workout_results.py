from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from firebase_admin import firestore

from app.core.auth import get_current_user
from app.core.firebase import db
from app.models.workout_result import WorkoutResultCreate
from app.services.gamification import (
    get_set_counts,
    process_gamified_workout,
)
from app.services.workout_validation import (
    WorkoutValidationError,
    validate_exercise_results_against_workout,
)


router = APIRouter(
    prefix="/workout-results",
    tags=["Workout Results"],
)


def _get_user_id(current_user: dict) -> str:
    user_id = current_user.get("uid")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated.",
        )

    return user_id


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def create_workout_result(
    result: WorkoutResultCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    assignment_ref = (
        db.collection("workoutAssignments")
        .document(result.assignmentId)
    )

    result_ref = (
        db.collection("workoutResults")
        .document(result.assignmentId)
    )

    workout_ref = (
        db.collection("workouts")
        .document(result.workoutId)
    )

    user_ref = (
        db.collection("users")
        .document(user_id)
    )

    stats_ref = (
        db.collection("gamificationStats")
        .document(user_id)
    )

    base_result_data = result.model_dump()

    transaction = db.transaction()

    @firestore.transactional
    def complete_workout(transaction):
        # ====================================================
        # READ EVERYTHING BEFORE WRITING.
        # ====================================================

        assignment_document = assignment_ref.get(
            transaction=transaction
        )

        existing_result_document = result_ref.get(
            transaction=transaction
        )

        workout_document = workout_ref.get(
            transaction=transaction
        )

        user_document = user_ref.get(
            transaction=transaction
        )

        # ====================================================
        # VALIDATE ASSIGNMENT.
        # ====================================================

        if not assignment_document.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout assignment not found.",
            )

        assignment = assignment_document.to_dict() or {}

        if assignment.get("userId") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "This workout assignment does not belong "
                    "to the current user."
                ),
            )

        if existing_result_document.exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A workout result already exists for this "
                    "assignment. It cannot be submitted twice."
                ),
            )

        if assignment.get("status") == "completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This assignment has already been completed.",
            )

        if assignment.get("status") != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This assignment must be started before it "
                    "can be completed."
                ),
            )

        if assignment.get("workoutId") != result.workoutId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workout ID does not match the assigned workout.",
            )

        if assignment.get("condition") != result.condition:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Workout condition does not match the assignment."
                ),
            )

        # ====================================================
        # VALIDATE THE RESULT AGAINST THE REAL WORKOUT.
        # The stored Firestore workout is authoritative.
        # ====================================================

        if not workout_document.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned workout definition was not found.",
            )

        workout_data = workout_document.to_dict() or {}

        try:
            canonical_exercise_results = (
                validate_exercise_results_against_workout(
                    result.exerciseResults,
                    workout_data,
                )
            )
        except WorkoutValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

        # It is now safe to count submitted sets because their structure
        # exactly matches the server-side workout definition.
        completed_sets, total_sets = get_set_counts(
            result.exerciseResults
        )

        fully_completed = (
            total_sets > 0
            and completed_sets == total_sets
        )

        # ====================================================
        # VALIDATE USER PROFILE.
        # ====================================================

        if not user_document.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found.",
            )

        user_data = user_document.to_dict() or {}

        # ====================================================
        # READ GAMIFICATION STATS ONLY FOR GAMIFIED WORKOUTS.
        # This read still happens before any write.
        # ====================================================

        stats_document = None

        if result.condition == "gamified":
            stats_document = stats_ref.get(
                transaction=transaction
            )

        # ====================================================
        # PREPARE RESULT + GAMIFICATION.
        # ====================================================

        result_data = dict(base_result_data)

        # Never trust client-supplied exercise names/units when storing.
        # The canonical copy comes from the server-side workout document.
        result_data["exerciseResults"] = canonical_exercise_results

        result_data.update({
            "resultId": result.assignmentId,
            "userId": user_id,
            "completedSets": completed_sets,
            "totalSets": total_sets,
            "fullyCompleted": fully_completed,
            "createdAt": firestore.SERVER_TIMESTAMP,
        })

        gamification_response = None
        updated_stats = None

        if result.condition == "gamified":
            current_stats = None

            if stats_document and stats_document.exists:
                current_stats = stats_document.to_dict() or {}

            gamification_data = process_gamified_workout(
                user_id=user_id,
                current_stats=current_stats,
                exercise_results=result.exerciseResults,
            )

            updated_stats = dict(
                gamification_data["updatedStats"]
            )

            gamification_response = (
                gamification_data["gamification"]
            )

            result_data["gamification"] = (
                gamification_response
            )

            updated_stats["updatedAt"] = (
                firestore.SERVER_TIMESTAMP
            )

        # ====================================================
        # USER COUNTERS.
        # ====================================================

        workouts_completed = int(
            user_data.get("workoutsCompleted", 0)
        ) + 1

        gamified_completed = int(
            user_data.get("gamifiedCompleted", 0)
        )

        non_gamified_completed = int(
            user_data.get("nonGamifiedCompleted", 0)
        )

        if result.condition == "gamified":
            gamified_completed += 1
        else:
            non_gamified_completed += 1

        user_updates = {
            "workoutsCompleted": workouts_completed,
            "gamifiedCompleted": gamified_completed,
            "nonGamifiedCompleted": non_gamified_completed,
            "finalRewardUnlocked": workouts_completed >= 10,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }

        # ====================================================
        # WRITE EVERYTHING IN ONE TRANSACTION.
        # ====================================================

        transaction.set(
            result_ref,
            result_data,
        )

        transaction.update(
            assignment_ref,
            {
                "status": "completed",
                "completedAt": firestore.SERVER_TIMESTAMP,
            },
        )

        transaction.update(
            user_ref,
            user_updates,
        )

        if (
            result.condition == "gamified"
            and updated_stats is not None
        ):
            transaction.set(
                stats_ref,
                updated_stats,
                merge=True,
            )

        return {
            "message": (
                "Workout result saved and assignment completed."
            ),
            "resultId": result.assignmentId,
            "assignmentId": result.assignmentId,
            "completedSets": completed_sets,
            "totalSets": total_sets,
            "fullyCompleted": fully_completed,
            "gamification": gamification_response,
            "finalRewardUnlocked": workouts_completed >= 10,
        }

    return complete_workout(transaction)
