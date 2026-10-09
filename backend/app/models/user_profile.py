from pydantic import BaseModel

class UserProfile(BaseModel):
    name: str
    email: str
    studyId: str
    group: str
    completedGamified: int = 0
    completedNonGamified: int = 0