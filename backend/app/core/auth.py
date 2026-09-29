from fastapi import (
    Header,
    HTTPException,
    status,
)

from firebase_admin import auth

from app.core.firebase import firebase_app


def get_current_user(
    authorization: str | None = Header(
        default=None
    ),
):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    if not authorization.startswith(
        "Bearer "
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format",
        )

    token = authorization.removeprefix(
        "Bearer "
    )

    try:
        decoded_token = auth.verify_id_token(
            token
        )

        return decoded_token

    except Exception as error:
        print(
            "TOKEN VERIFICATION ERROR:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )