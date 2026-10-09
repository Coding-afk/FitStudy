import os

from fastapi import (
    Header,
    HTTPException,
    status,
)

from firebase_admin import (
    auth,
    firestore,
)

from app.core.firebase import (
    db,
    firebase_app,
)


# ============================================================
# DEVELOPMENT AUTH BYPASS
# ============================================================
#
# IMPORTANT:
# This is ONLY for local development/testing.
#
# To enable:
#
#   set FITSTUDY_DEV_BYPASS_AUTH=true
#
# To disable:
#
#   set FITSTUDY_DEV_BYPASS_AUTH=false
#
# Never enable this on the final/deployed backend.
# ============================================================


DEV_BYPASS_AUTH = (
    os.getenv(
        "FITSTUDY_DEV_BYPASS_AUTH",
        "false",
    ).lower()
    == "true"
)


DEV_USER_ID = os.getenv(
    "FITSTUDY_DEV_USER_ID",
    "dev-test-user",
)


DEV_USER_EMAIL = os.getenv(
    "FITSTUDY_DEV_USER_EMAIL",
    "dev@fitstudy.local",
)


def get_development_user() -> dict:
    """
    Returns a fake authenticated user
    during local development.

    It also makes sure a matching
    Firestore user document exists so
    workout result saving can be tested.
    """

    user_ref = (
        db.collection("users")
        .document(DEV_USER_ID)
    )

    user_document = user_ref.get()

    if not user_document.exists:
        user_ref.set({
            "userId":
                DEV_USER_ID,

            "email":
                DEV_USER_EMAIL,

            "createdAt":
                firestore.SERVER_TIMESTAMP,

            "studyStatus":
                "testing",

            "workoutsCompleted":
                0,

            "gamifiedCompleted":
                0,

            "nonGamifiedCompleted":
                0,

            "finalRewardUnlocked":
                False,

            "developmentUser":
                True,
        })

    return {
        "uid":
            DEV_USER_ID,

        "email":
            DEV_USER_EMAIL,

        "devBypass":
            True,
    }


def get_current_user(
    authorization: str | None = Header(
        default=None
    ),
):
    # ========================================================
    # DEVELOPMENT MODE
    # ========================================================

    if DEV_BYPASS_AUTH:
        return get_development_user()


    # ========================================================
    # NORMAL FIREBASE AUTHENTICATION
    # ========================================================

    if not authorization:
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Missing authorization token",
        )


    if not authorization.startswith(
        "Bearer "
    ):
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid authorization format",
        )


    token = authorization.removeprefix(
        "Bearer "
    )


    try:
        decoded_token = (
            auth.verify_id_token(
                token
            )
        )

        return decoded_token


    except Exception as error:
        print(
            "TOKEN VERIFICATION ERROR:",
            error,
        )

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid or expired token",
        )