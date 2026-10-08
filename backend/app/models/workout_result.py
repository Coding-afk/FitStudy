from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class SetResult(BaseModel):
    setNumber: int
    actualValue: int
    completed: bool


class ExerciseResult(BaseModel):
    exerciseId: str
    name: str

    unit: Literal[
        "reps",
        "seconds",
    ]

    sets: list[SetResult]


class WorkoutResultCreate(BaseModel):
    workoutId: str

    condition: Literal[
        "non-gamified",
        "gamified",
    ]

    startedAt: datetime
    completedAt: datetime

    completionTimeSeconds: int

    exerciseResults: list[
        ExerciseResult
    ]