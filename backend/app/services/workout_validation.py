class WorkoutValidationError(ValueError):
    pass


def validate_exercise_results_against_workout(
    exercise_results,
    workout_data: dict,
) -> list[dict]:
    """
    Validate client-submitted exercise/set structure against the authoritative
    Firestore workout definition.

    The client may report actual values and completion state, but it may not
    invent extra exercises, sets, units, or set numbers.

    Returns a canonicalized list suitable for storing in Firestore. Exercise
    names and units come from the server-side workout definition.
    """

    expected_exercises = sorted(
        workout_data.get("exerciseList") or [],
        key=lambda exercise: exercise.get("order", 999),
    )

    if not expected_exercises:
        raise WorkoutValidationError(
            "The stored workout does not contain any exercises."
        )

    submitted_by_id = {}

    for exercise in exercise_results:
        exercise_id = exercise.exerciseId

        if exercise_id in submitted_by_id:
            raise WorkoutValidationError(
                f"Exercise {exercise_id} was submitted more than once."
            )

        submitted_by_id[exercise_id] = exercise

    expected_ids = {
        str(exercise.get("exerciseId"))
        for exercise in expected_exercises
    }

    submitted_ids = set(submitted_by_id.keys())

    if submitted_ids != expected_ids:
        missing = sorted(expected_ids - submitted_ids)
        extra = sorted(submitted_ids - expected_ids)

        parts = []

        if missing:
            parts.append(
                "missing exercises: " + ", ".join(missing)
            )

        if extra:
            parts.append(
                "unexpected exercises: " + ", ".join(extra)
            )

        raise WorkoutValidationError(
            "Workout result does not match the assigned workout ("
            + "; ".join(parts)
            + ")."
        )

    canonical_results = []

    for expected in expected_exercises:
        exercise_id = str(expected.get("exerciseId"))
        submitted = submitted_by_id[exercise_id]

        expected_unit = expected.get("unit")

        if submitted.unit != expected_unit:
            raise WorkoutValidationError(
                f"Exercise {exercise_id} has the wrong unit."
            )

        target_values = expected.get("targetValues") or []
        expected_set_numbers = list(
            range(1, len(target_values) + 1)
        )

        submitted_set_numbers = [
            set_result.setNumber
            for set_result in submitted.sets
        ]

        if len(set(submitted_set_numbers)) != len(
            submitted_set_numbers
        ):
            raise WorkoutValidationError(
                f"Exercise {exercise_id} contains duplicate set numbers."
            )

        if sorted(submitted_set_numbers) != expected_set_numbers:
            raise WorkoutValidationError(
                f"Exercise {exercise_id} has the wrong number of sets "
                "or invalid set numbers."
            )

        ordered_sets = sorted(
            submitted.sets,
            key=lambda set_result: set_result.setNumber,
        )

        canonical_results.append({
            "exerciseId": exercise_id,
            "name": expected.get("name", submitted.name),
            "unit": expected_unit,
            "sets": [
                {
                    "setNumber": set_result.setNumber,
                    "actualValue": set_result.actualValue,
                    "completed": set_result.completed,
                }
                for set_result in ordered_sets
            ],
        })

    return canonical_results
