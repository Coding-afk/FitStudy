from fastapi import APIRouter, Depends
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
    response_ref = (db.collection("survey_responses").document())
    response_id = response_ref.id
    response_ref.set({
        "responseId": response_id,
        #"assignmentId": survey.assignmentId,
        #"condition": survey.condition, Inputting the condition from group one.
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