"""Profile, health-screening, and username request/response models."""

from typing import Literal

from pydantic import BaseModel, Field


# Exact answer values accepted by the research health-screening form.
class HealthScreeningData(BaseModel):
    heartCondition: Literal['yes', 'no']
    injury: Literal['yes', 'no']
    pregnant: Literal['yes', 'no']
    asthma: Literal['yes', 'no']
    medication: Literal['yes', 'no']
    ageRange: Literal['18-24', '25-34', '35-44', '45+']
    fitnessLevel: Literal['Beginner', 'Intermediate', 'Advanced']
    exerciseFrequency: Literal[
        'Never',
        '1-2x/week',
        '3-4x/week',
        '5+/week',
    ]


class ScreeningSubmission(HealthScreeningData):
    warningAcknowledged: bool = False


class ScreeningResponse(BaseModel):
    outcome: Literal['eligible', 'warning', 'blocked']
    message: str
    screeningCompleted: bool
    screeningPassed: bool
    studyStatus: str


class UserProfileCreate(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    participantId: str


# Participant-facing profile intentionally excludes sensitive screening answers.
class UserProfile(BaseModel):
    name: str
    studyId: str
    group: str
    completedGamified: int = 0
    completedNonGamified: int = 0
    studyStatus: str = 'screening_required'
    screeningCompleted: bool = False
    screeningPassed: bool = False
    consentAccepted: bool = False


class UsernameUpdate(BaseModel):
    username: str = Field(min_length=3, max_length=20)
