import React from 'react';

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
  console.log('SUMMARY SCREEN RECEIVED:', summary);

  if (!summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>No workout summary available.</Text>

          <Pressable style={styles.doneButton} onPress={onDone}>
            <Text style={styles.doneText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completionTimeSeconds = summary.completionTimeSeconds ?? 0;

  const minutes = Math.floor(completionTimeSeconds / 60);

  const seconds = completionTimeSeconds % 60;

  const exerciseResults = summary.exerciseResults ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Workout Complete</Text>

        <Text style={styles.workoutName}>
          {summary.workoutName ?? 'Workout'}
        </Text>

        <Text style={styles.time}>
          Time: {minutes}m {seconds}s
        </Text>

        {exerciseResults.length === 0 ? (
          <Text style={styles.message}>No exercise results available.</Text>
        ) : (
          exerciseResults.map(exercise => (
            <View key={exercise.exerciseId} style={styles.card}>
              <Text style={styles.exerciseName}>
                {exercise.name ?? 'Exercise'}
              </Text>

              {(exercise.sets ?? []).map(set => (
                <Text key={set.setNumber} style={styles.setText}>
                  Set {set.setNumber}: {set.actualValue}{' '}
                  {exercise.unit === 'seconds' ? 'sec' : 'reps'}
                </Text>
              ))}
            </View>
          ))
        )}

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

  emptyContainer: {
    flex: 1,

    justifyContent: 'center',

    padding: 20,
  },

  title: {
    color: COLORS.text,

    fontSize: 30,
    fontWeight: 'bold',

    marginBottom: 10,
  },

  workoutName: {
    color: COLORS.primaryLight,

    fontSize: 20,

    marginBottom: 8,
  },

  time: {
    color: COLORS.textSecondary,

    fontSize: 16,

    marginBottom: 24,
  },

  card: {
    backgroundColor: COLORS.card,

    borderRadius: 14,

    padding: 18,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: COLORS.border,
  },

  exerciseName: {
    color: COLORS.text,

    fontSize: 19,
    fontWeight: 'bold',

    marginBottom: 10,
  },

  setText: {
    color: COLORS.textSecondary,

    fontSize: 15,

    marginBottom: 5,
  },

  message: {
    color: COLORS.textSecondary,

    fontSize: 15,

    marginBottom: 20,
  },

  doneButton: {
    backgroundColor: COLORS.primary,

    paddingVertical: 16,

    borderRadius: 14,

    alignItems: 'center',

    marginTop: 10,
  },

  doneText: {
    color: COLORS.text,

    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default WorkoutSummaryScreen;
