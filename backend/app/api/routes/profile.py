from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from app.core.auth import get_current_user
from app.core.firebase import db
from app.models.user_profile import UserProfile

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)

@router.get("")
def get_profile(user=Depends(get_current_user)):
    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    document = db.collection("users").document(user_id).get()
    if not document.exists:
        raise HTTPException(status_code=404, detail="User profile not found")
    data = document.to_dict()

    return UserProfile(
        name=data.get("email", ""),
        email=data.get("email", ""),
        studyId=data.get("userId", user_id),
        group=data.get("role", ""),
        completedGamified=data.get("gamifiedCompleted", 0),
        completedNonGamified=data.get("nonGamifiedCompleted", 0)
    )