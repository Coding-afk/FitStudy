import React, {useCallback, useEffect, useState} from 'react';

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

import {
  completePerfectWorkoutReward,
  getPerfectWorkoutReward,
} from '../../services/rewards';

import {COLORS} from '../../constants/theme';

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

        return `${location}: ${item.msg}`;
      })
      .join('\n');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return 'Unable to save the reward workout.';
};

function PerfectWorkoutScreen({navigation}) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [startedAt, setStartedAt] = useState(null);

  const loadWorkout = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getPerfectWorkoutReward();

      setWorkout(prepareWorkout(data));
      setStartedAt(new Date());
    } catch (requestError) {
      console.error('Unable to load Perfect Workout:', requestError);

      setError(
        requestError?.response?.data?.detail ||
          'Unable to load the Perfect Workout reward.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

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

  const buildPayload = () => {
    if (!workout || !startedAt) {
      return null;
    }

    const completedAt = new Date();

    const completionTimeSeconds = Math.max(
      1,
      Math.round((completedAt.getTime() - startedAt.getTime()) / 1000),
    );

    return {
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      completionTimeSeconds,

      exerciseResults: workout.exerciseList.map(exercise => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        unit: exercise.unit,

        sets: exercise.sets.map(set => ({
          setNumber: set.setNumber,
          actualValue: set.value,
          completed: set.completed,
        })),
      })),
    };
  };

  const saveRewardSession = async () => {
    if (saving) {
      return;
    }

    const payload = buildPayload();

    if (!payload) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await completePerfectWorkoutReward(payload);

      if (response.fullyCompleted) {
        navigation.replace(
          'PerfectWorkoutComplete',
          {
            completion: response,
          },
        );

        return;
      }

      Alert.alert(
        'Reward session saved',
        `You completed ${response.completedSets} of ${response.totalSets} sets. Complete every set in the Perfect Workout to earn the FitStudy Complete award.`,
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    if (totalSets > 0 && completedSets === totalSets) {
      saveRewardSession();
      return;
    }

    Alert.alert(
      'Finish reward workout?',
      `You have completed ${completedSets} of ${totalSets} sets. You can finish the session now or continue at your own pace.`,
      [
        {
          text: 'Keep Going',
          style: 'cancel',
        },
        {
          text: 'Finish Session',
          onPress: saveRewardSession,
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
        <Text style={styles.loadingText}>Loading your reward...</Text>
      </SafeAreaView>
    );
  }

  if (error && !workout) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Perfect Workout unavailable</Text>
        <Text style={styles.errorText}>{error}</Text>

        <Pressable style={styles.secondaryButton} onPress={loadWorkout}>
          <Text style={styles.secondaryButtonText}>Try again</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.rewardBanner}>
          <Text style={styles.rewardEyebrow}>
            {workout?.rewardCompleted
              ? 'REPLAYABLE REWARD'
              : 'UNLOCKED REWARD'}
          </Text>

          <Text style={styles.rewardText}>
            {workout?.rewardCompleted
              ? 'You already earned the FitStudy Complete award. Replaying this bonus workout will not change your study results, XP, or leaderboard position.'
              : 'This bonus workout does not change your study results or leaderboard XP.'}
          </Text>
        </View>

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
              changeValue(exerciseId, setNumber, -1)
            }
            onIncrease={(exerciseId, setNumber) =>
              changeValue(exerciseId, setNumber, 1)
            }
            onToggleComplete={toggleComplete}
          />
        ))}

        {error ? <Text style={styles.saveError}>{error}</Text> : null}

        <Pressable
          style={[styles.finishButton, saving && styles.disabledButton]}
          onPress={handleFinish}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.finishButtonText}>
              {workout?.rewardCompleted
                ? 'Finish replay'
                : 'Finish reward workout'}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Home</Text>
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

  container: {
    padding: 20,
    paddingBottom: 40,
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
    marginTop: 12,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },

  errorText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },

  rewardBanner: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primaryLight,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  rewardEyebrow: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  rewardText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  finishButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  finishButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },

  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: '700',
  },

  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },

  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  saveError: {
    color: '#e57373',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.6,
  },
});

export default PerfectWorkoutScreen;
