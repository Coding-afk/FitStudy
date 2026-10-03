import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/theme';

function WorkoutHeader({ workout }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{workout.name}</Text>

      <Text style={styles.description}>{workout.description}</Text>

      <View style={styles.details}>
        <Text style={styles.detailText}>{workout.difficulty}</Text>
        
        <Text style={styles.detailText}>{workout.durationMinutes} min</Text>
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
    gap: 16,
  },

  detailText: {
    color: COLORS.primaryLight,

    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkoutHeader;
