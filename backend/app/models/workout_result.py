"""Validated workout-result structure shared by gamified and standard sessions."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SetResult(BaseModel):
    setNumber: int = Field(ge=1)
    actualValue: int = Field(ge=0)
    completed: bool


class ExerciseResult(BaseModel):
    exerciseId: str
    name: str

    unit: Literal[
        "reps",
        "seconds",
    ]

    sets: list[SetResult]


# One finished study workout. Exercise/set shape is later checked against Firestore.
class WorkoutResultCreate(BaseModel):
    assignmentId: str
    workoutId: str

    condition: Literal[
        "non-gamified",
        "gamified",
    ]

    startedAt: datetime
    completedAt: datetime

    completionTimeSeconds: int = Field(ge=1)

    exerciseResults: list[
        ExerciseResult
    ]
