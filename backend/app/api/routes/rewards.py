from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from firebase_admin import firestore

from app.core.auth import get_current_user
from app.core.firebase import db
from app.models.reward import PerfectWorkoutRewardResultCreate
from app.services.workout_validation import (
    WorkoutValidationError,
    validate_exercise_results_against_workout,
)


router = APIRouter(
    prefix="/rewards",
    tags=["Rewards"],
)


# The Perfect Workout is a separate reward workout document.
# It is deliberately NOT part of the 10 research assignments.
PERFECT_REWARD_SOURCE_WORKOUT_ID = "PERFECT001"
PERFECT_REWARD_ID = "PERFECT001"

FINAL_AWARD_ID = "fitstudy_complete"
FINAL_AWARD_NAME = "FitStudy Complete"


def _get_user_id(current_user: dict) -> str:
    user_id = current_user.get("uid")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated.",
        )

    return user_id


def _get_unlocked_user(user_id: str) -> tuple:
    user_ref = db.collection("users").document(user_id)
    user_document = user_ref.get()

    if not user_document.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found.",
        )

    user_data = user_document.to_dict() or {}

    unlocked = (
        bool(user_data.get("finalRewardUnlocked", False))
        or int(user_data.get("workoutsCompleted", 0)) >= 10
    )

    if not unlocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "The Perfect Workout is locked until all 10 study "
                "workouts are completed."
            ),
        )

    return user_ref, user_data


def _get_source_workout() -> dict:
    document = (
        db.collection("workouts")
        .document(PERFECT_REWARD_SOURCE_WORKOUT_ID)
        .get()
    )

    if not document.exists:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "The Perfect Workout reward document could not be found. "
                "Create workouts/PERFECT001 in Firestore first."
            ),
        )

    return document.to_dict() or {}


@router.get("/perfect-workout")
def get_perfect_workout_reward(
    current_user: dict = Depends(get_current_user),
):
    user_id = _get_user_id(current_user)
    _, user_data = _get_unlocked_user(user_id)

    source = _get_source_workout()

    return {
        **source,
        "workoutId": PERFECT_REWARD_ID,
        "sourceWorkoutId": PERFECT_REWARD_SOURCE_WORKOUT_ID,
        "name": source.get("name", "Perfect Workout"),
        "description": source.get(
            "description",
            (
                "A bonus reward workout unlocked after completing all "
                "10 FitStudy study workouts."
            ),
        ),
        "isReward": True,
        "rewardCompleted": bool(
            user_data.get("finalRewardCompleted", False)
        ),
        "finalAward": {
            "id": FINAL_AWARD_ID,
            "name": FINAL_AWARD_NAME,
            "unlocked": bool(
                user_data.get("finalRewardCompleted", False)
            ),
        },
    }


