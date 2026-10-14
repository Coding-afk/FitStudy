from pathlib import Path
import sys

from firebase_admin import firestore


# Allow this script to import the backend app package.
BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(
        0,
        str(BACKEND_DIR),
    )


from app.core.firebase import db


PERFECT_WORKOUT = {
    "workoutId": "PERFECT001",

    # Keep it outside the normal
    # W001-W005 study sequence.
    "workoutNumber": 999,

    "name": "Perfect Workout",

    "description": (
        "A balanced full-body victory circuit "
        "unlocked after completing all 10 "
        "FitStudy workouts."
    ),

    "difficulty": "Intermediate",

    "durationMinutes": 18,

    "isReward": True,

    "studyWorkout": False,

    "exerciseList": [
        {
            "exerciseId": "PW001",

            "name": "Jumping Jacks",

            "order": 1,

            "unit": "seconds",

            "targetValues": [
                30,
                30,
                30,
            ],
        },

        {
            "exerciseId": "PW002",

            "name": "Bodyweight Squats",

            "order": 2,

            "unit": "reps",

            "targetValues": [
                12,
                12,
                12,
            ],
        },

        {
            "exerciseId": "PW003",

            "name": "Push-Ups",

            "order": 3,

            "unit": "reps",

            "targetValues": [
                8,
                8,
                8,
            ],
        },

        {
            "exerciseId": "PW004",

            "name": "Alternating Reverse Lunges",

            "order": 4,

            "unit": "reps",

            "targetValues": [
                10,
                10,
                10,
            ],
        },

        {
            "exerciseId": "PW005",

            "name": "Glute Bridges",

            "order": 5,

            "unit": "reps",

            "targetValues": [
                12,
                12,
                12,
            ],
        },

        {
            "exerciseId": "PW006",

            "name": "Plank",

            "order": 6,

            "unit": "seconds",

            "targetValues": [
                30,
                30,
                30,
            ],
        },
    ],

    "createdAt":
        firestore.SERVER_TIMESTAMP,

    "updatedAt":
        firestore.SERVER_TIMESTAMP,
}


def create_perfect_workout():
    workout_ref = (
        db.collection("workouts")
        .document("PERFECT001")
    )

    workout_ref.set(
        PERFECT_WORKOUT
    )

    print(
        "Perfect Workout created successfully."
    )

    print(
        "Firestore path: "
        "workouts/PERFECT001"
    )


if __name__ == "__main__":
    create_perfect_workout()