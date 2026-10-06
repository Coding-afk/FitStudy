from typing import Any


# ============================================================
# XP RULES
# ============================================================

XP_PER_COMPLETED_SET = 10
WORKOUT_COMPLETION_XP = 50
CHALLENGE_COMPLETION_XP = 50
PERFECT_WORKOUT_XP = 100


# ============================================================
# CHALLENGE
# ============================================================

DEFAULT_CHALLENGE = {
    "id": "complete_80_percent",
    "name": "80% Finisher",
    "description": "Complete at least 80% of the workout sets.",
}


# ============================================================
# LEVELS AND TITLES
# ============================================================

LEVELS = [
    {
        "level": 1,
        "minimumXP": 0,
        "title": "Starter",
    },
    {
        "level": 2,
        "minimumXP": 300,
        "title": "Challenger",
    },
    {
        "level": 3,
        "minimumXP": 600,
        "title": "Achiever",
    },
    {
        "level": 4,
        "minimumXP": 900,
        "title": "Pro",
    },
    {
        "level": 5,
        "minimumXP": 1200,
        "title": "Champion",
    },
]


# ============================================================
# BADGES
# ============================================================

BADGES = {
    "game_on": {
        "id": "game_on",
        "name": "Game On",
        "description": "Complete your first gamified workout.",
    },

    "perfect_start": {
        "id": "perfect_start",
        "name": "Perfect Start",
        "description": "Complete your first perfect gamified workout.",
    },

    "challenge_accepted": {
        "id": "challenge_accepted",
        "name": "Challenge Accepted",
        "description": "Complete your first gamification challenge.",
    },

    "xp_hunter": {
        "id": "xp_hunter",
        "name": "XP Hunter",
        "description": "Reach 500 XP.",
    },

    "high_achiever": {
        "id": "high_achiever",
        "name": "High Achiever",
        "description": "Reach Level 3.",
    },

    "perfect_pair": {
        "id": "perfect_pair",
        "name": "Perfect Pair",
        "description": "Complete two perfect gamified workouts.",
    },

    "champion": {
        "id": "champion",
        "name": "Champion",
        "description": "Reach Level 5.",
    },

    "game_complete": {
        "id": "game_complete",
        "name": "Game Complete",
        "description": "Complete all five gamified workouts.",
    },
}


# ============================================================
# DEFAULT STATS
# ============================================================

def get_default_gamification_stats(
    user_id: str,
) -> dict[str, Any]:
    return {
        "userId": user_id,
        "totalXP": 0,
        "level": 1,
        "title": "Starter",
        "gamifiedWorkoutsCompleted": 0,
        "perfectWorkouts": 0,
        "challengesCompleted": 0,
        "earnedBadges": [],
    }


# ============================================================
# WORKOUT COMPLETION
# ============================================================

def get_set_counts(
    exercise_results,
) -> tuple[int, int]:
    total_sets = 0
    completed_sets = 0

    for exercise in exercise_results:
        for set_result in exercise.sets:
            total_sets += 1

            if set_result.completed:
                completed_sets += 1

    return completed_sets, total_sets


def calculate_performance_score(
    completed_sets: int,
    total_sets: int,
) -> int:
    if total_sets == 0:
        return 0

    return round(
        (completed_sets / total_sets)
        * 100
    )


# ============================================================
# LEVEL CALCULATION
# ============================================================

def get_level_details(
    total_xp: int,
) -> dict[str, Any]:
    current_level = LEVELS[0]

    for level in LEVELS:
        if total_xp >= level["minimumXP"]:
            current_level = level
        else:
            break

    return current_level


# ============================================================
# BADGE CALCULATION
# ============================================================

def calculate_earned_badges(
    total_xp: int,
    level: int,
    gamified_workouts_completed: int,
    perfect_workouts: int,
    challenges_completed: int,
) -> list[str]:
    earned = []

    if gamified_workouts_completed >= 1:
        earned.append("game_on")

    if perfect_workouts >= 1:
        earned.append("perfect_start")

    if challenges_completed >= 1:
        earned.append(
            "challenge_accepted"
        )

    if total_xp >= 500:
        earned.append("xp_hunter")

    if level >= 3:
        earned.append("high_achiever")

    if perfect_workouts >= 2:
        earned.append("perfect_pair")

    if level >= 5:
        earned.append("champion")

    if gamified_workouts_completed >= 5:
        earned.append("game_complete")

    return earned


# ============================================================
# MAIN GAMIFICATION ENGINE
# ============================================================

