"""Workout-result endpoint with ownership, duplicate, structure, and gamification validation."""

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
    """Save a finished workout and move its assignment to survey_pending.

    The workout itself is complete at this point, so gamification is awarded
    immediately. Study-completion counters are deliberately NOT incremented
    here. The post-workout survey finalizes the assignment and advances the
    user's X/10 study progress.
    """

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

    # The transaction keeps result creation, assignment status, and gamification
    # updates consistent even if two submissions arrive at nearly the same time.
    @firestore.transactional
    def finish_workout(transaction):
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

        assignment_status = assignment.get("status")

        if assignment_status == "survey_pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This workout has already been saved. Complete the "
                    "post-workout survey to continue."
                ),
            )

        if assignment_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This assignment has already been completed.",
            )

        if assignment_status != "in_progress":
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
        # VALIDATE RESULT AGAINST THE SERVER-SIDE WORKOUT.
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
        result_data["exerciseResults"] = canonical_exercise_results

        result_data.update({
            "resultId": result.assignmentId,
            "userId": user_id,
            "completedSets": completed_sets,
            "totalSets": total_sets,
            "fullyCompleted": fully_completed,
            "surveySubmitted": False,
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
                challenge_id=assignment.get("challengeId"),
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
        # WRITE WORKOUT + SURVEY-PENDING STATE ATOMICALLY.
        # Study counters move only after the survey is saved.
        # ====================================================

        transaction.set(
            result_ref,
            result_data,
        )

        transaction.update(
            assignment_ref,
            {
                "status": "survey_pending",
                "workoutCompletedAt": firestore.SERVER_TIMESTAMP,
                "surveyPendingAt": firestore.SERVER_TIMESTAMP,
                "completedAt": None,
            },
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
                "Workout result saved. Complete the post-workout "
                "survey to finish this assignment."
            ),
            "resultId": result.assignmentId,
            "assignmentId": result.assignmentId,
            "assignmentStatus": "survey_pending",
            "surveyRequired": True,
            "completedSets": completed_sets,
            "totalSets": total_sets,
            "fullyCompleted": fully_completed,
            "gamification": gamification_response,
            "finalRewardUnlocked": bool(
                user_data.get("finalRewardUnlocked", False)
            ),
        }

    return finish_workout(transaction)
