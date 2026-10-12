import React, { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
  generateAssignments,
  getMyAssignments,
  getNextAssignment,
  startAssignment,
} from '../../services/assignments';

import { getWorkout } from '../../services/workouts';

import { COLORS } from '../../constants/theme';

export default function WorkoutSelectionScreen({ navigation }) {
  const tabBarHeight = useBottomTabBarHeight();

  const [assignment, setAssignment] = useState(null);

  const [completedAssignments, setCompletedAssignments] = useState([]);

  const [completedCount, setCompletedCount] = useState(0);

  const [totalCount, setTotalCount] = useState(10);

  const [allCompleted, setAllCompleted] = useState(false);

  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [starting, setStarting] = useState(false);

  const [error, setError] = useState('');

  const loadCompletedAssignments = useCallback(async assignments => {
    const completed = assignments.filter(item => item.status === 'completed');

    const withDetails = await Promise.all(
      completed.map(async item => {
        try {
          const workout = await getWorkout(item.workoutId);

          return {
            ...item,
            workout,
          };
        } catch (workoutError) {
          console.error('Failed to load completed workout:', workoutError);

          return {
            ...item,

            workout: {
              name: item.workoutId,
            },
          };
        }
      }),
    );

    withDetails.sort((a, b) => a.order - b.order);

    setCompletedAssignments(withDetails);
  }, []);

  const loadHome = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError('');

        let nextData;

        try {
          nextData = await getNextAssignment();
        } catch (requestError) {
          if (requestError?.response?.status === 404) {
            await generateAssignments();

            nextData = await getNextAssignment();
          } else {
            throw requestError;
          }
        }

        const allData = await getMyAssignments();

        const assignments = allData?.assignments ?? [];

        await loadCompletedAssignments(assignments);

        setCompletedCount(
          nextData?.completedCount ?? allData?.completedCount ?? 0,
        );

        setTotalCount(nextData?.totalCount ?? allData?.totalCount ?? 10);

        setAllCompleted(nextData?.allCompleted ?? false);

        setAssignment(nextData?.assignment ?? null);
      } catch (requestError) {
        console.error('Failed to load home:', requestError);

        const detail = requestError?.response?.data?.detail;

        setError(detail || 'Unable to load your workouts.');
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [loadCompletedAssignments],
  );

  useFocusEffect(
    useCallback(() => {
      loadHome(true);
    }, [loadHome]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    await loadHome(false);

    setRefreshing(false);
  }, [loadHome]);

  const handleStartWorkout = async () => {
    if (!assignment) {
      return;
    }

    try {
      setStarting(true);

      const startedAssignment = await startAssignment(assignment.assignmentId);

      const screenName =
        startedAssignment.condition === 'gamified'
          ? 'GamifiedWorkout'
          : 'NonGamifiedWorkout';

      navigation.getParent()?.navigate(screenName, {
        assignmentId: startedAssignment.assignmentId,

        workoutId: startedAssignment.workoutId,

        condition: startedAssignment.condition,
      });
    } catch (requestError) {
      console.error('Failed to start assignment:', requestError);

      Alert.alert(
        'Unable to start workout',

        requestError?.response?.data?.detail || 'Please try again.',
      );
    } finally {
      setStarting(false);
    }
  };

  const visibleCompleted = useMemo(() => {
    if (showAllCompleted) {
      return completedAssignments;
    }

    return completedAssignments.slice(0, 3);
  }, [completedAssignments, showAllCompleted]);

  const remainingHidden = Math.max(completedAssignments.length - 3, 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />

        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to load workouts</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadHome(true)}
        >
          <Text style={styles.retryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={[
          styles.container,

          {
            paddingBottom: 150 + tabBarHeight,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primaryLight}
            colors={[COLORS.primaryLight]}
          />
        }
      >
        <Text style={styles.heading}>Your workouts</Text>

        {!allCompleted && assignment && (
          <>
            <Text style={styles.sectionLabel}>Up next</Text>

            <View style={styles.nextCard}>
              <Text style={styles.workoutNumber}>
                Workout {assignment.order}
                {' of '}
                {totalCount}
              </Text>

              <Text style={styles.nextTitle}>Ready for your next workout?</Text>

              <Text style={styles.nextDescription}>
                Your workout details will be revealed when you begin.
              </Text>

              <TouchableOpacity
                style={[styles.startButton, starting && styles.disabledButton]}
                onPress={handleStartWorkout}
                disabled={starting}
              >
                {starting ? (
                  <ActivityIndicator color={COLORS.text} />
                ) : (
                  <Text style={styles.startButtonText}>Start workout</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {allCompleted && (
          <View style={styles.completeCard}>
            <Text style={styles.completeTitle}>All workouts completed</Text>

            <Text style={styles.completeDescription}>
              You completed all {totalCount} assigned workouts.
            </Text>
          </View>
        )}

        <View style={styles.completedHeader}>
          <Text style={styles.sectionLabel}>Completed</Text>

          <Text style={styles.completedCount}>
            {completedAssignments.length}
          </Text>
        </View>

        {completedAssignments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No completed workouts yet</Text>

            <Text style={styles.emptyText}>
              Your completed workouts will appear here.
            </Text>
          </View>
        ) : (
          <>
            {visibleCompleted.map(item => (
              <CompletedWorkoutRow key={item.assignmentId} assignment={item} />
            ))}

            {remainingHidden > 0 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllCompleted(current => !current)}
              >
                <Text style={styles.showMoreText}>
                  {showAllCompleted
                    ? 'Show less'
                    : `Show ${remainingHidden} more`}
                </Text>

                <Text style={styles.chevron}>
                  {showAllCompleted ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <ProgressLockCard
        completedCount={completedCount}
        totalCount={totalCount}
      />
    </View>
  );
}

function CompletedWorkoutRow({ assignment }) {
  const workout = assignment.workout ?? {};

  const isGamified = assignment.condition === 'gamified';

  return (
    <View style={styles.completedRow}>
      <View style={styles.completedNumber}>
        <Text style={styles.completedNumberText}>{assignment.order}</Text>
      </View>

      <View style={styles.completedInfo}>
        <Text style={styles.completedName} numberOfLines={1}>
          {workout.name ?? assignment.workoutId}
        </Text>

        <Text style={styles.completedCondition}>
          {isGamified ? 'Gamified' : 'Standard'}
        </Text>
      </View>

      <Text style={styles.completedCheck}>✓</Text>
    </View>
  );
}

function ProgressLockCard({ completedCount, totalCount }) {
  const finalWorkoutReady = completedCount === totalCount - 1;

  const finished = completedCount >= totalCount;

  let statusTitle = 'FINAL WORKOUT LOCKED';

  let message = 'Complete your remaining workouts to unlock the final workout.';

  if (finalWorkoutReady) {
    statusTitle = 'FINAL WORKOUT UNLOCKED';

    message = 'Your final workout is ready.';
  }

  if (finished) {
    statusTitle = 'STUDY COMPLETE';

    message = 'All assigned workouts have been completed.';
  }

  const progress =
    totalCount > 0 ? Math.min(completedCount / totalCount, 1) : 0;

  return (
    <View style={styles.progressFloatingCard}>
      <View style={styles.progressTopRow}>
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>
            {finished ? '✓' : finalWorkoutReady ? '🔓' : '🔒'}
          </Text>
        </View>

        <View style={styles.progressTextArea}>
          <Text style={styles.progressStatus}>{statusTitle}</Text>

          <Text style={styles.progressMessage}>{message}</Text>
        </View>

        <Text style={styles.progressFraction}>
          {completedCount}/{totalCount}
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,

            {
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,

    paddingHorizontal: 20,

    paddingTop: 38,
  },

  centerContainer: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    padding: 24,

    backgroundColor: COLORS.background,
  },

  heading: {
    color: COLORS.text,

    fontSize: 27,

    fontWeight: '700',

    marginBottom: 24,
  },

  sectionLabel: {
    color: COLORS.text,

    fontSize: 17,

    fontWeight: '700',
  },

  loadingText: {
    color: COLORS.textSecondary,

    fontSize: 13,

    marginTop: 12,
  },

  errorTitle: {
    color: COLORS.text,

    fontSize: 19,

    fontWeight: '700',

    marginBottom: 7,
  },

  errorText: {
    color: COLORS.textSecondary,

    fontSize: 13,

    textAlign: 'center',

    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: COLORS.primary,

    paddingHorizontal: 22,

    paddingVertical: 11,

    borderRadius: 10,
  },

  retryButtonText: {
    color: COLORS.text,

    fontWeight: '700',
  },

  /* NEXT */

  nextCard: {
    backgroundColor: COLORS.card,

    borderRadius: 15,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 18,

    marginTop: 10,

    marginBottom: 26,
  },

  workoutNumber: {
    color: COLORS.textSecondary,

    fontSize: 11,

    fontWeight: '600',

    marginBottom: 12,
  },

  nextTitle: {
    color: COLORS.text,

    fontSize: 18,

    fontWeight: '700',

    marginBottom: 6,
  },

  nextDescription: {
    color: COLORS.textSecondary,

    fontSize: 12,

    lineHeight: 18,

    marginBottom: 17,
  },

  startButton: {
    width: '100%',

    backgroundColor: COLORS.primary,

    paddingVertical: 13,

    borderRadius: 10,

    alignItems: 'center',
  },

  startButtonText: {
    color: COLORS.text,

    fontSize: 14,

    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  /* COMPLETED */

  completedHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 10,
  },

  completedCount: {
    color: COLORS.textSecondary,

    fontSize: 12,

    fontWeight: '600',
  },

  completedRow: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.card,

    borderRadius: 11,

    borderWidth: 1,

    borderColor: COLORS.border,

    paddingHorizontal: 12,

    paddingVertical: 10,

    marginBottom: 7,
  },

  completedNumber: {
    width: 30,

    height: 30,

    borderRadius: 15,

    backgroundColor: COLORS.cardSecondary,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 11,
  },

  completedNumberText: {
    color: COLORS.textSecondary,

    fontSize: 11,

    fontWeight: '700',
  },

  completedInfo: {
    flex: 1,
  },

  completedName: {
    color: COLORS.text,

    fontSize: 13,

    fontWeight: '600',

    marginBottom: 2,
  },

  completedCondition: {
    color: COLORS.textSecondary,

    fontSize: 10,
  },

  completedCheck: {
    color: '#67D391',

    fontSize: 17,

    fontWeight: '800',

    marginLeft: 10,
  },

  showMoreButton: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: 11,

    marginTop: 1,

    marginBottom: 20,
  },

  showMoreText: {
    color: COLORS.primaryLight,

    fontSize: 12,

    fontWeight: '700',
  },

  chevron: {
    color: COLORS.primaryLight,

    fontSize: 9,

    marginLeft: 7,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: COLORS.card,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 19,

    alignItems: 'center',
  },

  emptyTitle: {
    color: COLORS.text,

    fontSize: 13,

    fontWeight: '700',

    marginBottom: 4,
  },

  emptyText: {
    color: COLORS.textSecondary,

    fontSize: 11,

    textAlign: 'center',
  },

  /* ALL COMPLETE */

  completeCard: {
    backgroundColor: COLORS.card,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: COLORS.primaryLight,

    padding: 19,

    marginBottom: 25,
  },

  completeTitle: {
    color: COLORS.text,

    fontSize: 17,

    fontWeight: '700',

    marginBottom: 5,
  },

  completeDescription: {
    color: COLORS.textSecondary,

    fontSize: 12,

    lineHeight: 18,
  },

  /* FIXED PROGRESS CARD */

  progressFloatingCard: {
    position: 'absolute',

    left: 14,

    right: 14,

    bottom: 8,

    backgroundColor: COLORS.card,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: COLORS.primaryLight,

    padding: 14,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: -3,
    },

    shadowOpacity: 0.28,

    shadowRadius: 7,

    elevation: 12,
  },

  progressTopRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 11,
  },

  lockBadge: {
    width: 34,

    height: 34,

    borderRadius: 17,

    backgroundColor: COLORS.cardSecondary,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 10,
  },

  lockIcon: {
    fontSize: 15,
  },

  progressTextArea: {
    flex: 1,

    paddingRight: 8,
  },

  progressStatus: {
    color: COLORS.text,

    fontSize: 10,

    fontWeight: '800',

    letterSpacing: 0.5,

    marginBottom: 2,
  },

  progressMessage: {
    color: COLORS.textSecondary,

    fontSize: 9,

    lineHeight: 13,
  },

  progressFraction: {
    color: COLORS.text,

    fontSize: 18,

    fontWeight: '800',
  },

  progressBackground: {
    height: 6,

    backgroundColor: COLORS.cardSecondary,

    borderRadius: 3,

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    backgroundColor: COLORS.primaryLight,

    borderRadius: 3,
  },
});
