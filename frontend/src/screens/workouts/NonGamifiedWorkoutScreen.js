import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import ExerciseCard from '../../components/workouts/ExerciseCard';

import WorkoutHeader from '../../components/workouts/WorkoutHeader';

import { getWorkout } from '../../services/workouts';

import { COLORS } from '../../constants/theme';

const prepareWorkout = data => {
  const exercises = [...data.exerciseList]
    .sort((a, b) => a.order - b.order)
    .map(exercise => ({
      ...exercise,

      sets: exercise.targetValues.map((value, index) => ({
        setNumber: index + 1,
        value,
        completed: false,
      })),
    }));

  return {
    ...data,
    exerciseList: exercises,
  };
};

function NonGamifiedWorkoutScreen({ workoutId = 'W001' }) {
  const [workout, setWorkout] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  

  const loadWorkout = useCallback(async () => {
    try {
      setError('');

      const data = await getWorkout(workoutId);

      setWorkout(prepareWorkout(data));
    } catch (err) {
      console.log(err);

      setError('Unable to load workout.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [workoutId]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const changeValue = (exerciseId, setNumber, amount) => {
    setWorkout(previous => ({
      ...previous,

      exerciseList: previous.exerciseList.map(exercise => {
        if (exercise.exerciseId !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,

          sets: exercise.sets.map(set => {
            if (set.setNumber !== setNumber) {
              return set;
            }

            return {
              ...set,

              value: Math.max(0, set.value + amount),
            };
          }),
        };
      }),
    }));
  };

  const toggleComplete = (exerciseId, setNumber) => {
    setWorkout(previous => ({
      ...previous,

      exerciseList: previous.exerciseList.map(exercise => {
        if (exercise.exerciseId !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,

          sets: exercise.sets.map(set =>
            set.setNumber === setNumber
              ? {
                  ...set,

                  completed: !set.completed,
                }
              : set,
          ),
        };
      }),
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadWorkout();
            }}
            tintColor={COLORS.text}
          />
        }
      >
        <WorkoutHeader workout={workout} />

        {workout.exerciseList.map(exercise => (
          <ExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            onDecrease={(exerciseId, setNumber) =>
              changeValue(
                exerciseId,
                setNumber,

                exercise.unit === 'seconds' ? -5 : -1,
              )
            }
            onIncrease={(exerciseId, setNumber) =>
              changeValue(
                exerciseId,
                setNumber,

                exercise.unit === 'seconds' ? 5 : 1,
              )
            }
            onToggleComplete={toggleComplete}
          />
        ))}
        <Pressable style={styles.completeWorkoutButton} onPress={() => {}}>
          <Text style={styles.completeWorkoutText}>Complete Workout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,

    paddingBottom: 50,
  },

  loadingContainer: {
    flex: 1,

    backgroundColor: COLORS.background,

    alignItems: 'center',
    justifyContent: 'center',
  },

  error: {
    color: COLORS.text,

    fontSize: 16,
  },
  completeWorkoutButton: {
    backgroundColor: COLORS.primary,

    paddingVertical: 16,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 8,
    marginBottom: 30,
  },

  completeWorkoutText: {
    color: COLORS.text,

    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default NonGamifiedWorkoutScreen;