def process_gamified_workout(
    user_id: str,
    current_stats: dict[str, Any] | None,
    exercise_results,
) -> dict[str, Any]:

    if not current_stats:
        current_stats = (
            get_default_gamification_stats(
                user_id
            )
        )

    completed_sets, total_sets = (
        get_set_counts(
            exercise_results
        )
    )

    performance_score = (
        calculate_performance_score(
            completed_sets,
            total_sets,
        )
    )

    perfect_workout = (
        total_sets > 0
        and completed_sets
        == total_sets
    )

    challenge_completed = (
        performance_score >= 80
    )


    # --------------------------------------------------------
    # XP
    # --------------------------------------------------------

    set_xp = (
        completed_sets
        * XP_PER_COMPLETED_SET
    )

    workout_xp = (
        WORKOUT_COMPLETION_XP
    )

    challenge_xp = (
        CHALLENGE_COMPLETION_XP
        if challenge_completed
        else 0
    )

    perfect_bonus_xp = (
        PERFECT_WORKOUT_XP
        if perfect_workout
        else 0
    )

    xp_earned = (
        set_xp
        + workout_xp
        + challenge_xp
        + perfect_bonus_xp
    )


    # --------------------------------------------------------
    # PREVIOUS STATS
    # --------------------------------------------------------

    previous_total_xp = int(
        current_stats.get(
            "totalXP",
            0,
        )
    )

    previous_level_details = (
        get_level_details(
            previous_total_xp
        )
    )

    previous_level = (
        previous_level_details[
            "level"
        ]
    )


    # --------------------------------------------------------
    # NEW TOTALS
    # --------------------------------------------------------

    total_xp = (
        previous_total_xp
        + xp_earned
    )

    gamified_workouts_completed = (
        int(
            current_stats.get(
                "gamifiedWorkoutsCompleted",
                0,
            )
        )
        + 1
    )

    perfect_workouts = int(
        current_stats.get(
            "perfectWorkouts",
            0,
        )
    )

    if perfect_workout:
        perfect_workouts += 1

    challenges_completed = int(
        current_stats.get(
            "challengesCompleted",
            0,
        )
    )

    if challenge_completed:
        challenges_completed += 1


    # --------------------------------------------------------
    # NEW LEVEL
    # --------------------------------------------------------

    level_details = (
        get_level_details(
            total_xp
        )
    )

    level = level_details["level"]
    title = level_details["title"]

    level_up = level > previous_level


    # --------------------------------------------------------
    # BADGES
    # --------------------------------------------------------

    previous_badges = set(
        current_stats.get(
            "earnedBadges",
            [],
        )
    )

    earned_badges = (
        calculate_earned_badges(
            total_xp=total_xp,
            level=level,
            gamified_workouts_completed=
                gamified_workouts_completed,
            perfect_workouts=
                perfect_workouts,
            challenges_completed=
                challenges_completed,
        )
    )

    newly_unlocked_badge_ids = [
        badge_id
        for badge_id in earned_badges
        if badge_id
        not in previous_badges
    ]

    newly_unlocked_badges = [
        BADGES[badge_id]
        for badge_id
        in newly_unlocked_badge_ids
    ]


    # --------------------------------------------------------
    # UPDATED FIRESTORE STATS
    # --------------------------------------------------------

    updated_stats = {
        "userId":
            user_id,

        "totalXP":
            total_xp,

        "level":
            level,

        "title":
            title,

        "gamifiedWorkoutsCompleted":
            gamified_workouts_completed,

        "perfectWorkouts":
            perfect_workouts,

        "challengesCompleted":
            challenges_completed,

        "earnedBadges":
            earned_badges,
    }


    # --------------------------------------------------------
    # RESULT FOR WORKOUT + FRONTEND
    # --------------------------------------------------------

    gamification_result = {
        "xpEarned":
            xp_earned,

        "xpBreakdown": {
            "sets":
                set_xp,

            "workout":
                workout_xp,

            "challenge":
                challenge_xp,

            "perfectBonus":
                perfect_bonus_xp,
        },

        "totalXP":
            total_xp,

        "previousLevel":
            previous_level,

        "level":
            level,

        "levelUp":
            level_up,

        "title":
            title,

        "performanceScore":
            performance_score,

        "perfectWorkout":
            perfect_workout,

        "challenge": {
            **DEFAULT_CHALLENGE,

            "completed":
                challenge_completed,

            "xpAwarded":
                challenge_xp,
        },

        "completedSets":
            completed_sets,

        "totalSets":
            total_sets,

        "newlyUnlockedBadges":
            newly_unlocked_badges,
    }

    return {
        "updatedStats":
            updated_stats,

        "gamification":
            gamification_result,
    }