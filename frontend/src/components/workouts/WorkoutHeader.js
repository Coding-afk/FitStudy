// Shared active-workout header showing workout identity and set completion
// progress without duplicating this calculation across workout screens.

import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/theme';

function WorkoutHeader({ workout, completedSets, totalSets }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{workout.name}</Text>

      <Text style={styles.description}>{workout.description}</Text>

      <View style={styles.details}>
        <Text style={styles.detailText}>{workout.difficulty}</Text>

        <Text style={styles.detailText}>{workout.durationMinutes} min</Text>

        <Text style={styles.progressText}>
          {completedSets}/{totalSets} sets completed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  title: {
    color: COLORS.text,

    fontSize: 30,
    fontWeight: 'bold',

    marginBottom: 8,
  },

  description: {
    color: COLORS.textSecondary,

    fontSize: 15,
    lineHeight: 21,

    marginBottom: 12,
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  detailText: {
    color: COLORS.primaryLight,

    fontSize: 14,
    fontWeight: '600',
  },

  progressText: {
    color: COLORS.textSecondary,

    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkoutHeader;
