"""Firebase Admin initialization and shared Firestore client."""

from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore


# Resolve credentials relative to the backend folder rather than the current
# terminal working directory, which makes local startup more predictable.
BASE_DIR = Path(__file__).resolve().parents[2]

SERVICE_ACCOUNT_PATH = (
    BASE_DIR / "secrets" / "firebase-admin.json"
)


try:
    firebase_app = firebase_admin.get_app()

except ValueError:
    cred = credentials.Certificate(
        SERVICE_ACCOUNT_PATH
    )

    firebase_app = firebase_admin.initialize_app(
        cred
    )


db = firestore.client()