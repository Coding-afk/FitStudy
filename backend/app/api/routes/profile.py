from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from firebase_admin import (
    firestore,
)

from app.core.auth import (
    get_current_user,
)

from app.core.firebase import db

from app.models.user_profile import (
    UserProfile,
    UserProfileCreate,
)


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


def build_profile(
    user_id: str,
    data: dict,
) -> UserProfile:
    return UserProfile(
        name=data.get(
            "username",
            "Participant",
        ),

        email=data.get(
            "email",
            "",
        ),

        studyId=data.get(
            "participantId",
            user_id,
        ),

        group=data.get(
            "role",
            "participant",
        ),

        completedGamified=data.get(
            "gamifiedCompleted",
            0,
        ),

        completedNonGamified=data.get(
            "nonGamifiedCompleted",
            0,
        ),
    )


@router.get("")
def get_profile(
    user=Depends(
        get_current_user
    ),
):
    user_id = user.get("uid")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail=
                "User not authenticated",
        )


    document = (
        db.collection("users")
        .document(user_id)
        .get()
    )


    if not document.exists:
        raise HTTPException(
            status_code=404,
            detail=
                "User profile not found",
        )


    data = (
        document.to_dict()
        or {}
    )


    return build_profile(
        user_id,
        data,
    )


@router.put("")
def save_profile(
    profile: UserProfileCreate,

    user=Depends(
        get_current_user
    ),
):
    user_id = user.get("uid")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail=
                "User not authenticated",
        )


    user_ref = (
        db.collection("users")
        .document(user_id)
    )


    existing = user_ref.get()


    data = {
        "userId":
            user_id,

        "username":
            profile.username,

        "email":
            user.get(
                "email",
                "",
            ),

        "participantId":
            profile.participantId,

        "role":
            "participant",

        "studyStatus":
            "active",

        "updatedAt":
            firestore.SERVER_TIMESTAMP,
    }


    if not existing.exists:
        data.update({
            "createdAt":
                firestore.SERVER_TIMESTAMP,

            "workoutsCompleted":
                0,

            "gamifiedCompleted":
                0,

            "nonGamifiedCompleted":
                0,

            "finalRewardUnlocked":
                False,
        })


    user_ref.set(
        data,
        merge=True,
    )


    saved_data = (
        user_ref.get()
        .to_dict()
        or data
    )


    return build_profile(
        user_id,
        saved_data,
    )
@router.patch("/username")
def update_username( username, user=Depends(get_current_user)):
    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    username = username.strip()
    if len(username) < 3 or len(username) > 20:
        raise HTTPException(status_code=400, detail="Username must be between 3 and 30 characters")
    user_ref = (db.collection("users").document(user_id))
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="User profile not found")
    user_ref.update({
        "username": username
    })
    return {
        "message": "Username updated successfully.",
        "username": username
    }