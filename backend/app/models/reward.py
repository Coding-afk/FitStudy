from datetime import datetime

from pydantic import BaseModel, Field

from app.models.workout_result import ExerciseResult


class PerfectWorkoutRewardResultCreate(BaseModel):
    startedAt: datetime
    completedAt: datetime
    completionTimeSeconds: int = Field(ge=1)
    exerciseResults: list[ExerciseResult]
