"""Participant profile, screening, username, and secure account-deletion endpoints."""

import re
import time

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth as firebase_auth
from firebase_admin import firestore

from app.core.auth import get_current_user
from app.core.firebase import db
from app.models.user_profile import (
    ScreeningResponse,
    ScreeningSubmission,
    UserProfile,
    UserProfileCreate,
    UsernameUpdate,
)
from app.services.screening_logic import evaluate_screening


router = APIRouter(
    prefix='/profile',
    tags=['Profile'],
)


# Translate Firestore field names into the compact participant-facing profile model.
def build_profile(user_id: str, data: dict) -> UserProfile:
    # Backward compatibility: earlier builds used onboardingCompleted rather
    # than screeningCompleted/screeningPassed. A user who already completed
    # that flow should not be forced through screening again after an update.
    legacy_completed = data.get('onboardingCompleted', False)
    screening_completed = data.get('screeningCompleted', legacy_completed)
    screening_passed = data.get('screeningPassed', legacy_completed)

    default_status = 'active' if screening_completed and screening_passed else 'screening_required'

    return UserProfile(
        name=data.get('username', 'Participant'),
        studyId=data.get('participantId', user_id),
        group=data.get('role', 'participant'),
        completedGamified=data.get('gamifiedCompleted', 0),
        completedNonGamified=data.get('nonGamifiedCompleted', 0),
        studyStatus=data.get('studyStatus', default_status),
        screeningCompleted=screening_completed,
        screeningPassed=screening_passed,
        consentAccepted=data.get('consentAccepted', legacy_completed),
    )


@router.get('')
def get_profile(user=Depends(get_current_user)):
    user_id = user.get('uid')

    if not user_id:
        raise HTTPException(status_code=401, detail='User not authenticated')

    document = db.collection('users').document(user_id).get()

    if not document.exists:
        raise HTTPException(status_code=404, detail='User profile not found')

    return build_profile(user_id, document.to_dict() or {})


@router.put('')
def save_profile(
    profile: UserProfileCreate,
    user=Depends(get_current_user),
):
    user_id = user.get('uid')

    if not user_id:
        raise HTTPException(status_code=401, detail='User not authenticated')

    user_ref = db.collection('users').document(user_id)
    existing = user_ref.get()
    existing_data = existing.to_dict() or {}

    user_data = {
        'userId': user_id,
        'username': profile.username,
        'participantId': profile.participantId,
        'role': existing_data.get('role', 'participant'),
        'updatedAt': firestore.SERVER_TIMESTAMP,
    }

    if not existing.exists:
        user_data.update(
            {
                'createdAt': firestore.SERVER_TIMESTAMP,
                'studyStatus': 'screening_required',
                'screeningCompleted': False,
                'screeningPassed': False,
                'consentAccepted': False,
                'workoutsCompleted': 0,
                'gamifiedCompleted': 0,
                'nonGamifiedCompleted': 0,
                'finalRewardUnlocked': False,
                'finalRewardCompleted': False,
            }
        )

    # Do not store Firebase's internal synthetic email in Firestore.
    # This also removes the legacy field the next time an existing profile is saved.
    if existing.exists and 'email' in existing_data:
        user_ref.update({'email': firestore.DELETE_FIELD})

    user_ref.set(user_data, merge=True)

    saved_data = user_ref.get().to_dict() or user_data
    return build_profile(user_id, saved_data)


