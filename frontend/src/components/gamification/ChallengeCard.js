// Displays the daily challenge assigned to a gamified workout.
// The local completion check is only for immediate UI feedback; the backend remains
// the authoritative source that decides whether challenge XP is actually awarded.

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {COLORS} from '../../constants/theme';

const FALLBACK_CHALLENGE = {
  id: 'complete_80_percent',
  name: '80% Finisher',
  description: 'Complete at least 80% of the workout sets.',
  xpReward: 50,
};

// Mirrors the challenge rule only to show live progress in the card.
// The backend re-evaluates the same challenge from the submitted workout data.
const isChallengeComplete = ({
  challenge,
  completedSets,
  totalSets,
  exerciseList,
}) => {
  if (!totalSets) {
    return false;
  }

  switch (challenge.id) {
    case 'complete_70_percent':
      return completedSets / totalSets >= 0.7;

    case 'complete_80_percent':
      return completedSets / totalSets >= 0.8;

    case 'complete_90_percent':
      return completedSets / totalSets >= 0.9;

    case 'perfect_finish':
      return completedSets === totalSets;

    case 'every_exercise':
      return (
        exerciseList.length > 0 &&
        exerciseList.every(exercise =>
          (exercise.sets ?? []).some(set => set.completed),
        )
      );

    case 'two_per_exercise':
      return (
        exerciseList.length > 0 &&
        exerciseList.every(exercise => {
          const sets = exercise.sets ?? [];
          const required = Math.min(2, sets.length);
          const completed = sets.filter(set => set.completed).length;

          return required > 0 && completed >= required;
        })
      );

    default:
      return completedSets / totalSets >= 0.8;
  }
};

function ChallengeCard({
  challenge: suppliedChallenge,
  completedSets = 0,
  totalSets = 0,
  exerciseList = [],
}) {
  const challenge = suppliedChallenge ?? FALLBACK_CHALLENGE;

  const challengeComplete = isChallengeComplete({
    challenge,
    completedSets,
    totalSets,
    exerciseList,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.eyebrow}>TODAY'S CHALLENGE</Text>
          <Text style={styles.title}>{challenge.name}</Text>
        </View>

        <Text style={[styles.status, challengeComplete && styles.completed]}>
          {challengeComplete
            ? 'Completed!'
            : `+${challenge.xpReward ?? 50} XP`}
        </Text>
      </View>

      <Text style={styles.description}>{challenge.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginLeft: 16,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  titleArea: {
    flex: 1,
    paddingRight: 8,
  },
  eyebrow: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  status: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: 11,
  },
  completed: {
    color: COLORS.success,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});

export default ChallengeCard;
