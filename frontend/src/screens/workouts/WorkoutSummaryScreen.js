// Standard workout summary. It derives a concise completed-set/time overview
// from the saved workout result and can expand to show individual exercise sets.

import React, { useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '../../constants/theme';

function WorkoutSummaryScreen({ summary, onDone }) {
  const [expanded, setExpanded] = useState(false);

  if (!summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>No workout summary available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completionTimeSeconds = summary.completionTimeSeconds ?? 0;

  const minutes = Math.floor(completionTimeSeconds / 60);

  const seconds = completionTimeSeconds % 60;

  const exerciseResults = summary.exerciseResults ?? [];

  const totalSets =
    summary.totalSets ??
    exerciseResults.reduce(
      (total, exercise) => total + (exercise.sets ?? []).length,
      0,
    );

  const completedSets =
    summary.completedSets ??
    exerciseResults.reduce(
      (total, exercise) =>
        total + (exercise.sets ?? []).filter(set => set.completed).length,
      0,
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Workout Complete</Text>

        <Pressable
          style={styles.summaryCard}
          onPress={() => setExpanded(previous => !previous)}
        >
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryText}>
              <Text style={styles.workoutName}>
                {summary.workoutName ?? 'Workout'}
              </Text>

              <Text style={styles.quickSummary}>
                {completedSets}/{totalSets} sets
                {'  •  '}
                {minutes}m {seconds}s
              </Text>
            </View>

            <Text style={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
          </View>

          {expanded && (
            <View style={styles.detailsContainer}>
              {exerciseResults.map(exercise => (
                <View key={exercise.exerciseId} style={styles.exerciseSection}>
                  <Text style={styles.exerciseName}>
                    {exercise.name ?? 'Exercise'}
                  </Text>

                  {(exercise.sets ?? []).map(set => (
                    <Text
                      key={set.setNumber}
                      style={[
                        styles.setText,

                        !set.completed && styles.incompleteSet,
                      ]}
                    >
                      Set {set.setNumber}: {set.actualValue}{' '}
                      {exercise.unit === 'seconds' ? 'sec' : 'reps'}
                      {!set.completed ? ' — not completed' : ''}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </Pressable>

        <Pressable style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneText}>Done</Text>
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

    justifyContent: 'center',

    padding: 20,
  },

  title: {
    color: COLORS.text,

    fontSize: 30,

    fontWeight: 'bold',

    marginBottom: 22,
  },

  summaryCard: {
    backgroundColor: COLORS.card,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 18,
  },

  summaryTopRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  summaryText: {
    flex: 1,
  },

  workoutName: {
    color: COLORS.text,

    fontSize: 19,

    fontWeight: 'bold',

    marginBottom: 5,
  },

  quickSummary: {
    color: COLORS.textSecondary,

    fontSize: 14,
  },

  arrow: {
    color: COLORS.primaryLight,

    fontSize: 18,

    marginLeft: 15,
  },

  detailsContainer: {
    marginTop: 18,

    paddingTop: 16,

    borderTopWidth: 1,

    borderTopColor: COLORS.border,
  },

  exerciseSection: {
    marginBottom: 18,
  },

  exerciseName: {
    color: COLORS.text,

    fontSize: 17,

    fontWeight: 'bold',

    marginBottom: 8,
  },

  setText: {
    color: COLORS.textSecondary,

    fontSize: 14,

    marginBottom: 5,
  },

  incompleteSet: {
    opacity: 0.55,
  },

  doneButton: {
    backgroundColor: COLORS.primary,

    paddingVertical: 16,

    borderRadius: 14,

    alignItems: 'center',

    marginTop: 20,
  },

  doneText: {
    color: COLORS.text,

    fontSize: 17,

    fontWeight: 'bold',
  },
});

export default WorkoutSummaryScreen;
