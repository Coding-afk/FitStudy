// Presents one exercise and its sets during an active workout.
// Set changes are delegated to the parent workout screen so there is a single
// source of truth for the workout result that will later be submitted.

import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import SetRow from './SetRow';

import { COLORS } from '../../constants/theme';

function ExerciseCard({ exercise, onDecrease, onIncrease, onToggleComplete }) {
  return (
    <View style={styles.card}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>SET</Text>

        <Text style={styles.headerText}>
          {exercise.unit === 'seconds' ? 'SECONDS' : 'REPS'}
        </Text>

        <Text style={styles.headerText}>DONE</Text>
      </View>

      {exercise.sets.map(set => (
        <SetRow
          key={set.setNumber}
          set={set}
          unit={exercise.unit}
          onDecrease={() => onDecrease(exercise.exerciseId, set.setNumber)}
          onIncrease={() => onIncrease(exercise.exerciseId, set.setNumber)}
          onToggleComplete={() =>
            onToggleComplete(exercise.exerciseId, set.setNumber)
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,

    borderRadius: 16,

    padding: 18,
    marginBottom: 18,

    borderWidth: 1,
    borderColor: COLORS.border,
  },

  exerciseName: {
    color: COLORS.text,

    fontSize: 21,
    fontWeight: 'bold',

    marginBottom: 18,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingBottom: 8,
  },

  headerText: {
    color: COLORS.textSecondary,

    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ExerciseCard;