@router.post("/perfect-workout/complete")
def complete_perfect_workout_reward(
    result: PerfectWorkoutRewardResultCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = _get_user_id(current_user)
    user_ref, _ = _get_unlocked_user(user_id)

    source_workout = _get_source_workout()

    try:
        canonical_results = (
            validate_exercise_results_against_workout(
                result.exerciseResults,
                source_workout,
            )
        )
    except WorkoutValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    total_sets = sum(
        len(exercise["sets"])
        for exercise in canonical_results
    )

    completed_sets = sum(
        1
        for exercise in canonical_results
        for set_result in exercise["sets"]
        if set_result["completed"]
    )

    fully_completed = (
        total_sets > 0
        and completed_sets == total_sets
    )

    completion_ref = (
        db.collection("rewardCompletions")
        .document(f"{user_id}_{PERFECT_REWARD_ID}")
    )

    transaction = db.transaction()

    @firestore.transactional
    def save_reward_completion(transaction):
        # Read both documents before any writes.
        user_document = user_ref.get(
            transaction=transaction
        )

        existing_document = completion_ref.get(
            transaction=transaction
        )

        user_data = (
            user_document.to_dict()
            if user_document.exists
            else {}
        ) or {}

        existing_data = (
            existing_document.to_dict()
            if existing_document.exists
            else {}
        ) or {}

        previous_attempt_count = int(
            existing_data.get(
                "attemptCount",
                existing_data.get("completionCount", 0),
            )
            or 0
        )

        attempt_count = previous_attempt_count + 1

        previous_full_completion_count = existing_data.get(
            "fullCompletionCount"
        )

        if previous_full_completion_count is None:
            # Migration-safe fallback for reward documents created
            # before replay tracking existed.
            previous_full_completion_count = (
                1
                if bool(existing_data.get("fullyCompleted", False))
                else 0
            )

        full_completion_count = int(
            previous_full_completion_count or 0
        ) + (1 if fully_completed else 0)

        previously_completed_reward = bool(
            user_data.get("finalRewardCompleted", False)
        )

        newly_unlocked = (
            fully_completed
            and not previously_completed_reward
        )

        is_replay = (
            fully_completed
            and previously_completed_reward
        )

        award_unlocked = (
            previously_completed_reward
            or fully_completed
        )

        ever_fully_completed = (
            bool(existing_data.get("fullyCompleted", False))
            or fully_completed
        )

        best_completed_sets = max(
            int(existing_data.get("bestCompletedSets", 0) or 0),
            completed_sets,
        )

        completion_data = {
            "rewardId": PERFECT_REWARD_ID,
            "userId": user_id,
            "sourceWorkoutId": PERFECT_REWARD_SOURCE_WORKOUT_ID,

            # completionCount is kept as a legacy alias so older
            # frontend/backend code does not break.
            "completionCount": attempt_count,
            "attemptCount": attempt_count,
            "fullCompletionCount": full_completion_count,

            "lastStartedAt": result.startedAt,
            "lastCompletedAt": result.completedAt,
            "completionTimeSeconds": result.completionTimeSeconds,
            "completedSets": completed_sets,
            "totalSets": total_sets,
            "lastSessionFullyCompleted": fully_completed,
            "fullyCompleted": ever_fully_completed,
            "bestCompletedSets": best_completed_sets,
            "exerciseResults": canonical_results,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }

        if not existing_document.exists:
            completion_data["firstAttemptAt"] = (
                firestore.SERVER_TIMESTAMP
            )

            # Kept for compatibility with the earlier reward schema.
            completion_data["firstCompletedAt"] = (
                firestore.SERVER_TIMESTAMP
            )

        if newly_unlocked:
            completion_data["firstFullyCompletedAt"] = (
                firestore.SERVER_TIMESTAMP
            )

        if fully_completed:
            completion_data["lastFullyCompletedAt"] = (
                firestore.SERVER_TIMESTAMP
            )

        transaction.set(
            completion_ref,
            completion_data,
            merge=True,
        )

        user_updates = {
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }

        # The final award is only earned by completing EVERY set
        # in the Perfect Workout. A partial reward session is still
        # recorded, but it does not unlock the award.
        if fully_completed:
            user_updates["finalRewardCompleted"] = True

            if newly_unlocked:
                user_updates["finalRewardCompletedAt"] = (
                    firestore.SERVER_TIMESTAMP
                )

        transaction.update(
            user_ref,
            user_updates,
        )

        return {
            "message": "Perfect Workout reward session saved.",
            "rewardId": PERFECT_REWARD_ID,

            # Legacy alias plus clearer replay-aware counters.
            "completionCount": attempt_count,
            "attemptCount": attempt_count,
            "fullCompletionCount": full_completion_count,

            "completedSets": completed_sets,
            "totalSets": total_sets,
            "fullyCompleted": fully_completed,

            "awardUnlocked": award_unlocked,
            "newlyUnlocked": newly_unlocked,
            "isReplay": is_replay,

            "award": {
                "id": FINAL_AWARD_ID,
                "name": FINAL_AWARD_NAME,
            },

            "completionTimeSeconds": result.completionTimeSeconds,
        }

    return save_reward_completion(transaction)
