import hashlib

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

CHALLENGES = {
    "complete_70_percent": {
        "id": "complete_70_percent",
        "name": "Momentum Builder",
        "description": "Complete at least 70% of the workout sets.",
        "xpReward": CHALLENGE_COMPLETION_XP,
    },
    "complete_80_percent": {
        "id": "complete_80_percent",
        "name": "80% Finisher",
        "description": "Complete at least 80% of the workout sets.",
        "xpReward": CHALLENGE_COMPLETION_XP,
    },
    "complete_90_percent": {
        "id": "complete_90_percent",
        "name": "Almost Perfect",
        "description": "Complete at least 90% of the workout sets.",
        "xpReward": CHALLENGE_COMPLETION_XP,
    },
    "every_exercise": {
        "id": "every_exercise",
        "name": "Every Move Counts",
        "description": "Complete at least one set from every exercise.",
        "xpReward": CHALLENGE_COMPLETION_XP,
    },
    "two_per_exercise": {
        "id": "two_per_exercise",
        "name": "Consistency Run",
        "description": "Complete at least two sets from every exercise.",
        "xpReward": CHALLENGE_COMPLETION_XP,
    },
    "perfect_finish": {
        "id": "perfect_finish",
        "name": "Full Sweep",
        "description": "Complete every set in the workout.",
        "xpReward": CHALLENGE_COMPLETION_XP,
    },
}

DEFAULT_CHALLENGE = CHALLENGES["complete_80_percent"]


def get_challenge_definition(
    challenge_id: str | None,
) -> dict[str, Any]:
    challenge = CHALLENGES.get(
        challenge_id or "",
        DEFAULT_CHALLENGE,
    )
    return dict(challenge)


def get_eligible_challenge_ids(
    workout_data: dict[str, Any] | None,
) -> set[str]:
    """Return only challenges that are actually possible for a workout.

    The workout definition is the source of truth. For example,
    ``two_per_exercise`` is excluded if even one exercise has fewer than
    two prescribed sets. This prevents an impossible daily challenge from
    ever being assigned.
    """

    workout_data = workout_data or {}
    exercises = list(workout_data.get("exerciseList") or [])

    set_counts = [
        len(exercise.get("targetValues") or [])
        for exercise in exercises
        if isinstance(exercise, dict)
    ]

    total_sets = sum(set_counts)

    if total_sets <= 0:
        return set()

    eligible = {
        "complete_70_percent",
        "complete_80_percent",
        "complete_90_percent",
        "perfect_finish",
    }

    if set_counts and all(count >= 1 for count in set_counts):
        eligible.add("every_exercise")

    if set_counts and all(count >= 2 for count in set_counts):
        eligible.add("two_per_exercise")

    return eligible


def select_daily_challenge(
    user_id: str,
    assignment_id: str,
    date_key: str,
    excluded_ids: set[str] | None = None,
    eligible_ids: set[str] | None = None,
) -> dict[str, Any]:
    """Choose a stable, possible challenge for a gamified assignment.

    Previously used challenge IDs can be excluded so the participant gets
    more variety. ``eligible_ids`` limits the pool to challenges supported
    by the actual workout structure.
    """

    excluded_ids = excluded_ids or set()

    if eligible_ids is None:
        eligible_ids = set(CHALLENGES.keys())
    else:
        eligible_ids = {
            challenge_id
            for challenge_id in eligible_ids
            if challenge_id in CHALLENGES
        }

    challenge_ids = [
        challenge_id
        for challenge_id in CHALLENGES.keys()
        if (
            challenge_id in eligible_ids
            and challenge_id not in excluded_ids
        )
    ]

    # If every eligible challenge has already been used, allow a repeat,
    # but still never choose an impossible challenge.
    if not challenge_ids:
        challenge_ids = [
            challenge_id
            for challenge_id in CHALLENGES.keys()
            if challenge_id in eligible_ids
        ]

    if not challenge_ids:
        # A real study workout should always have at least one set.
        # Falling back keeps the function safe for malformed seed data.
        return get_challenge_definition(DEFAULT_CHALLENGE["id"])

    digest = hashlib.sha256(
        f"{user_id}:{assignment_id}:{date_key}".encode("utf-8")
    ).hexdigest()
    index = int(digest[:12], 16) % len(challenge_ids)

    return get_challenge_definition(challenge_ids[index])


def evaluate_challenge(
    challenge_id: str | None,
    exercise_results,
) -> bool:
    challenge_id = challenge_id or DEFAULT_CHALLENGE["id"]

    completed_sets, total_sets = get_set_counts(exercise_results)

    if total_sets <= 0:
        return False

    if challenge_id == "complete_70_percent":
        return completed_sets / total_sets >= 0.70

    if challenge_id == "complete_80_percent":
        return completed_sets / total_sets >= 0.80

    if challenge_id == "complete_90_percent":
        return completed_sets / total_sets >= 0.90

    if challenge_id == "perfect_finish":
        return completed_sets == total_sets

    if challenge_id == "every_exercise":
        exercises = list(exercise_results or [])
        return bool(exercises) and all(
            any(set_result.completed for set_result in exercise.sets)
            for exercise in exercises
        )

    if challenge_id == "two_per_exercise":
        exercises = list(exercise_results or [])

        if not exercises:
            return False

        for exercise in exercises:
            sets = list(exercise.sets or [])

            # The wording says TWO sets from every exercise. If an exercise
            # has fewer than two sets, this challenge is impossible and must
            # not count as completed. Assignment selection filters it out.
            if len(sets) < 2:
                return False

            completed = sum(
                1 for set_result in sets
                if set_result.completed
            )

            if completed < 2:
                return False

        return True

    return completed_sets / total_sets >= 0.80


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
    challenge_id: str | None = None,
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

    challenge_definition = (
        get_challenge_definition(
            challenge_id
        )
    )

    challenge_completed = (
        evaluate_challenge(
            challenge_definition["id"],
            exercise_results,
        )
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
        int(
            challenge_definition.get(
                "xpReward",
                CHALLENGE_COMPLETION_XP,
            )
        )
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
            **challenge_definition,

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