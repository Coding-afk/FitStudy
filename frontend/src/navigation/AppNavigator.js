import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

import NonGamifiedWorkoutScreen from '../screens/workouts/NonGamifiedWorkoutScreen';

import GamifiedWorkoutScreen from '../screens/workouts/GamifiedWorkoutScreen';

import WorkoutSummaryScreen from '../screens/workouts/WorkoutSummaryScreen';

import GamifiedWorkoutSummaryScreen from '../screens/workouts/GamifiedWorkoutSummaryScreen';

import GamificationStatsAwardsScreen from '../screens/gamificationstats/GamificationStatsAwardsScreen';

import PostWorkoutSurveyScreen from '../screens/survey/PostWorkoutSurveyScreen';
import WelcomeScreen from '../screens/welcome page/WelcomeScreen';
import RegisterScreen from '../screens/auth/registerPage';


import MainTabs from './MainTabs';

import {COLORS} from '../constants/theme';

const Stack = createNativeStackNavigator();

function NonGamifiedWorkoutRoute({
  navigation,
  route,
}) {
  const workoutId =
    route.params?.workoutId ?? 'W001';

  const participantId =
    route.params?.participantId ?? null;

  return (
    <NonGamifiedWorkoutScreen
      workoutId={workoutId}
      onCompleteWorkout={summary => {
        navigation.replace(
          'NonGamifiedSummary',
          {
            summary,
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
  const workoutId =
    route.params?.workoutId ?? 'W001';

  const participantId =
    route.params?.participantId ?? null;

  return (
    <GamifiedWorkoutScreen
      workoutId={workoutId}
      onCompleteWorkout={summary => {
        navigation.replace(
          'GamifiedSummary',
          {
            summary,
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

  const participantId =
    route.params?.participantId ?? null;

  return (
    <WorkoutSummaryScreen
      summary={summary}
      onDone={() => {
        navigation.replace(
          'PostWorkoutSurvey',
          {
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

  const participantId =
    route.params?.participantId ?? null;

  return (
    <GamifiedWorkoutSummaryScreen
      summary={summary}
      onDone={() => {
        navigation.replace(
          'PostWorkoutSurvey',
          {
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

function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,

        contentStyle: {
          backgroundColor:
            COLORS.background,
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />

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

        {/* GAMIFICATION STATS & AWARDS ROUTE */}
      <Stack.Screen
        name="GamificationStatsAwards"
        component={
          GamificationStatsAwardsScreen
        }
      />



    </Stack.Navigator>
  );
}

export default AppNavigator;