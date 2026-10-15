from pydantic import (
    BaseModel,
    Field,
)


class UserProfileCreate(
    BaseModel
):
    username: str = Field(
        min_length=3,
        max_length=20,
    )

    participantId: str


class UserProfile(
    BaseModel
):
    name: str

    email: str

    studyId: str

    group: str

    completedGamified: int = 0

    completedNonGamified: int = 0