from datetime import datetime
from typing import Literal

from pydantic import BaseModel


AssignmentCondition = Literal[
    "gamified",
    "non-gamified",
]


AssignmentStatus = Literal[
    "assigned",
    "in_progress",
    "survey_pending",
    "completed",
]


class ChallengeInfo(BaseModel):
    id: str
    name: str
    description: str
    xpReward: int = 50


class AssignmentResponse(BaseModel):
    assignmentId: str
    userId: str
    workoutId: str

    condition: AssignmentCondition

    order: int

    status: AssignmentStatus

    assignedAt: datetime | None = None
    startedAt: datetime | None = None
    workoutCompletedAt: datetime | None = None
    surveyPendingAt: datetime | None = None
    surveySubmittedAt: datetime | None = None
    completedAt: datetime | None = None
    challengeId: str | None = None
    challengeAssignedDate: str | None = None
    challenge: ChallengeInfo | None = None


class AssignmentListResponse(BaseModel):
    assignments: list[AssignmentResponse]

    totalCount: int

    completedCount: int


class NextAssignmentResponse(BaseModel):
    assignment: AssignmentResponse | None

    totalCount: int

    completedCount: int

    allCompleted: bool
