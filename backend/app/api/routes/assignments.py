import random

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


    next_assignment = next(
        (
            assignment
            for assignment
            in assignments
            if assignment.get(
                "status"
            )
            != "completed"
        ),
        None,
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


    if (
        assignment.get(
            "status"
        )
        == "assigned"
    ):
        assignment_ref.update({
            "status":
                "in_progress",

            "startedAt":
                firestore.SERVER_TIMESTAMP,
        })


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


    return updated_assignment