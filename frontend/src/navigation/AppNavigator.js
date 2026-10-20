// Root stack navigation. Route-wrapper components translate navigation params
// into the simpler props expected by workout and summary screens.

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import NonGamifiedWorkoutScreen from '../screens/workouts/NonGamifiedWorkoutScreen';
import GamifiedWorkoutScreen from '../screens/workouts/GamifiedWorkoutScreen';
import WorkoutSummaryScreen from '../screens/workouts/WorkoutSummaryScreen';
import GamifiedWorkoutSummaryScreen from '../screens/workouts/GamifiedWorkoutSummaryScreen';
import GamificationStatsAwardsScreen from '../screens/gamificationstats/GamificationStatsAwardsScreen';
import PerfectWorkoutScreen from '../screens/workouts/PerfectWorkoutScreen';
import PerfectWorkoutCompleteScreen from '../screens/workouts/PerfectWorkoutCompleteScreen';
import PostWorkoutSurveyScreen from '../screens/survey/PostWorkoutSurveyScreen';
import WelcomeScreen from '../screens/welcome page/WelcomeScreen';
import RegisterScreen from '../screens/auth/registerPage';
import LoginScreen from '../screens/auth/loginPage';

import MainTabs from './MainTabs';
import {COLORS} from '../constants/theme';

const Stack = createNativeStackNavigator();

// Route adapters keep navigation-specific params out of reusable workout components.
function NonGamifiedWorkoutRoute({
  navigation,
  route,
}) {
  const assignmentId =
    route.params?.assignmentId ?? null;

  const workoutId =
    route.params?.workoutId ?? 'W001';

  const participantId =
    route.params?.participantId ?? null;

  return (
    <NonGamifiedWorkoutScreen
      assignmentId={assignmentId}
      workoutId={workoutId}
      onCompleteWorkout={summary => {
        navigation.replace(
          'NonGamifiedSummary',
          {
            summary,
            assignmentId,
            participantId,
          },
        );
      }}
      onDiscardWorkout={() => {
        navigation.goBack();
      }}
    />
  );
}

function GamifiedWorkoutRoute({
  navigation,
  route,
}) {
  const assignmentId =
    route.params?.assignmentId ?? null;

  const workoutId =
    route.params?.workoutId ?? 'W001';

  const participantId =
    route.params?.participantId ?? null;

  const challenge =
    route.params?.challenge ?? null;

  return (
    <GamifiedWorkoutScreen
      assignmentId={assignmentId}
      workoutId={workoutId}
      challenge={challenge}
      onCompleteWorkout={summary => {
        navigation.replace(
          'GamifiedSummary',
          {
            summary,
            assignmentId,
            participantId,
          },
        );
      }}
      onDiscardWorkout={() => {
        navigation.goBack();
      }}
    />
  );
}

function NonGamifiedSummaryRoute({
  navigation,
  route,
}) {
  const summary =
    route.params?.summary ?? null;

  const assignmentId =
    route.params?.assignmentId ??
    summary?.assignmentId ??
    null;

  const participantId =
    route.params?.participantId ?? null;

  return (
    <WorkoutSummaryScreen
      summary={summary}
      onDone={() => {
        navigation.replace(
          'PostWorkoutSurvey',
          {
            assignmentId,
            participantId,
            workoutId:
              summary?.workoutId ?? null,
            condition:
              'non-gamified',
          },
        );
      }}
    />
  );
}

function GamifiedSummaryRoute({
  navigation,
  route,
}) {
  const summary =
    route.params?.summary ?? null;

  const assignmentId =
    route.params?.assignmentId ??
    summary?.assignmentId ??
    null;

  const participantId =
    route.params?.participantId ?? null;

  return (
    <GamifiedWorkoutSummaryScreen
      summary={summary}
      onDone={() => {
        navigation.replace(
          'PostWorkoutSurvey',
          {
            assignmentId,
            participantId,
            workoutId:
              summary?.workoutId ?? null,
            condition:
              'gamified',
          },
        );
      }}
    />
  );
}


function PerfectWorkoutRoute({
  navigation,
}) {
  return (
    <PerfectWorkoutScreen
      navigation={navigation}
    />
  );
}

function AppNavigator({initialRouteName = 'Welcome'}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
      />

      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      <Stack.Screen
        name="NonGamifiedWorkout"
        component={
          NonGamifiedWorkoutRoute
        }
      />

      <Stack.Screen
        name="GamifiedWorkout"
        component={
          GamifiedWorkoutRoute
        }
      />

      <Stack.Screen
        name="NonGamifiedSummary"
        component={
          NonGamifiedSummaryRoute
        }
      />

      <Stack.Screen
        name="GamifiedSummary"
        component={
          GamifiedSummaryRoute
        }
      />

      <Stack.Screen
        name="PostWorkoutSurvey"
        component={
          PostWorkoutSurveyScreen
        }
      />

      <Stack.Screen
        name="GamificationStatsAwards"
        component={
          GamificationStatsAwardsScreen
        }
      />

      <Stack.Screen
        name="PerfectWorkout"
        component={PerfectWorkoutRoute}
      />

      <Stack.Screen
        name="PerfectWorkoutComplete"
        component={PerfectWorkoutCompleteScreen}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
