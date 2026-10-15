import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BadgeIcon from '../../components/gamification/BadgeIcon';
import {COLORS} from '../../constants/theme';

const formatTime = seconds => {
  const safeSeconds = Number(seconds ?? 0);

  if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) {
    return '--';
  }

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

function PerfectWorkoutCompleteScreen({navigation, route}) {
  const completion = route.params?.completion ?? {};

  const completedSets = Number(completion.completedSets ?? 0);
  const totalSets = Number(completion.totalSets ?? 0);
  const completionTimeSeconds = Number(
    completion.completionTimeSeconds ?? 0,
  );

  const newlyUnlocked = Boolean(completion.newlyUnlocked);
  const fullCompletionCount = Number(
    completion.fullCompletionCount ?? (newlyUnlocked ? 1 : 0),
  );

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            screen: 'Home',
          },
        },
      ],
    });
  };

  const viewAwards = () => {
    navigation.replace('GamificationStatsAwards');
  };

  if (!newlyUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.replayContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.replayEyebrow}>BONUS REPLAY COMPLETE</Text>

          <View style={styles.replayBadgeWrap}>
            <BadgeIcon
              badgeId="fitstudy_complete"
              unlocked
              size={86}
            />
          </View>

          <Text style={styles.replayTitle}>Perfect Workout Complete</Text>

          <Text style={styles.replaySubtitle}>
            Nice work. Your FitStudy Complete award was already earned, so this
            replay does not change your study totals, XP, or leaderboard rank.
          </Text>

          <View style={styles.replayAwardRow}>
            <View style={styles.replayAwardTextWrap}>
              <Text style={styles.replayAwardLabel}>FITSTUDY COMPLETE</Text>
              <Text style={styles.replayAwardStatus}>Already earned</Text>
            </View>

            <Text style={styles.replayAwardCheck}>✓</Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              value={`${completedSets}/${totalSets}`}
              label="Sets completed"
            />

            <StatCard
              value={formatTime(completionTimeSeconds)}
              label="Workout time"
            />
          </View>

          {fullCompletionCount > 1 && (
            <Text style={styles.replayCountText}>
              Perfect Workout completions: {fullCompletionCount}
            </Text>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={viewAwards}>
            <Text style={styles.secondaryButtonText}>View My Award</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>FINAL REWARD</Text>

        <View style={styles.badgeWrap}>
          <BadgeIcon
            badgeId="fitstudy_complete"
            unlocked
            size={132}
          />
        </View>

        <Text style={styles.title}>FitStudy Complete</Text>

        <Text style={styles.subtitle}>
          You completed all 10 study workouts and every set in the Perfect
          Workout.
        </Text>

        <View style={styles.awardCard}>
          <Text style={styles.awardLabel}>ACHIEVEMENT UNLOCKED</Text>

          <Text style={styles.awardName}>FitStudy Complete</Text>

          <Text style={styles.awardDescription}>
            Awarded for completing all 10 study workouts and every set in the
            Perfect Workout reward.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            value={`${completedSets}/${totalSets}`}
            label="Sets completed"
          />

          <StatCard
            value={formatTime(completionTimeSeconds)}
            label="Workout time"
          />
        </View>

        <View style={styles.studyNotice}>
          <Text style={styles.studyNoticeTitle}>Reward complete</Text>

          <Text style={styles.studyNoticeText}>
            The Perfect Workout is a replayable bonus reward. It does not add
            leaderboard XP or change your 10-workout study total.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={viewAwards}>
          <Text style={styles.primaryButtonText}>View My Awards</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({value, label}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 42,
    paddingBottom: 36,
    alignItems: 'center',
  },

  replayContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 46,
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyebrow: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 22,
  },

  badgeWrap: {
    marginBottom: 22,
  },

  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 330,
    marginBottom: 26,
  },

  awardCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  awardLabel: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginBottom: 7,
  },

  awardName: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },

  awardDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },

  studyNotice: {
    width: '100%',
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 24,
  },

  studyNoticeTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },

  studyNoticeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 9,
  },

  primaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  secondaryButton: {
    width: '100%',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 13,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  replayEyebrow: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 16,
  },

  replayBadgeWrap: {
    marginBottom: 15,
  },

  replayTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },

  replaySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 335,
    marginBottom: 20,
  },

  replayAwardRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  replayAwardTextWrap: {
    flex: 1,
  },

  replayAwardLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },

  replayAwardStatus: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },

  replayAwardCheck: {
    color: '#67D391',
    fontSize: 19,
    fontWeight: '900',
  },

  replayCountText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 20,
  },
});

export default PerfectWorkoutCompleteScreen;
