from pydantic import BaseModel, Field

class SurveyResponseCreate(BaseModel):
    assignmentId: str
    condition: str
    workoutId: str
    motivation: int = Field(ge=1, le=5)
    engagement: int = Field(ge=1, le=5)
    easeOfUse: int = Field(ge=1, le=5)
    perceivedConsistency: int = Field(ge=1, le=5)
    perceivedUsefulness: int = Field(ge=1, le=5)