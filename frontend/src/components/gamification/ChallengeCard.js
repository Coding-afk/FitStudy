import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const TARGET_SCORE = 80;

function ChallengeCard({ performanceScore = 0 }) {
  const challengeComplete = performanceScore >= TARGET_SCORE;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Challenge</Text>

        <Text style={[styles.status, challengeComplete && styles.completed]}>
          {challengeComplete ? 'Completed!' : '+50 XP'}
        </Text>
      </View>

      <Text style={styles.description}>
        Complete at least 80% of today's workout sets.
      </Text>
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
    padding: 16,
    marginLeft: 16,
    justifyContent: 'center',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },

  status: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
    fontSize: 13,
  },

  completed: {
    color: COLORS.success,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ChallengeCard;
