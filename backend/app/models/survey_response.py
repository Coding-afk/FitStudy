"""Validated 1-5 post-workout survey request model."""

from pydantic import BaseModel, Field


# All research ratings are mandatory integers on the agreed 1-5 scale.
class SurveyResponseCreate(BaseModel):
    assignmentId: str = Field(min_length=1)
    motivation: int = Field(ge=1, le=5)
    engagement: int = Field(ge=1, le=5)
    easeOfUse: int = Field(ge=1, le=5)
    perceivedConsistency: int = Field(ge=1, le=5)
    perceivedUsefulness: int = Field(ge=1, le=5)
