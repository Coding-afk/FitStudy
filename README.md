# FitStudy

FitStudy is a React Native mobile fitness research application designed to compare user engagement and workout participation between **gamified** and **non-gamified** workout experiences.

Each participant completes ten study workouts:

- 5 gamified workouts
- 5 non-gamified workouts

The order is randomized for each participant while ensuring that the same five workout routines are completed once under each condition.

FitStudy records workout completion and post-workout survey data so that the two conditions can be compared during research analysis.

---

## Main Features

### Authentication and Participant Management

- Participant registration
- Username-based login
- Persistent Firebase authentication
- Logout
- Change username
- Change password
- Delete account
- Participant profile
- Health screening and eligibility checks

### Study Workouts

- 10 randomized study assignments
- 5 gamified workouts
- 5 non-gamified workouts
- Same workout routines used across both conditions
- Set and repetition tracking
- Timed exercises
- Workout completion tracking
- Workout discard/restart functionality
- Assignment-order protection

### Gamification

Gamification features are enabled only during gamified workout sessions.

Features include:

- XP
- Levels
- Badges
- Daily workout challenges
- Leaderboard
- Challenge rewards
- Final Perfect Workout reward

Non-gamified workouts use the same underlying workout structure without gamification elements.

### Post-Workout Survey

After completing a study workout, participants must complete a short survey before the next workout becomes available.

Survey questions capture:

- Motivation
- Engagement
- Ease of use
- Perceived consistency
- Perceived usefulness

Each survey is linked to the exact workout assignment and condition.

### Perfect Workout

After completing all 10 study workouts and their surveys, the participant unlocks the **Perfect Workout**.

The Perfect Workout:

- is separate from the research study assignments
- does not increase study completion counters
- does not award additional study XP
- can be replayed
- awards the FitStudy Complete reward after its first full completion

---

# Technology Stack

## Frontend

- React Native
- JavaScript / JSX
- React Navigation
- Axios
- Firebase JavaScript SDK
- AsyncStorage
- react-native-sound

## Backend

- Python
- FastAPI
- Pydantic
- Firebase Admin SDK
- Pytest

## Database and Authentication

- Firebase Authentication
- Cloud Firestore

---

# Architecture

The application follows the general structure:

```text
React Native Mobile App
        |
        | Firebase Authentication
        |
        | REST API requests
        | Firebase ID Token
        v
     FastAPI
        |
        | Firebase Admin SDK
        v
 Cloud Firestore
```

Firebase Authentication manages participant authentication.

The React Native frontend sends authenticated requests to the FastAPI backend.

FastAPI validates the Firebase ID token and uses the Firebase Admin SDK to securely read and write participant data in Cloud Firestore.

---

# Main Firestore Collections

The application uses the following main Firestore collections:

```text
users
onboarding
workouts
workoutAssignments
workoutResults
survey_responses
gamificationStats
rewardCompletions
```

### users

Stores participant profile information and overall study progress.

### onboarding

Stores health-screening responses and eligibility information.

### workouts

Stores reusable workout definitions.

Study workouts:

```text
W001
W002
W003
W004
W005
```

Bonus workout:

```text
PERFECT001
```

### workoutAssignments

Stores each participant's randomized sequence of ten study assignments.

### workoutResults

Stores completed-set and workout performance information.

### survey_responses

Stores one post-workout survey response for each completed study assignment.

### gamificationStats

Stores XP, level, badge and gamification information.

### rewardCompletions

Stores Perfect Workout completion and replay information.

---

# Project Structure

```text
FitStudy/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── scripts/
│   ├── tests/
│   │
│   ├── secrets/
│   │   └── .gitkeep
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── android/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── navigation/
│   │   ├── screens/
│   │   └── services/
│   │
│   ├── App.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

# Firebase Admin Credentials

The Firebase Admin service-account credential is intentionally **not included in this repository** because it contains a private authentication key.

To run the backend against the FitStudy Firebase project, the authorized credential must be placed at:

```text
backend/secrets/firebase-admin.json
```

The credential will be supplied privately to the lecturer or marker if local execution of the project is required.

The Firebase Admin credential must never be committed to GitHub.

---

# Requirements

Before running the project, the following software should be installed:

- Python 3
- Node.js
- npm
- Android Studio
- Android SDK
- Java / JDK
- Git

An Android emulator should also be configured through Android Studio.

---

# Backend Setup

From the FitStudy project root, navigate to the backend:

```cmd
cd backend
```

Create a Python virtual environment:

```cmd
python -m venv .venv
```

Activate the virtual environment on Windows:

```cmd
.venv\Scripts\activate
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```cmd
pip install -r requirements.txt
```

