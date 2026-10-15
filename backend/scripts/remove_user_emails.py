from pathlib import Path
import sys

from firebase_admin import firestore

BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.firebase import db


def remove_legacy_user_emails():
    removed = 0

    for document in db.collection('users').stream():
        data = document.to_dict() or {}

        if 'email' not in data:
            continue

        document.reference.update({'email': firestore.DELETE_FIELD})
        removed += 1

    print(f'Removed legacy email field from {removed} user document(s).')


if __name__ == '__main__':
    remove_legacy_user_emails()
