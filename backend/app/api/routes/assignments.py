import random
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from firebase_admin import (
    firestore,
)

from app.core.auth import (
    get_current_user,
)

from app.core.firebase import db

from app.models.assignment import (
    AssignmentListResponse,
    AssignmentResponse,
    NextAssignmentResponse,
)

from app.services.assignment_logic import (
    get_next_incomplete_assignment,
)
from app.services.gamification import (
    get_challenge_definition,
    get_eligible_challenge_ids,
    select_daily_challenge,
)


router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"],
)


WORKOUT_IDS = [
    "W001",
    "W002",
    "W003",
    "W004",
    "W005",
]


def get_user_id(
    current_user: dict,
) -> str:
    user_id = current_user.get(
        "uid"
    )

    if not user_id:
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "User not authenticated.",
        )

    return user_id


def get_user_assignments(
    user_id: str,
) -> list[dict]:
    documents = (
        db.collection(
            "workoutAssignments"
        )
        .where(
            "userId",
            "==",
            user_id,
        )
        .stream()
    )

    assignments = []

    for document in documents:
        data = (
            document.to_dict()
            or {}
        )

        data["assignmentId"] = (
            data.get(
                "assignmentId"
            )
            or document.id
        )

        if (
            data.get("condition") == "gamified"
            and data.get("challengeId")
        ):
            data["challenge"] = (
                get_challenge_definition(
                    data.get("challengeId")
                )
            )

        assignments.append(
            data
        )

    assignments.sort(
        key=lambda assignment:
            assignment.get(
                "order",
                999,
            )
    )

    return assignments


def get_assignment_for_user(
    assignment_id: str,
    user_id: str,
) -> tuple:
    document_ref = (
        db.collection(
            "workoutAssignments"
        )
        .document(
            assignment_id
        )
    )

    document = (
        document_ref.get()
    )

    if not document.exists:
        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "Assignment not found.",
        )

    data = (
        document.to_dict()
        or {}
    )

    if (
        data.get("userId")
        != user_id
    ):
        raise HTTPException(
            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "This assignment does not belong to the current user.",
        )

    data["assignmentId"] = (
        assignment_id
    )

    return (
        document_ref,
        data,
    )


@router.post(
    "/generate",
    response_model=
        AssignmentListResponse,
)
def generate_assignments(
    current_user: dict = Depends(
        get_current_user
    ),
):
    user_id = get_user_id(
        current_user
    )

    existing_assignments = (
        get_user_assignments(
            user_id
        )
    )

    # ----------------------------------------
    # Prevent duplicate assignment generation.
    # ----------------------------------------

    if existing_assignments:
        if (
            len(
                existing_assignments
            )
            != 10
        ):
            raise HTTPException(
                status_code=
                    status.HTTP_409_CONFLICT,

                detail=(
                    "The user already has an "
                    "incomplete assignment set. "
                    "Expected 10 assignments."
                ),
            )

        completed_count = sum(
            1
            for assignment
            in existing_assignments
            if assignment.get(
                "status"
            )
            == "completed"
        )

        return {
            "assignments":
                existing_assignments,

            "totalCount":
                len(
                    existing_assignments
                ),

            "completedCount":
                completed_count,
        }


    # ----------------------------------------
    # Every workout appears once in each
    # study condition.
    # ----------------------------------------

    assignment_specs = []

    for workout_id in (
        WORKOUT_IDS
    ):
        assignment_specs.append({
            "workoutId":
                workout_id,

            "condition":
                "gamified",
        })

        assignment_specs.append({
            "workoutId":
                workout_id,

            "condition":
                "non-gamified",
        })


    # ----------------------------------------
    # Randomize the order independently for
    # each participant.
    # ----------------------------------------

    random.shuffle(
        assignment_specs
    )


    batch = db.batch()

    collection = (
        db.collection(
            "workoutAssignments"
        )
    )


    for index, specification in (
        enumerate(
            assignment_specs,
            start=1,
        )
    ):
        assignment_ref = (
            collection.document()
        )

        assignment_data = {
            "assignmentId":
                assignment_ref.id,

            "userId":
                user_id,

            "workoutId":
                specification[
                    "workoutId"
                ],

            "condition":
                specification[
                    "condition"
                ],

            "order":
                index,

            "status":
                "assigned",

            "assignedAt":
                firestore.SERVER_TIMESTAMP,

            "startedAt":
                None,

            "completedAt":
                None,
        }

        batch.set(
            assignment_ref,
            assignment_data,
        )


    batch.commit()


    assignments = (
        get_user_assignments(
            user_id
        )
    )


    return {
        "assignments":
            assignments,

        "totalCount":
            len(assignments),

        "completedCount":
            0,
    }


@router.get(
    "/me",
    response_model=
        AssignmentListResponse,
)
def get_my_assignments(
    current_user: dict = Depends(
        get_current_user
    ),
):
    user_id = get_user_id(
        current_user
    )

    assignments = (
        get_user_assignments(
            user_id
        )
    )

    completed_count = sum(
        1
        for assignment
        in assignments
        if assignment.get(
            "status"
        )
        == "completed"
    )


    return {
        "assignments":
            assignments,

        "totalCount":
            len(assignments),

        "completedCount":
            completed_count,
    }


@router.get(
    "/next",
    response_model=
        NextAssignmentResponse,
)
def get_next_assignment(
    current_user: dict = Depends(
        get_current_user
    ),
):
    user_id = get_user_id(
        current_user
    )

    assignments = (
        get_user_assignments(
            user_id
        )
    )


    if not assignments:
        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=(
                "No workout assignments "
                "have been generated yet."
            ),
        )


    completed_count = sum(
        1
        for assignment
        in assignments
        if assignment.get(
            "status"
        )
        == "completed"
    )


    next_assignment = (
        get_next_incomplete_assignment(
            assignments
        )
    )


    return {
        "assignment":
            next_assignment,

        "totalCount":
            len(assignments),

        "completedCount":
            completed_count,

        "allCompleted":
            next_assignment
            is None,
    }


