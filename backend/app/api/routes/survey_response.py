from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from firebase_admin import firestore

from app.core.auth import get_current_user
from app.core.firebase import db
from app.models.survey_response import SurveyResponseCreate


router = APIRouter(
    prefix="/survey-responses",
    tags=["Survey Responses"],
)


def _get_user_id(current_user: dict) -> str:
    user_id = current_user.get("uid")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated.",
        )

    return user_id


@router.post("", status_code=status.HTTP_201_CREATED)
def create_survey_response(
    survey: SurveyResponseCreate,
    user=Depends(get_current_user),
):
    """Save one survey per assignment and finalize study progress.

    The assignment must already be in survey_pending. Only after the survey is
    committed do we mark the assignment completed, increment the user's X/10
    counters, and potentially unlock the Perfect Workout.
    """

    user_id = _get_user_id(user)

    assignment_ref = (
        db.collection("workoutAssignments")
        .document(survey.assignmentId)
    )

    response_ref = (
        db.collection("survey_responses")
        .document(survey.assignmentId)
    )

    result_ref = (
        db.collection("workoutResults")
        .document(survey.assignmentId)
    )

    user_ref = (
        db.collection("users")
        .document(user_id)
    )

    transaction = db.transaction()

    @firestore.transactional
    def submit_survey(transaction):
        # All reads must happen before writes in a Firestore transaction.
        assignment_document = assignment_ref.get(
            transaction=transaction
        )

        existing_response = response_ref.get(
            transaction=transaction
        )

        result_document = result_ref.get(
            transaction=transaction
        )

        user_document = user_ref.get(
            transaction=transaction
        )

        if not assignment_document.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout assignment not found.",
            )

        assignment_data = assignment_document.to_dict() or {}

        if assignment_data.get("userId") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized to submit a survey for "
                    "this assignment."
                ),
            )

        if existing_response.exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Survey already exists for this assignment.",
            )

        assignment_status = assignment_data.get("status")

        if assignment_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This assignment has already been completed.",
            )

        if assignment_status != "survey_pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Complete the assigned workout before submitting "
                    "its post-workout survey."
                ),
            )

        if not result_document.exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The workout result for this assignment has not "
                    "been saved yet."
                ),
            )

        result_data = result_document.to_dict() or {}

        if result_data.get("userId") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Workout result ownership does not match the user.",
            )

        if result_data.get("assignmentId") != survey.assignmentId:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Workout result does not match this assignment.",
            )

        if not user_document.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found.",
            )

        user_data = user_document.to_dict() or {}

        condition = assignment_data.get("condition")

        if condition not in ("gamified", "non-gamified"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Assignment condition is invalid.",
            )

        workouts_completed = int(
            user_data.get("workoutsCompleted", 0) or 0
        ) + 1

        gamified_completed = int(
            user_data.get("gamifiedCompleted", 0) or 0
        )

        non_gamified_completed = int(
            user_data.get("nonGamifiedCompleted", 0) or 0
        )

        if condition == "gamified":
            gamified_completed += 1
        else:
            non_gamified_completed += 1

        final_reward_unlocked = workouts_completed >= 10

        response_data = {
            "responseId": survey.assignmentId,
            "assignmentId": survey.assignmentId,
            "condition": condition,
            "workoutId": assignment_data.get("workoutId"),
            "userId": user_id,
            "motivationRating": survey.motivation,
            "engagementRating": survey.engagement,
            "easeOfUseRating": survey.easeOfUse,
            "perceivedConsistency": survey.perceivedConsistency,
            "perceivedUsefulness": survey.perceivedUsefulness,
            "submittedAt": firestore.SERVER_TIMESTAMP,
        }

        transaction.set(
            response_ref,
            response_data,
        )

        transaction.update(
            assignment_ref,
            {
                "status": "completed",
                "surveySubmittedAt": firestore.SERVER_TIMESTAMP,
                "completedAt": firestore.SERVER_TIMESTAMP,
            },
        )

        transaction.update(
            result_ref,
            {
                "surveySubmitted": True,
                "surveySubmittedAt": firestore.SERVER_TIMESTAMP,
            },
        )

        transaction.update(
            user_ref,
            {
                "workoutsCompleted": workouts_completed,
                "gamifiedCompleted": gamified_completed,
                "nonGamifiedCompleted": non_gamified_completed,
                "finalRewardUnlocked": final_reward_unlocked,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
        )

        return {
            "message": "Survey response saved and assignment completed.",
            "responseId": survey.assignmentId,
            "assignmentId": survey.assignmentId,
            "assignmentStatus": "completed",
            "completedCount": workouts_completed,
            "totalCount": 10,
            "finalRewardUnlocked": final_reward_unlocked,
        }

    return submit_survey(transaction)
