import hashlib

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from app.core.auth import (
    get_current_user,
)

from app.core.firebase import db

from app.services.gamification import (
    LEVELS,
    get_default_gamification_stats,
    get_level_details,
)


router = APIRouter(
    prefix="/gamification",
    tags=["Gamification"],
)


# ============================================================
# LEVEL PROGRESS
# ============================================================

def calculate_level_progress(
    total_xp: int,
) -> dict:
    current_level = LEVELS[0]
    next_level = None

    for index, level in enumerate(
        LEVELS
    ):
        if (
            total_xp
            >= level["minimumXP"]
        ):
            current_level = level

            if (
                index + 1
                < len(LEVELS)
            ):
                next_level = (
                    LEVELS[index + 1]
                )

        else:
            break

    if next_level is None:
        return {
            "levelStartXP":
                current_level[
                    "minimumXP"
                ],

            "nextLevelXP":
                None,

            "xpToNextLevel":
                0,

            "levelProgress":
                100,
        }

    level_start = (
        current_level[
            "minimumXP"
        ]
    )

    next_level_xp = (
        next_level[
            "minimumXP"
        ]
    )

    xp_in_level = (
        total_xp - level_start
    )

    level_range = (
        next_level_xp
        - level_start
    )

    progress = round(
        (
            xp_in_level
            / level_range
        )
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
                next_level_xp
                - total_xp,
            ),

        "levelProgress":
            max(
                0,
                min(
                    100,
                    progress,
                ),
            ),
    }


# ============================================================
# ANONYMOUS LEADERBOARD NAME
# ============================================================

def create_player_alias(
    user_id: str,
) -> str:
    """
    Fallback display name used only when a user profile
    does not contain a username.

    The Firebase UID itself is never returned.
    """

    digest = hashlib.sha256(
        user_id.encode("utf-8")
    ).hexdigest()

    number = (
        int(
            digest[:12],
            16,
        )
        % 1_000_000
    )

    return (
        f"Player {number:06d}"
    )


def get_leaderboard_name(
    user_id: str,
) -> str:
    """
    Returns the participant's chosen FitStudy username.

    Falls back to the stable Player xxxxxx alias for old
    accounts that do not yet have a username field.
    """

    user_document = (
        db.collection("users")
        .document(user_id)
        .get()
    )

    if user_document.exists:
        user_data = (
            user_document.to_dict()
            or {}
        )

        username = user_data.get(
            "username"
        )

        if (
            isinstance(username, str)
            and username.strip()
        ):
            return username.strip()

    return create_player_alias(
        user_id
    )


# ============================================================
# MY GAMIFICATION STATS
# ============================================================

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
            or {}
        )

        stats = {
            **default_stats,
            **stored_stats,
        }

    else:
        stats = default_stats

    total_xp = int(
        stats.get(
            "totalXP",
            0,
        )
        or 0
    )

    level_progress = (
        calculate_level_progress(
            total_xp
        )
    )

    return {
        **stats,
        **level_progress,
    }


# ============================================================
# LEADERBOARD
# ============================================================

@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(
        default=25,
        ge=1,
        le=100,
    ),

    current_user: dict = Depends(
        get_current_user
    ),
):
    current_user_id = (
        current_user["uid"]
    )

    documents = (
        db.collection(
            "gamificationStats"
        )
        .stream()
    )

    leaderboard_entries = []

    for document in documents:
        data = (
            document.to_dict()
            or {}
        )

        user_id = str(
            data.get(
                "userId",
                document.id,
            )
        )

        total_xp = int(
            data.get(
                "totalXP",
                0,
            )
            or 0
        )

        level_details = (
            get_level_details(
                total_xp
            )
        )

        leaderboard_entries.append({
            "_userId":
                user_id,

            "alias":
                get_leaderboard_name(
                    user_id
                ),

            "totalXP":
                total_xp,

            "level":
                level_details[
                    "level"
                ],

            "title":
                level_details[
                    "title"
                ],
        })

    # --------------------------------------------------------
    # If the currently logged-in user has not completed a
    # gamified workout yet, they may not have a
    # gamificationStats document.
    #
    # Add them to the returned leaderboard with 0 XP so they
    # can still see their position.
    # --------------------------------------------------------

    current_user_exists = any(
        entry["_userId"]
        == current_user_id

        for entry
        in leaderboard_entries
    )

    if not current_user_exists:
        level_details = (
            get_level_details(0)
        )

        leaderboard_entries.append({
            "_userId":
                current_user_id,

            "alias":
                get_leaderboard_name(
                    current_user_id
                ),

            "totalXP":
                0,

            "level":
                level_details[
                    "level"
                ],

            "title":
                level_details[
                    "title"
                ],
        })

    # --------------------------------------------------------
    # Highest XP first.
    #
    # Anonymous name is used as a stable tie-breaker.
    # --------------------------------------------------------

    leaderboard_entries.sort(
        key=lambda entry: (
            -entry["totalXP"],
            entry["alias"],
        )
    )

    previous_xp = None
    current_rank = 0

    for index, entry in enumerate(
        leaderboard_entries,
        start=1,
    ):
        if (
            previous_xp is None
            or entry["totalXP"]
            != previous_xp
        ):
            current_rank = index

        entry["rank"] = (
            current_rank
        )

        previous_xp = (
            entry["totalXP"]
        )

    # --------------------------------------------------------
    # Current user's position
    # --------------------------------------------------------

    current_user_entry = None

    for entry in leaderboard_entries:
        if (
            entry["_userId"]
            == current_user_id
        ):
            current_user_entry = {
                "rank":
                    entry["rank"],

                "alias":
                    entry["alias"],

                "totalXP":
                    entry["totalXP"],

                "level":
                    entry["level"],

                "title":
                    entry["title"],

                "isCurrentUser":
                    True,
            }

            break

    # --------------------------------------------------------
    # Public leaderboard entries.
    #
    # Firebase UID is deliberately removed.
    # --------------------------------------------------------

    public_entries = []

    for entry in (
        leaderboard_entries[:limit]
    ):
        public_entries.append({
            "rank":
                entry["rank"],

            "alias":
                entry["alias"],

            "totalXP":
                entry["totalXP"],

            "level":
                entry["level"],

            "title":
                entry["title"],

            "isCurrentUser":
                (
                    entry["_userId"]
                    == current_user_id
                ),
        })

    return {
        "entries":
            public_entries,

        "currentUser":
            current_user_entry,

        "totalPlayers":
            len(
                leaderboard_entries
            ),
    }