@router.post(
    "/{assignment_id}/start",
    response_model=
        AssignmentResponse,
)
def start_assignment(
    assignment_id: str,

    current_user: dict = Depends(
        get_current_user
    ),
):
    user_id = get_user_id(
        current_user
    )

    (
        assignment_ref,
        assignment,
    ) = get_assignment_for_user(
        assignment_id,
        user_id,
    )


    if (
        assignment.get(
            "status"
        )
        == "completed"
    ):
        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "This assignment has already been completed.",
        )


    # --------------------------------------------------------
    # ENFORCE STUDY ORDER ON THE BACKEND.
    # The UI already shows only the next assignment, but the
    # API must also prevent a participant from starting a
    # later assignment directly by ID.
    # --------------------------------------------------------

    assignments = (
        get_user_assignments(
            user_id
        )
    )

    next_assignment = (
        get_next_incomplete_assignment(
            assignments
        )
    )

    if next_assignment is None:
        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "All assigned study workouts have already been completed.",
        )

    if (
        next_assignment.get(
            "assignmentId"
        )
        != assignment_id
    ):
        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=(
                "This is not the next available workout assignment. "
                "Complete the earlier assignment first."
            ),
        )


    current_status = (
        assignment.get(
            "status"
        )
    )

    if current_status == "survey_pending":
        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=(
                "Complete the post-workout survey before starting "
                "another workout."
            ),
        )

    if current_status not in (
        "assigned",
        "in_progress",
    ):
        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "This assignment is not in a startable state.",
        )


    update_fields = {}

    if current_status == "assigned":
        update_fields.update({
            "status":
                "in_progress",

            "startedAt":
                firestore.SERVER_TIMESTAMP,
        })

    # Assign only a challenge that is possible for the actual workout.
    # The challenge is then stored on the assignment so it stays stable
    # across app restarts and workout discards.
    if assignment.get("condition") == "gamified":
        workout_document = (
            db.collection("workouts")
            .document(assignment.get("workoutId"))
            .get()
        )

        if not workout_document.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned workout definition was not found.",
            )

        workout_data = workout_document.to_dict() or {}
        eligible_challenge_ids = get_eligible_challenge_ids(
            workout_data
        )

        if not eligible_challenge_ids:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This workout has no valid exercise sets for a "
                    "gamification challenge."
                ),
            )

        current_challenge_id = assignment.get("challengeId")
        challenge_is_valid = (
            current_challenge_id in eligible_challenge_ids
        )

        # This also repairs older assignments that may already contain an
        # impossible challenge from before feasibility filtering existed.
        if not challenge_is_valid:
            date_key = (
                datetime.now(timezone.utc)
                .date()
                .isoformat()
            )

            used_challenge_ids = {
                item.get("challengeId")
                for item in assignments
                if (
                    item.get("condition") == "gamified"
                    and item.get("challengeId")
                    and item.get("assignmentId") != assignment_id
                )
            }

            challenge = select_daily_challenge(
                user_id=user_id,
                assignment_id=assignment_id,
                date_key=date_key,
                excluded_ids=used_challenge_ids,
                eligible_ids=eligible_challenge_ids,
            )

            update_fields.update({
                "challengeId": challenge["id"],
                "challengeAssignedDate": date_key,
            })

    if update_fields:
        assignment_ref.update(
            update_fields
        )


    updated_document = (
        assignment_ref.get()
    )

    updated_assignment = (
        updated_document.to_dict()
        or {}
    )

    updated_assignment[
        "assignmentId"
    ] = assignment_id

    if (
        updated_assignment.get("condition") == "gamified"
        and updated_assignment.get("challengeId")
    ):
        updated_assignment["challenge"] = (
            get_challenge_definition(
                updated_assignment.get("challengeId")
            )
        )


    return updated_assignment

@router.post(
    "/{assignment_id}/discard",
    response_model=AssignmentResponse,
)
def discard_assignment(
    assignment_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Discard unsaved workout progress and reset the assignment.

    A discard is allowed only before a workout result has been submitted.
    The gamified challenge is intentionally preserved so participants cannot
    reroll challenges by repeatedly discarding and restarting a workout.
    """

    user_id = get_user_id(current_user)

    assignment_ref, assignment = get_assignment_for_user(
        assignment_id,
        user_id,
    )

    current_status = assignment.get("status")

    if current_status == "survey_pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "The workout has already been submitted. Complete the "
                "post-workout survey instead of discarding it."
            ),
        )

    if current_status == "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A completed assignment cannot be discarded.",
        )

    result_document = (
        db.collection("workoutResults")
        .document(assignment_id)
        .get()
    )

    if result_document.exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A workout result already exists for this assignment and "
                "cannot be discarded."
            ),
        )

    if current_status == "in_progress":
        assignment_ref.update({
            "status": "assigned",
            "startedAt": None,
            "lastDiscardedAt": firestore.SERVER_TIMESTAMP,
        })
    elif current_status != "assigned":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This assignment is not in a discardable state.",
        )

    updated_document = assignment_ref.get()
    updated_assignment = updated_document.to_dict() or {}
    updated_assignment["assignmentId"] = assignment_id

    if (
        updated_assignment.get("condition") == "gamified"
        and updated_assignment.get("challengeId")
    ):
        updated_assignment["challenge"] = get_challenge_definition(
            updated_assignment.get("challengeId")
        )

    return updated_assignment

