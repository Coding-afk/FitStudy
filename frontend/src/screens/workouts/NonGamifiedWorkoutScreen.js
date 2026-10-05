import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import ExerciseCard from '../../components/workouts/ExerciseCard';

import WorkoutHeader from '../../components/workouts/WorkoutHeader';

import { getWorkout, saveWorkoutResult } from '../../services/workouts';

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

const getApiErrorMessage = error => {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map(item => {
        const location = item.loc ? item.loc.join(' → ') : 'Unknown';

        return `${location}: ${item.msg}`;
      })
      .join('\n');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return 'Unable to save workout.';
};

function NonGamifiedWorkoutScreen({
  // TODO:
  // Replace this temporary default with
  // Group 1's assignment/navigation workoutId.
  workoutId = 'W001',

  onCompleteWorkout = () => {},

  onDiscardWorkout = () => {},
}) {
  const [workout, setWorkout] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState('');

  const [saveError, setSaveError] = useState('');

  const [startedAt, setStartedAt] = useState(null);

  const [saving, setSaving] = useState(false);

  const loadWorkout = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      setSaveError('');

      const data = await getWorkout(workoutId);

      setWorkout(prepareWorkout(data));

      setStartedAt(new Date());
    } catch {
      setLoadError('Unable to load workout.');
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const changeValue = (exerciseId, setNumber, amount) => {
    setWorkout(previous => {
      if (!previous) {
        return previous;
      }

      return {
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
      };
    });
  };

  const toggleComplete = (exerciseId, setNumber) => {
    setWorkout(previous => {
      if (!previous) {
        return previous;
      }

      return {
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
      };
    });
  };

  const totalSets = workout
    ? workout.exerciseList.reduce(
        (total, exercise) => total + exercise.sets.length,
        0,
      )
    : 0;

  const completedSets = workout
    ? workout.exerciseList.reduce(
        (total, exercise) =>
          total + exercise.sets.filter(set => set.completed).length,
        0,
      )
    : 0;

  const allSetsCompleted = totalSets > 0 && completedSets === totalSets;

  const buildSummary = () => {
    if (!workout || !startedAt) {
      return null;
    }

    const completedAt = new Date();

    const completionTimeSeconds = Math.max(
      1,

      Math.round((completedAt.getTime() - startedAt.getTime()) / 1000),
    );

    const exerciseResults = workout.exerciseList.map(exercise => ({
      exerciseId: exercise.exerciseId,

      name: exercise.name,

      unit: exercise.unit,

      sets: exercise.sets.map(set => ({
        setNumber: set.setNumber,

        actualValue: set.value,

        completed: set.completed,
      })),
    }));

    return {
      workoutId: workout.workoutId,

      workoutName: workout.name,

      condition: 'non-gamified',

      startedAt: startedAt.toISOString(),

      completedAt: completedAt.toISOString(),

      completionTimeSeconds,

      completedSets,

      totalSets,

      exerciseResults,
    };
  };

  const saveAndCompleteWorkout = async () => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setSaveError('');

      const summary = buildSummary();

      if (!summary) {
        setSaveError('Unable to create workout summary.');

        return;
      }

      const resultPayload = {
        workoutId: summary.workoutId,

        condition: summary.condition,

        startedAt: summary.startedAt,

        completedAt: summary.completedAt,

        completionTimeSeconds: summary.completionTimeSeconds,

        exerciseResults: summary.exerciseResults,
      };

      await saveWorkoutResult(resultPayload);

      onCompleteWorkout(summary);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteWorkout = () => {
    if (allSetsCompleted) {
      saveAndCompleteWorkout();

      return;
    }

    Alert.alert(
      'Incomplete Workout',
      `You have completed ${completedSets} of ${totalSets} sets. Are you sure you want to complete the workout?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Complete Anyway',
          onPress: saveAndCompleteWorkout,
        },
      ],
    );
  };

  const handleDiscardWorkout = () => {
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout? Your current workout progress will not be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Discard',
          style: 'destructive',

          onPress: onDiscardWorkout,
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.loadingText}>Loading workout...</Text>
      </SafeAreaView>
    );
  }

  if (loadError || !workout) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {loadError || 'Workout not found.'}
        </Text>

        <Pressable style={styles.retryButton} onPress={loadWorkout}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WorkoutHeader
          workout={workout}
          completedSets={completedSets}
          totalSets={totalSets}
        />

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

        {saveError !== '' && (
          <Text style={styles.saveErrorText}>{saveError}</Text>
        )}

        <Pressable
          style={[
            styles.completeWorkoutButton,

            saving && styles.disabledButton,
          ]}
          disabled={saving}
          onPress={handleCompleteWorkout}
        >
          <Text style={styles.completeWorkoutText}>
            {saving ? 'Saving...' : 'Complete Workout'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.discardWorkoutButton}
          disabled={saving}
          onPress={handleDiscardWorkout}
        >
          <Text style={styles.discardWorkoutText}>Discard Workout</Text>
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

  centerContainer: {
    flex: 1,

    backgroundColor: COLORS.background,

    alignItems: 'center',
    justifyContent: 'center',

    padding: 24,
  },

  loadingText: {
    color: COLORS.textSecondary,

    fontSize: 15,

    marginTop: 14,
  },

  errorText: {
    color: COLORS.text,

    fontSize: 16,

    textAlign: 'center',

    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: COLORS.primary,

    paddingVertical: 12,
    paddingHorizontal: 24,

    borderRadius: 10,
  },

  retryButtonText: {
    color: COLORS.text,

    fontWeight: 'bold',
  },

  saveErrorText: {
    color: '#FF7070',

    textAlign: 'center',

    fontSize: 14,

    marginBottom: 12,
  },

  completeWorkoutButton: {
    backgroundColor: COLORS.primary,

    paddingVertical: 17,

    borderRadius: 14,

    alignItems: 'center',

    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  completeWorkoutText: {
    color: COLORS.text,

    fontSize: 17,
    fontWeight: 'bold',
  },

  discardWorkoutButton: {
    borderWidth: 1,

    borderColor: '#C65A5A',

    paddingVertical: 15,

    borderRadius: 14,

    alignItems: 'center',

    marginTop: 12,
  },

  discardWorkoutText: {
    color: '#FF7070',

    fontSize: 16,
    fontWeight: '600',
  },
});

export default NonGamifiedWorkoutScreen;
