from types import SimpleNamespace

from app.services.gamification import (
    CHALLENGES,
    evaluate_challenge,
    get_eligible_challenge_ids,
    select_daily_challenge,
)


def _exercise(*completed_values):
    return SimpleNamespace(
        sets=[
            SimpleNamespace(completed=value)
            for value in completed_values
        ]
    )


def test_daily_challenge_selection_is_stable_for_same_assignment_and_day():
    first = select_daily_challenge(
        'user-1',
        'assignment-1',
        '2026-10-15',
    )
    second = select_daily_challenge(
        'user-1',
        'assignment-1',
        '2026-10-15',
    )

    assert first == second
    assert first['id'] in CHALLENGES


def test_two_per_exercise_is_not_eligible_when_any_exercise_has_one_set():
    workout = {
        'exerciseList': [
            {'exerciseId': 'E1', 'targetValues': [10, 10, 10]},
            {'exerciseId': 'E2', 'targetValues': [30]},
        ]
    }

    eligible = get_eligible_challenge_ids(workout)

    assert 'every_exercise' in eligible
    assert 'two_per_exercise' not in eligible


def test_two_per_exercise_is_eligible_when_all_exercises_have_two_sets():
    workout = {
        'exerciseList': [
            {'exerciseId': 'E1', 'targetValues': [10, 10]},
            {'exerciseId': 'E2', 'targetValues': [30, 30, 30]},
        ]
    }

    eligible = get_eligible_challenge_ids(workout)

    assert 'two_per_exercise' in eligible


def test_selection_never_uses_a_challenge_outside_eligible_pool():
    eligible = {'complete_70_percent', 'perfect_finish'}

    selected = select_daily_challenge(
        'user-1',
        'assignment-2',
        '2026-10-15',
        eligible_ids=eligible,
    )

    assert selected['id'] in eligible


def test_every_exercise_requires_one_set_from_each_exercise():
    assert evaluate_challenge(
        'every_exercise',
        [
            _exercise(True, False, False),
            _exercise(False, True, False),
        ],
    ) is True

    assert evaluate_challenge(
        'every_exercise',
        [
            _exercise(True, False, False),
            _exercise(False, False, False),
        ],
    ) is False


def test_two_per_exercise_requires_two_completed_sets_from_every_exercise():
    assert evaluate_challenge(
        'two_per_exercise',
        [
            _exercise(True, True, False),
            _exercise(True, True, True),
        ],
    ) is True

    assert evaluate_challenge(
        'two_per_exercise',
        [
            _exercise(True, False, False),
            _exercise(True, True, True),
        ],
    ) is False


def test_two_per_exercise_is_impossible_when_an_exercise_has_only_one_set():
    assert evaluate_challenge(
        'two_per_exercise',
        [
            _exercise(True, True),
            _exercise(True),
        ],
    ) is False


def test_percentage_and_perfect_challenges():
    results = [
        _exercise(True, True, True, True, False),
    ]

    assert evaluate_challenge('complete_70_percent', results) is True
    assert evaluate_challenge('complete_80_percent', results) is True
    assert evaluate_challenge('complete_90_percent', results) is False
    assert evaluate_challenge('perfect_finish', results) is False
