from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore


BASE_DIR = Path(__file__).resolve().parents[2]

SERVICE_ACCOUNT_PATH = (
    BASE_DIR / "secrets" / "firebase-admin.json"
)


if not firebase_admin._apps:
    cred = credentials.Certificate(
        SERVICE_ACCOUNT_PATH
    )

    firebase_admin.initialize_app(cred)


db = firestore.client()