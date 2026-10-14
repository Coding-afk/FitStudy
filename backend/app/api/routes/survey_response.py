from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from app.core.auth import get_current_user
from app.core.firebase import db
from app.models.survey_response import SurveyResponseCreate

router = APIRouter(
    prefix="/survey-responses",
    tags=["Survey Responses"],
)

@router.post("")
def create_survey_response(
    survey: SurveyResponseCreate,
    user = Depends(get_current_user),
):
    user_id = user.get("uid")
    assignments = (
        db.collection("workoutAssignments")
        .where("assignmentId", "==", survey.assignmentId)
        .limit(1)
        .stream()
    )
    assignment = next(assignments, None)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Workout assignment not found.")
    assignment_data = assignment.to_dict()
    if assignment_data.get("userId") != user_id:
        raise HTTPException(status_code=403, detail="You are not authorized to submit a survey.")
    existing_response = (
        db.collection("survey_responses")
        .where("assignmentId", "==", survey.assignmentId)
        .limit(1)
        .stream()
    )
    if next(existing_response, None) is not None:
        raise HTTPException(status_code=409, detail="Survey already exists for this assignment.")

    response_ref = (db.collection("survey_responses").document())
    response_id = response_ref.id
    response_ref.set({
        "responseId": response_id,
        "assignmentId": survey.assignmentId,
        "condition": assignment_data.get("condition"),
        "workoutId": assignment_data.get("workoutId"),
        "userId": user_id,
        "motivationRating": survey.motivation,
        "engagementRating": survey.engagement,
        "easeOfUseRating": survey.easeOfUse,
        "perceivedConsistency": survey.perceivedConsistency,
        "perceivedUsefulness": survey.perceivedUsefulness,
        "submittedAt": firestore.SERVER_TIMESTAMP,
    })
    return {
        "message": "Survey response saved",
        "responseId": response_id,
    }