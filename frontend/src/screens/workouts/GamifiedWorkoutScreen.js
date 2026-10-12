import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ExerciseCard from '../../components/workouts/ExerciseCard';

import WorkoutHeader from '../../components/workouts/WorkoutHeader';

import ProgressRing from '../../components/gamification/ProgressRing';

import ChallengeCard from '../../components/gamification/ChallengeCard';

import XpPopup from '../../components/gamification/XpPopup';

import { getWorkout, saveWorkoutResult } from '../../services/workouts';

import { COLORS } from '../../constants/theme';

const prepareWorkout = data => ({
  ...data,

  exerciseList: [...(data.exerciseList ?? [])]
    .sort((a, b) => a.order - b.order)
    .map(exercise => ({
      ...exercise,

      sets: (exercise.targetValues ?? []).map((value, index) => ({
        setNumber: index + 1,

        value,

        completed: false,
      })),
    })),
});

const getApiErrorMessage = error => {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map(item => {
        const location = item.loc ? item.loc.join(' → ') : 'Unknown';

        return `${location}: ` + `${item.msg}`;
      })
      .join('\n');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return 'Unable to save workout.';
};

function GamifiedWorkoutScreen({
  assignmentId,

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

  const [xpPopup, setXpPopup] = useState(null);


  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      setLoadError('');
      setSaveError('');


      const workoutData = await getWorkout(workoutId);

      setWorkout(prepareWorkout(workoutData));

      setStartedAt(new Date());
    } catch (error) {
      console.log('Unable to load gamified workout:', error);

      setLoadError('Unable to load the gamified workout.');
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    if (!workout) {
      return;
    }

    const exercise = workout.exerciseList.find(
      item => item.exerciseId === exerciseId,
    );

    const selectedSet = exercise?.sets.find(set => set.setNumber === setNumber);

    if (!selectedSet) {
      return;
    }

    const becomingCompleted = !selectedSet.completed;

    setWorkout(previous => ({
      ...previous,

      exerciseList: previous.exerciseList.map(item => {
        if (item.exerciseId !== exerciseId) {
          return item;
        }

        return {
          ...item,

          sets: item.sets.map(set =>
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

    if (becomingCompleted) {
      setXpPopup({
        id: Date.now(),
        amount: 10,
      });
    }
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

  const progress =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

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
      assignmentId,

      workoutId: workout.workoutId,

      workoutName: workout.name,

      condition: 'gamified',

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
        assignmentId: summary.assignmentId,

        workoutId: summary.workoutId,

        condition: summary.condition,

        startedAt: summary.startedAt,

        completedAt: summary.completedAt,

        completionTimeSeconds: summary.completionTimeSeconds,

        exerciseResults: summary.exerciseResults,
      };

      const savedResult = await saveWorkoutResult(resultPayload);

      onCompleteWorkout({
        ...summary,

        fullyCompleted: savedResult.fullyCompleted,

        gamification: savedResult.gamification,
      });
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
          text: 'Keep Working',
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

        <Text style={styles.loadingText}>Loading gamified workout...</Text>
      </SafeAreaView>
    );
  }

  if (loadError || !workout) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {loadError || 'Workout not found.'}
        </Text>

        <Pressable style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {xpPopup && (
        <XpPopup
          key={xpPopup.id}
          amount={xpPopup.amount}
          onFinished={() => setXpPopup(null)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WorkoutHeader
          workout={workout}
          completedSets={completedSets}
          totalSets={totalSets}
        />

        <View style={styles.gamePanel}>
          <ProgressRing progress={progress} />

          <ChallengeCard performanceScore={progress} />
        </View>

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
          style={[styles.completeButton, saving && styles.disabledButton]}
          disabled={saving}
          onPress={handleCompleteWorkout}
        >
          <Text style={styles.completeButtonText}>
            {saving ? 'Saving...' : 'Complete Workout'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.discardButton}
          disabled={saving}
          onPress={handleDiscardWorkout}
        >
          <Text style={styles.discardButtonText}>Discard Workout</Text>
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
    marginTop: 14,
    fontSize: 15,
    textAlign: 'center',
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

  gamePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  saveErrorText: {
    color: '#FF7070',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },

  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  completeButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: 'bold',
  },

  discardButton: {
    borderWidth: 1,
    borderColor: '#C65A5A',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },

  discardButtonText: {
    color: '#FF7070',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GamifiedWorkoutScreen;
