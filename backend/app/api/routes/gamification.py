from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.firebase import db

from app.services.gamification import (
    LEVELS,
    get_default_gamification_stats,
)


router = APIRouter(
    prefix="/gamification",
    tags=["Gamification"],
)


def calculate_level_progress(
    total_xp: int,
) -> dict:
    current_level = LEVELS[0]
    next_level = None

    for index, level in enumerate(LEVELS):
        if total_xp >= level["minimumXP"]:
            current_level = level

            if index + 1 < len(LEVELS):
                next_level = LEVELS[index + 1]
        else:
            break

    if next_level is None:
        return {
            "levelStartXP":
                current_level["minimumXP"],

            "nextLevelXP":
                None,

            "xpToNextLevel":
                0,

            "levelProgress":
                100,
        }

    level_start = (
        current_level["minimumXP"]
    )

    next_level_xp = (
        next_level["minimumXP"]
    )

    xp_in_level = (
        total_xp - level_start
    )

    level_range = (
        next_level_xp - level_start
    )

    progress = round(
        (xp_in_level / level_range)
        * 100
    )

    return {
        "levelStartXP":
            level_start,

        "nextLevelXP":
            next_level_xp,

        "xpToNextLevel":
            max(
                0,
                next_level_xp - total_xp,
            ),

        "levelProgress":
            max(
                0,
                min(100, progress),
            ),
    }


@router.get("/me")
def get_my_gamification_stats(
    current_user: dict = Depends(
        get_current_user
    ),
):
    user_id = current_user["uid"]

    stats_document = (
        db.collection(
            "gamificationStats"
        )
        .document(user_id)
        .get()
    )

    default_stats = (
        get_default_gamification_stats(
            user_id
        )
    )

    if stats_document.exists:
        stored_stats = (
            stats_document.to_dict()
        )

        stats = {
            **default_stats,
            **stored_stats,
        }

    else:
        stats = default_stats

    level_progress = (
        calculate_level_progress(
            int(
                stats.get(
                    "totalXP",
                    0,
                )
            )
        )
    )

    return {
        **stats,
        **level_progress,
    }