@router.post('/screening', response_model=ScreeningResponse)
# Persist both detailed screening answers and the summarized eligibility flags used
# by app startup/login to decide whether the participant may enter the study.
def submit_screening(
    screening: ScreeningSubmission,
    user=Depends(get_current_user),
):
    user_id = user.get('uid')

    if not user_id:
        raise HTTPException(status_code=401, detail='User not authenticated')

    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=404,
            detail='Create the participant profile before submitting screening.',
        )

    user_data = user_doc.to_dict() or {}

    if user_data.get('studyStatus') == 'ineligible':
        return ScreeningResponse(
            outcome='blocked',
            message=(
                'Based on your saved health screening, you are not eligible '
                'to participate in this study.'
            ),
            screeningCompleted=True,
            screeningPassed=False,
            studyStatus='ineligible',
        )

    if (
        user_data.get('screeningCompleted') is True
        and user_data.get('screeningPassed') is True
        and user_data.get('studyStatus') == 'active'
    ):
        return ScreeningResponse(
            outcome='eligible',
            message='Your health screening has already been completed.',
            screeningCompleted=True,
            screeningPassed=True,
            studyStatus='active',
        )

    screening_dict = screening.model_dump()
    outcome = evaluate_screening(screening_dict)

    screening_ref = db.collection('onboarding').document(user_id)
    existing_screening = screening_ref.get()

    screening_record = {
        'userId': user_id,
        'participantId': user_data.get('participantId', user_id),
        'heartCondition': screening.heartCondition,
        'injury': screening.injury,
        'pregnant': screening.pregnant,
        'asthma': screening.asthma,
        'medication': screening.medication,
        'ageRange': screening.ageRange,
        'fitnessLevel': screening.fitnessLevel,
        'exerciseFrequency': screening.exerciseFrequency,
        'warningAcknowledged': screening.warningAcknowledged,
        'outcome': outcome,
        'updatedAt': firestore.SERVER_TIMESTAMP,
    }

    if not existing_screening.exists:
        screening_record['submittedAt'] = firestore.SERVER_TIMESTAMP

    if outcome == 'blocked':
        screening_record['completedAt'] = firestore.SERVER_TIMESTAMP

        batch = db.batch()
        batch.set(screening_ref, screening_record, merge=True)
        batch.set(
            user_ref,
            {
                'studyStatus': 'ineligible',
                'screeningCompleted': True,
                'screeningPassed': False,
                'consentAccepted': True,
                'screeningCompletedAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )
        batch.commit()

        return ScreeningResponse(
            outcome='blocked',
            message=(
                'Based on your health screening answers, we are unable to '
                'include you in this study for your safety.'
            ),
            screeningCompleted=True,
            screeningPassed=False,
            studyStatus='ineligible',
        )

    if outcome == 'warning' and not screening.warningAcknowledged:
        batch = db.batch()
        batch.set(screening_ref, screening_record, merge=True)
        batch.set(
            user_ref,
            {
                'studyStatus': 'screening_warning',
                'screeningCompleted': False,
                'screeningPassed': False,
                'consentAccepted': False,
                'updatedAt': firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )
        batch.commit()

        return ScreeningResponse(
            outcome='warning',
            message=(
                'One or more of your answers may require extra care during '
                'physical activity. You may continue only after acknowledging '
                'this warning.'
            ),
            screeningCompleted=False,
            screeningPassed=False,
            studyStatus='screening_warning',
        )

    screening_record['completedAt'] = firestore.SERVER_TIMESTAMP

    batch = db.batch()
    batch.set(screening_ref, screening_record, merge=True)
    batch.set(
        user_ref,
        {
            'studyStatus': 'active',
            'screeningCompleted': True,
            'screeningPassed': True,
            'consentAccepted': True,
            'screeningCompletedAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )
    batch.commit()

    return ScreeningResponse(
        outcome='eligible',
        message='Health screening completed successfully.',
        screeningCompleted=True,
        screeningPassed=True,
        studyStatus='active',
    )



# ============================================================
# ACCOUNT DELETION
# ============================================================

_ACCOUNT_DELETE_REAUTH_WINDOW_SECONDS = 300
_DELETE_BATCH_SIZE = 400


# Account deletion is destructive, so require a freshly issued token whose auth_time
# proves that the participant recently re-entered their password in the app.
def _require_recent_reauthentication(user: dict) -> None:
    """Require a recently refreshed Firebase token for destructive actions.

    The frontend re-authenticates with the participant's current password and
    then forces a fresh ID token. Firebase includes that sign-in time as
    ``auth_time`` in the verified token used by this backend.
    """

    if user.get('devBypass'):
        return

    auth_time = int(user.get('auth_time', 0) or 0)

    if (
        auth_time <= 0
        or time.time() - auth_time > _ACCOUNT_DELETE_REAUTH_WINDOW_SECONDS
    ):
        raise HTTPException(
            status_code=401,
            detail='Please confirm your current password before deleting your account.',
        )


# Gather only documents owned by this participant. Shared workout definitions are
# deliberately excluded so account deletion cannot damage data used by other users.
def _collect_participant_document_refs(user_id: str):
    """Return only Firestore documents owned by this participant.

    Shared workout definitions are intentionally excluded. The extra userId
    queries also catch older records whose document IDs may not follow the
    current assignment-based naming convention.
    """

    refs = [
        db.collection('users').document(user_id),
        db.collection('onboarding').document(user_id),
        db.collection('gamificationStats').document(user_id),
    ]

    # Assignments are queried first because current workout results and survey
    # responses use assignmentId as their Firestore document ID.
    assignment_documents = list(
        db.collection('workoutAssignments')
        .where('userId', '==', user_id)
        .stream()
    )

    for assignment_document in assignment_documents:
        assignment_id = assignment_document.id
        refs.append(assignment_document.reference)
        refs.append(db.collection('workoutResults').document(assignment_id))
        refs.append(db.collection('survey_responses').document(assignment_id))

        # Older project builds used surveyResponses without the underscore.
        # Deleting the legacy path is harmless when no such document exists.
        refs.append(db.collection('surveyResponses').document(assignment_id))

    # These queries provide migration-safe cleanup if an old document has the
    # correct userId but a non-standard document ID.
    for collection_name in (
        'workoutResults',
        'survey_responses',
        'surveyResponses',
        'rewardCompletions',
    ):
        documents = (
            db.collection(collection_name)
            .where('userId', '==', user_id)
            .stream()
        )
        refs.extend(document.reference for document in documents)

    # De-duplicate references because current records may be found both by
    # assignment ID and by the userId query above.
    unique_refs = {}
    for ref in refs:
        unique_refs[ref.path] = ref

    return list(unique_refs.values())


# Firestore batches have a write limit, so delete participant documents in chunks.
def _delete_document_refs(document_refs) -> int:
    """Delete Firestore references in safe batches below Firestore's limit."""

    deleted_count = 0

    for start in range(0, len(document_refs), _DELETE_BATCH_SIZE):
        batch = db.batch()
        batch_refs = document_refs[start:start + _DELETE_BATCH_SIZE]

        for document_ref in batch_refs:
            batch.delete(document_ref)

        batch.commit()
        deleted_count += len(batch_refs)

    return deleted_count


@router.delete('')
# Full CRUD delete operation: remove participant-owned Firestore data first, then
# delete the Firebase Auth account so the same credentials can no longer sign in.
def delete_account(user=Depends(get_current_user)):
    """Permanently delete the authenticated participant and owned study data."""

    user_id = user.get('uid')

    if not user_id:
        raise HTTPException(status_code=401, detail='User not authenticated')

    _require_recent_reauthentication(user)

    try:
        document_refs = _collect_participant_document_refs(user_id)
        _delete_document_refs(document_refs)
    except Exception as error:
        print('ACCOUNT DATA DELETION ERROR:', error)
        raise HTTPException(
            status_code=500,
            detail='Unable to delete participant data. Please try again.',
        ) from error

    # Firebase Auth is deleted last. If this step fails, the user can still
    # authenticate and retry the deletion instead of being locked out while
    # Firestore cleanup remains incomplete.
    if not user.get('devBypass'):
        try:
            firebase_auth.delete_user(user_id)
        except firebase_auth.UserNotFoundError:
            # Treat an already-missing Auth user as successfully deleted.
            pass
        except Exception as error:
            print('AUTH ACCOUNT DELETION ERROR:', error)
            raise HTTPException(
                status_code=500,
                detail=(
                    'Participant data was removed, but the authentication '
                    'account could not be deleted. Please try Delete Account again.'
                ),
            ) from error

    return {
        'message': 'Account and participant data deleted successfully.',
    }


# ============================================================
# USERNAME CHANGE
# ============================================================

_USERNAME_PATTERN = re.compile(r'^[A-Za-z0-9_]{3,20}$')
_USERNAME_REAUTH_WINDOW_SECONDS = 300


# Username changes also update the hidden Firebase email-shaped login identifier.
def _synthetic_email(username: str) -> str:
    return f"{username.strip().lower()}@fitstudy.app"


@router.patch('/username')
def change_username(
    payload: UsernameUpdate,
    user=Depends(get_current_user),
):
    """Change the participant's visible username and Firebase login identifier.

    The app re-authenticates the user with their current password immediately
    before calling this route. We verify the Firebase token's auth_time so a
    stale signed-in session cannot silently change account credentials.
    """

    user_id = user.get('uid')

    if not user_id:
        raise HTTPException(status_code=401, detail='User not authenticated')

    username = payload.username.strip()

    if not _USERNAME_PATTERN.fullmatch(username):
        raise HTTPException(
            status_code=400,
            detail=(
                'Username must be 3-20 characters and contain only letters, '
                'numbers, and underscores.'
            ),
        )

    if not user.get('devBypass'):
        auth_time = int(user.get('auth_time', 0) or 0)
        if auth_time <= 0 or time.time() - auth_time > _USERNAME_REAUTH_WINDOW_SECONDS:
            raise HTTPException(
                status_code=401,
                detail='Please confirm your current password before changing username.',
            )

    user_ref = db.collection('users').document(user_id)
    user_document = user_ref.get()

    if not user_document.exists:
        raise HTTPException(status_code=404, detail='User profile not found')

    user_data = user_document.to_dict() or {}
    old_username = str(user_data.get('username', '') or '').strip()

    if old_username.lower() == username.lower():
        raise HTTPException(
            status_code=400,
            detail='Choose a username different from your current username.',
        )

    new_email = _synthetic_email(username)
    old_email = user.get('email') or (
        _synthetic_email(old_username) if old_username else None
    )

    # Firebase Authentication is the source of truth for username uniqueness,
    # because usernames are represented internally as synthetic email addresses.
    try:
        existing_auth_user = firebase_auth.get_user_by_email(new_email)
        if existing_auth_user.uid != user_id:
            raise HTTPException(
                status_code=409,
                detail='That username is already taken.',
            )
    except firebase_auth.UserNotFoundError:
        pass

    auth_updated = False

    try:
        if not user.get('devBypass'):
            firebase_auth.update_user(
                user_id,
                email=new_email,
            )
            auth_updated = True

        user_ref.update({
            'username': username,
            'updatedAt': firestore.SERVER_TIMESTAMP,
        })
    except firebase_auth.EmailAlreadyExistsError as error:
        raise HTTPException(
            status_code=409,
            detail='That username is already taken.',
        ) from error
    except HTTPException:
        raise
    except Exception as error:
        # Avoid leaving Firebase Auth and Firestore with different usernames.
        if auth_updated and old_email:
            try:
                firebase_auth.update_user(
                    user_id,
                    email=old_email,
                )
            except Exception as rollback_error:
                print('USERNAME ROLLBACK ERROR:', rollback_error)

        print('USERNAME UPDATE ERROR:', error)
        raise HTTPException(
            status_code=500,
            detail='Unable to change username. Please try again.',
        ) from error

    updated_data = user_ref.get().to_dict() or {}
    return build_profile(user_id, updated_data)
