from pydantic import BaseModel

class SurveyResponseCreate(BaseModel):
    assignmentId: str
    #condition: str Get condition from group 1?
    motivation: int
    engagement: int
    easeOfUse: int
    perceivedConsistency: int
    perceivedUsefulness: int