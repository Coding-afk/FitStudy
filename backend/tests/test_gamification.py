from app.models.workout_result import (
    ExerciseResult,
    SetResult,
)

from app.services.gamification import (
    process_gamified_workout,
)


def create_exercise(
    completed_count,
    total_count,
):
    sets = []

    for index in range(
        total_count
    ):
        sets.append(
            SetResult(
                setNumber=index + 1,
                actualValue=10,

                completed=(
                    index
                    < completed_count
                ),
            )
        )

    return ExerciseResult(
        exerciseId="EX001",
        name="Test Exercise",
        unit="reps",
        sets=sets,
    )


def test_perfect_workout():
    exercise = create_exercise(
        completed_count=10,
        total_count=10,
    )

    result = (
        process_gamified_workout(
            user_id="test-user",
            current_stats=None,
            exercise_results=[
                exercise
            ],
        )
    )

    game = result[
        "gamification"
    ]

    stats = result[
        "updatedStats"
    ]

    assert (
        game["completedSets"]
        == 10
    )

    assert (
        game["totalSets"]
        == 10
    )

    assert (
        game["performanceScore"]
        == 100
    )

    assert (
        game["perfectWorkout"]
        is True
    )

    assert (
        game["challenge"][
            "completed"
        ]
        is True
    )

    assert (
        game["xpBreakdown"]["sets"]
        == 100
    )

    assert (
        game["xpBreakdown"][
            "workout"
        ]
        == 50
    )

    assert (
        game["xpBreakdown"][
            "challenge"
        ]
        == 50
    )

    assert (
        game["xpBreakdown"][
            "perfectBonus"
        ]
        == 100
    )

    assert (
        game["xpEarned"]
        == 300
    )

    assert (
        stats["totalXP"]
        == 300
    )

    assert (
        stats["level"]
        == 2
    )

    assert (
        stats["title"]
        == "Challenger"
    )


def test_eighty_percent_workout():
    exercise = create_exercise(
        completed_count=8,
        total_count=10,
    )

    result = (
        process_gamified_workout(
            user_id="test-user",
            current_stats=None,
            exercise_results=[
                exercise
            ],
        )
    )

    game = result[
        "gamification"
    ]

    assert (
        game["performanceScore"]
        == 80
    )

    assert (
        game["challenge"][
            "completed"
        ]
        is True
    )

    assert (
        game["perfectWorkout"]
        is False
    )

    assert (
        game["xpEarned"]
        == 180
    )


def test_below_challenge_target():
    exercise = create_exercise(
        completed_count=5,
        total_count=10,
    )

    result = (
        process_gamified_workout(
            user_id="test-user",
            current_stats=None,
            exercise_results=[
                exercise
            ],
        )
    )

    game = result[
        "gamification"
    ]

    assert (
        game["performanceScore"]
        == 50
    )

    assert (
        game["challenge"][
            "completed"
        ]
        is False
    )

    assert (
        game["perfectWorkout"]
        is False
    )

    assert (
        game["xpEarned"]
        == 100
    )


def test_first_workout_badges():
    exercise = create_exercise(
        completed_count=10,
        total_count=10,
    )

    result = (
        process_gamified_workout(
            user_id="test-user",
            current_stats=None,
            exercise_results=[
                exercise
            ],
        )
    )

    badges = [
        badge["id"]
        for badge
        in result[
            "gamification"
        ][
            "newlyUnlockedBadges"
        ]
    ]

    assert "game_on" in badges

    assert (
        "perfect_start"
        in badges
    )

    assert (
        "challenge_accepted"
        in badges
    )


def test_existing_xp_can_level_up():
    exercise = create_exercise(
        completed_count=10,
        total_count=10,
    )

    current_stats = {
        "userId": "test-user",
        "totalXP": 500,
        "level": 2,
        "title": "Challenger",

        "gamifiedWorkoutsCompleted":
            1,

        "perfectWorkouts":
            0,

        "challengesCompleted":
            1,

        "earnedBadges": [
            "game_on",
            "challenge_accepted",
            "xp_hunter",
        ],
    }

    result = (
        process_gamified_workout(
            user_id="test-user",
            current_stats=
                current_stats,
            exercise_results=[
                exercise
            ],
        )
    )

    game = result[
        "gamification"
    ]

    assert (
        game["totalXP"]
        == 800
    )

    assert (
        game["previousLevel"]
        == 2
    )

    assert (
        game["level"]
        == 3
    )

    assert (
        game["levelUp"]
        is True
    )

    assert (
        game["title"]
        == "Achiever"
    )