import { useEffect, useRef, useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Sound from 'react-native-sound';

import ConfettiBurst from '../../components/gamification/ConfettiBurst';

import BadgeUnlockModal from '../../components/gamification/BadgeUnlockModal';

import { COLORS } from '../../constants/theme';

Sound.setCategory('Playback');

function GamifiedWorkoutSummaryScreen({ summary, onDone }) {
  const [expanded, setExpanded] = useState(false);

  const [showConfetti, setShowConfetti] = useState(true);

  const [badgeIndex, setBadgeIndex] = useState(0);

  const [showBadgePopup, setShowBadgePopup] = useState(false);

  const victorySoundRef = useRef(null);

  const game = summary?.gamification ?? {};

  const badges = game.newlyUnlockedBadges ?? [];

  // =========================================================
  // VICTORY SOUND
  // =========================================================

  useEffect(() => {
    const victorySound = new Sound(
      'victory_sound.mp3',

      Sound.MAIN_BUNDLE,

      error => {
        if (error) {
          console.log('Unable to load victory sound:', error);

          return;
        }

        victorySoundRef.current = victorySound;

        victorySound.play();
      },
    );

    return () => {
      if (victorySoundRef.current) {
        victorySoundRef.current.release();
      }
    };
  }, []);

  // =========================================================
  // BADGE POPUP DELAY
  // =========================================================

  useEffect(() => {
    if (badges.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setShowBadgePopup(true);
    }, 1300);

    return () => {
      clearTimeout(timer);
    };
  }, [badges.length]);

  const handleBadgeContinue = () => {
    if (badgeIndex < badges.length - 1) {
      setBadgeIndex(previous => previous + 1);

      return;
    }

    setShowBadgePopup(false);
  };

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

  const xpBreakdown = game.xpBreakdown ?? {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ConfettiBurst
        active={showConfetti}
        onFinished={() => setShowConfetti(false)}
      />

      <BadgeUnlockModal
        visible={showBadgePopup}
        badgeId={badges[badgeIndex]}
        onClose={handleBadgeContinue}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Workout Complete</Text>

        <Text style={styles.earnedXp}>
          +{game.xpEarned ?? 0}
          {' XP'}
        </Text>

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
                {minutes}m {seconds}s{'  •  +'}
                {game.xpEarned ?? 0}
                {' XP'}
              </Text>
            </View>

            <Text style={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
          </View>

          {expanded && (
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Gamification</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Performance Score</Text>

                <Text style={styles.statValue}>
                  {game.performanceScore ?? 0}
                  /100
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Challenge</Text>

                <Text style={styles.statValue}>
                  {game.challenge?.completed ? 'Completed' : 'Not completed'}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Perfect Workout</Text>

                <Text style={styles.statValue}>
                  {game.perfectWorkout ? 'Yes' : 'No'}
                </Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>XP Earned</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Completed Sets</Text>

                <Text style={styles.statValue}>+{xpBreakdown.sets ?? 0}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Workout Bonus</Text>

                <Text style={styles.statValue}>
                  +{xpBreakdown.workout ?? 0}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Challenge Bonus</Text>

                <Text style={styles.statValue}>
                  +{xpBreakdown.challenge ?? 0}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Perfect Bonus</Text>

                <Text style={styles.statValue}>
                  +{xpBreakdown.perfectBonus ?? 0}
                </Text>
              </View>

              <View style={styles.totalXpRow}>
                <Text style={styles.totalXpLabel}>Total Earned</Text>

                <Text style={styles.totalXpValue}>
                  +{game.xpEarned ?? 0}
                  {' XP'}
                </Text>
              </View>

              {badges.length > 0 && (
                <>
                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>Badges Unlocked</Text>

                  {badges.map(badge => (
                    <View key={badge.id} style={styles.badgeRow}>
                      <View style={styles.badgeIconPlaceholder}>
                        <Text style={styles.badgeIconText}>★</Text>
                      </View>

                      <View style={styles.badgeTextContainer}>
                        <Text style={styles.badgeName}>{badge.name}</Text>

                        <Text style={styles.badgeDescription}>
                          {badge.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Workout Details</Text>

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

    marginBottom: 5,
  },

  earnedXp: {
    color: COLORS.primaryLight,

    fontSize: 20,

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

  sectionTitle: {
    color: COLORS.text,

    fontSize: 17,

    fontWeight: 'bold',

    marginBottom: 12,
  },

  statRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 10,
  },

  statLabel: {
    color: COLORS.textSecondary,

    fontSize: 14,
  },

  statValue: {
    color: COLORS.text,

    fontSize: 14,

    fontWeight: '600',
  },

  divider: {
    height: 1,

    backgroundColor: COLORS.border,

    marginVertical: 18,
  },

  totalXpRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginTop: 8,
  },

  totalXpLabel: {
    color: COLORS.text,

    fontWeight: 'bold',

    fontSize: 15,
  },

  totalXpValue: {
    color: COLORS.primaryLight,

    fontWeight: 'bold',

    fontSize: 16,
  },

  badgeRow: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.cardSecondary,

    borderRadius: 12,

    padding: 12,

    marginBottom: 10,
  },

  badgeIconPlaceholder: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: COLORS.primary,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,
  },

  badgeIconText: {
    color: COLORS.text,

    fontSize: 19,

    fontWeight: 'bold',
  },

  badgeTextContainer: {
    flex: 1,
  },

  badgeName: {
    color: COLORS.text,

    fontWeight: 'bold',

    fontSize: 15,

    marginBottom: 3,
  },

  badgeDescription: {
    color: COLORS.textSecondary,

    fontSize: 12,

    lineHeight: 17,
  },

  exerciseSection: {
    marginBottom: 18,
  },

  exerciseName: {
    color: COLORS.text,

    fontSize: 16,

    fontWeight: 'bold',

    marginBottom: 7,
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

export default GamifiedWorkoutSummaryScreen;
