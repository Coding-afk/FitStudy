import pytest

from app.models.workout_result import (
    ExerciseResult,
    SetResult,
)
from app.services.assignment_logic import (
    get_next_incomplete_assignment,
)
from app.services.workout_validation import (
    WorkoutValidationError,
    validate_exercise_results_against_workout,
)


def make_workout():
    return {
        "workoutId": "W001",
        "exerciseList": [
            {
                "exerciseId": "EX001",
                "name": "Exercise One",
                "order": 1,
                "unit": "reps",
                "targetValues": [10, 10],
            },
            {
                "exerciseId": "EX002",
                "name": "Exercise Two",
                "order": 2,
                "unit": "seconds",
                "targetValues": [30],
            },
        ],
    }


def make_valid_results():
    return [
        ExerciseResult(
            exerciseId="EX001",
            name="Client Name Is Ignored",
            unit="reps",
            sets=[
                SetResult(
                    setNumber=1,
                    actualValue=10,
                    completed=True,
                ),
                SetResult(
                    setNumber=2,
                    actualValue=10,
                    completed=False,
                ),
            ],
        ),
        ExerciseResult(
            exerciseId="EX002",
            name="Another Client Name",
            unit="seconds",
            sets=[
                SetResult(
                    setNumber=1,
                    actualValue=30,
                    completed=True,
                ),
            ],
        ),
    ]


def test_next_incomplete_assignment_uses_lowest_order():
    assignments = [
        {
            "assignmentId": "A3",
            "order": 3,
            "status": "assigned",
        },
        {
            "assignmentId": "A1",
            "order": 1,
            "status": "completed",
        },
        {
            "assignmentId": "A2",
            "order": 2,
            "status": "in_progress",
        },
    ]

    next_assignment = get_next_incomplete_assignment(assignments)

    assert next_assignment["assignmentId"] == "A2"


def test_next_incomplete_assignment_returns_none_when_complete():
    assignments = [
        {
            "assignmentId": "A1",
            "order": 1,
            "status": "completed",
        }
    ]

    assert get_next_incomplete_assignment(assignments) is None


def test_valid_result_matches_server_workout():
    canonical = validate_exercise_results_against_workout(
        make_valid_results(),
        make_workout(),
    )

    assert len(canonical) == 2
    assert canonical[0]["name"] == "Exercise One"
    assert canonical[0]["unit"] == "reps"
    assert len(canonical[0]["sets"]) == 2


def test_extra_set_is_rejected():
    results = make_valid_results()

    results[0].sets.append(
        SetResult(
            setNumber=3,
            actualValue=10,
            completed=True,
        )
    )

    with pytest.raises(WorkoutValidationError):
        validate_exercise_results_against_workout(
            results,
            make_workout(),
        )


def test_wrong_unit_is_rejected():
    results = make_valid_results()

    results[0].unit = "seconds"

    with pytest.raises(WorkoutValidationError):
        validate_exercise_results_against_workout(
            results,
            make_workout(),
        )


def test_unexpected_exercise_is_rejected():
    results = make_valid_results()

    results[1].exerciseId = "FAKE"

    with pytest.raises(WorkoutValidationError):
        validate_exercise_results_against_workout(
            results,
            make_workout(),
        )


def test_survey_pending_assignment_blocks_later_workouts():
    assignments = [
        {
            "assignmentId": "A2",
            "order": 2,
            "status": "assigned",
        },
        {
            "assignmentId": "A1",
            "order": 1,
            "status": "survey_pending",
        },
    ]

    next_assignment = get_next_incomplete_assignment(assignments)

    assert next_assignment["assignmentId"] == "A1"
    assert next_assignment["status"] == "survey_pending"
