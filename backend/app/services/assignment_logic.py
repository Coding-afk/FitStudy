"""Pure helper logic for choosing the next incomplete assignment in sequence."""

def get_next_incomplete_assignment(assignments: list[dict]) -> dict | None:
    """Return the lowest-order assignment that is not completed."""

    ordered = sorted(
        assignments,
        key=lambda assignment: assignment.get("order", 999),
    )

    return next(
        (
            assignment
            for assignment in ordered
            if assignment.get("status") != "completed"
        ),
        None,
    )
