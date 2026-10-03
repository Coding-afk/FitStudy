import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/theme';

function SetRow({ set, unit, onDecrease, onIncrease, onToggleComplete }) {
  return (
    <View style={styles.row}>
      <Text style={styles.setNumber}>{set.setNumber}</Text>

      <View style={styles.repControls}>
        <Pressable style={styles.repButton} onPress={onDecrease}>
          <Text style={styles.repButtonText}>−</Text>
        </Pressable>

        <Text style={styles.repValue} numberOfLines={1}>
          {set.value}
          {unit === 'seconds' ? ' sec' : ''}
        </Text>

        <Pressable style={styles.repButton} onPress={onIncrease}>
          <Text style={styles.repButtonText}>+</Text>
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.completeButton,

          set.completed && styles.completeButtonActive,
        ]}
        onPress={onToggleComplete}
      >
        <Text style={styles.completeText}>{set.completed ? '✓' : '○'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: 12,

    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  setNumber: {
    width: 45,

    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },

  repControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  repButton: {
    width: 36,
    height: 36,

    borderRadius: 8,

    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  repButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },

  repValue: {
    width: 75,
    textAlign: 'center',

    color: COLORS.text,
    fontSize: 17,
    fontWeight: 'bold',
  },

  completeButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: COLORS.cardSecondary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  completeButtonActive: {
    backgroundColor: COLORS.success,
  },

  completeText: {
    color: COLORS.text,
    fontSize: 18,
  },
});

export default SetRow;