Place the Firebase Admin credential at:

```text
backend/secrets/firebase-admin.json
```

Start the FastAPI backend:

```cmd
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The FastAPI documentation can then be viewed at:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open a second terminal and navigate to the frontend:

```cmd
cd frontend
```

Install the frontend dependencies:

```cmd
npm install
```

Start Metro:

```cmd
npm start -- --port 8081
```

Leave Metro running.

Open another terminal and run:

```cmd
cd frontend
adb reverse tcp:8081 tcp:8081
npm run android
```

---

# Android Emulator API Address

When FastAPI is running locally on the same computer as the Android emulator, the frontend connects to:

```text
http://10.0.2.2:8000
```

`10.0.2.2` is the Android emulator's special address for accessing the host computer's localhost.

---

# Running Backend Tests

Navigate to the backend and activate the virtual environment:

```cmd
cd backend
.venv\Scripts\activate
```

Run the test suite:

```cmd
python -m pytest -q
```

The test suite covers important application logic including:

- gamification
- workout validation
- daily challenge validation
- health-screening logic
- assignment validation
- workout-result validation

---

# Study Flow

A normal participant follows this flow:

```text
Welcome
   |
Register / Login
   |
Health Screening
   |
Home
   |
Assigned Workout
   |
Gamified OR Non-Gamified Workout
   |
Workout Result
   |
Post-Workout Survey
   |
Next Assignment
   |
Repeat until 10 / 10
   |
Perfect Workout
   |
FitStudy Complete
```

The next study assignment remains locked while the previous workout's survey is still pending.

---

# Assignment Status Flow

Study assignments use the following status progression:

```text
assigned
    |
in_progress
    |
survey_pending
    |
completed
```

If a workout is discarded before completion, the assignment returns to:

```text
assigned
```

For gamified workouts, the same challenge is retained after a discard so that participants cannot repeatedly restart workouts to reroll challenges.

---

# Authentication Notes

Participants log in using a username and password.

Internally, Firebase Authentication requires an email-shaped identifier.

FitStudy therefore converts the username into an internal Firebase identifier such as:

```text
username@fitstudy.app
```

This value is not displayed to participants and is not stored as the participant's visible email address in Firestore.

---

# Account Management

Participants can manage their account through the Account screen.

Available actions include:

- Change username
- Change password
- Logout
- Delete account

Changing a username also changes the participant's internal Firebase login identifier.

For this reason, the participant is signed out after a successful username change and must log in again using the new username.

Account deletion requires recent authentication before the participant's account and participant-owned Firestore data are removed.

---

# Security Notes

The repository intentionally excludes sensitive or generated files such as:

```text
backend/secrets/firebase-admin.json
backend/.venv/
frontend/node_modules/
__pycache__/
.pytest_cache/
frontend/android/.gradle/
frontend/android/app/build/
frontend/android/app/.cxx/
```

Firebase Admin credentials should only be shared privately with authorized assessors if local execution is required.

The development authentication bypass must not be enabled during normal Firebase authentication testing or deployment.

---

# Data Integrity

FitStudy contains several protections to maintain research data integrity.

These include:

- assignment ownership validation
- assignment-order protection
- duplicate workout-result protection
- duplicate survey protection
- server-side challenge validation
- server-side workout-result validation
- survey gating before the next assignment is unlocked
- separate storage of gamified and non-gamified conditions
- separate storage of the Perfect Workout reward from the ten study assignments

---

# Demonstration

A demonstration video is provided as part of the Deliverable 4 submission.

The video demonstrates the main functionality of FitStudy, including:

- registration and login
- health screening
- participant eligibility handling
- randomized workout assignments
- gamified workouts
- non-gamified workouts
- timed exercises
- daily challenges
- XP and badges
- post-workout surveys
- leaderboard
- participant profile and settings
- username and password changes
- Perfect Workout
- Firestore data persistence

---

# Academic Project

FitStudy was developed as part of the **ITMDA3-34 Mobile Application Development** project.

The application is an academic research prototype designed to investigate the effect of gamification on participant workout engagement and consistency.

The project uses the same underlying workout routines in gamified and non-gamified conditions so that the primary difference between the two conditions is the presence or absence of gamification features.
