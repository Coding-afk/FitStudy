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
    "completed",
]


class AssignmentResponse(BaseModel):
    assignmentId: str
    userId: str
    workoutId: str

    condition: AssignmentCondition

    order: int

    status: AssignmentStatus

    assignedAt: datetime | None = None
    startedAt: datetime | None = None
    completedAt: datetime | None = None


class AssignmentListResponse(BaseModel):
    assignments: list[AssignmentResponse]

    totalCount: int

    completedCount: int


class NextAssignmentResponse(BaseModel):
    assignment: AssignmentResponse | None

    totalCount: int

    completedCount: int

    allCompleted: bool