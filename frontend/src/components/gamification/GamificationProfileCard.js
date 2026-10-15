import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getMyGamificationStats } from '../../services/gamification';

import BadgeIcon from './BadgeIcon';

import { getAllBadges } from '../../constants/badges';

import { COLORS } from '../../constants/theme';

function GamificationProfileCard() {
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const badges = getAllBadges();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      setError('');

      const data = await getMyGamificationStats();

      setStats(data);
    } catch (requestError) {
      console.error('Failed to load gamification stats:', requestError);

      setError('Unable to load your gamification information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />

        <Text style={styles.loadingText}>
          Loading gamification information...
        </Text>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load stats</Text>

        <Text style={styles.errorText}>
          {error || 'Gamification information is unavailable.'}
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalXP = Number(stats.totalXP ?? 0);

  const level = Number(stats.level ?? 1);

  const title = stats.title ?? 'Starter';

  const levelProgress = Math.min(
    100,
    Math.max(0, Number(stats.levelProgress ?? 0)),
  );

  const xpToNextLevel = Number(stats.xpToNextLevel ?? 0);

  const nextLevelXP = stats.nextLevelXP ?? null;

  const gamifiedWorkouts = Number(stats.gamifiedWorkoutsCompleted ?? 0);

  const challengesCompleted = Number(stats.challengesCompleted ?? 0);

  const perfectWorkouts = Number(stats.perfectWorkouts ?? 0);

  const earnedBadges = Array.isArray(stats.earnedBadges)
    ? stats.earnedBadges
    : [];

  const finalRewardCompleted = Boolean(
    stats.finalRewardCompleted,
  );

  const unlockedBadgeCount = badges.filter(badge => {
    if (badge.id === 'fitstudy_complete') {
      return finalRewardCompleted;
    }

    return earnedBadges.includes(badge.id);
  }).length;

  return (
    <View style={styles.container}>
      {/* LEVEL */}

      <View style={styles.levelCard}>
        <View style={styles.levelTopRow}>
          <View>
            <Text style={styles.sectionLabel}>YOUR LEVEL</Text>

            <Text style={styles.levelTitle}>Level {level}</Text>

            <Text style={styles.titleText}>{title}</Text>
          </View>

          <View style={styles.xpContainer}>
            <Text style={styles.xpValue}>{totalXP}</Text>

            <Text style={styles.xpLabel}>TOTAL XP</Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Level progress</Text>

          <Text style={styles.progressPercent}>{levelProgress}%</Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,

              {
                width: `${levelProgress}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.nextLevelText}>
          {nextLevelXP !== null
            ? `${xpToNextLevel} XP until Level ${level + 1}`
            : 'Maximum level reached!'}
        </Text>
      </View>

      {/* STATS */}

      <Text style={styles.heading}>Your stats</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{gamifiedWorkouts}</Text>

          <Text style={styles.statLabel}>
            Gamified
            {'\n'}
            Workouts
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{challengesCompleted}</Text>

          <Text style={styles.statLabel}>
            Challenges
            {'\n'}
            Completed
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{perfectWorkouts}</Text>

          <Text style={styles.statLabel}>
            Perfect
            {'\n'}
            Workouts
          </Text>
        </View>
      </View>

      {/* BADGES */}

      <View style={styles.badgesHeadingRow}>
        <Text style={styles.heading}>Badges</Text>

        <Text style={styles.badgeCount}>
          {unlockedBadgeCount}/{badges.length}
        </Text>
      </View>

      <View style={styles.badgeGrid}>
        {badges.map(badge => {
          const unlocked =
            badge.id === 'fitstudy_complete'
              ? finalRewardCompleted
              : earnedBadges.includes(badge.id);

          return (
            <View
              key={badge.id}
              style={[styles.badgeCard, !unlocked && styles.badgeCardLocked]}
            >
              <BadgeIcon badgeId={badge.id} unlocked={unlocked} size={68} />

              <Text style={[styles.badgeName, !unlocked && styles.textLocked]}>
                {badge.name}
              </Text>

              <Text
                style={[
                  styles.badgeDescription,

                  !unlocked && styles.textLocked,
                ]}
              >
                {badge.description}
              </Text>

              <Text
                style={[
                  styles.badgeState,

                  unlocked ? styles.unlockedText : styles.lockedText,
                ]}
              >
                {unlocked ? 'UNLOCKED' : 'LOCKED'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* XP RULES */}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How do I earn XP?</Text>

        <InfoRow name="Complete a set" xp="+10 XP" />

        <InfoRow name="Complete a workout" xp="+50 XP" />

        <InfoRow name="Complete the challenge" xp="+50 XP" />

        <InfoRow name="Perfect workout" xp="+100 XP" last />
      </View>
    </View>
  );
}

function InfoRow({ name, xp, last = false }) {
  return (
    <View style={[styles.infoRow, last && styles.lastInfoRow]}>
      <Text style={styles.infoText}>{name}</Text>

      <Text style={styles.infoXP}>{xp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  loadingContainer: {
    minHeight: 240,

    justifyContent: 'center',

    alignItems: 'center',

    padding: 24,
  },

  loadingText: {
    color: COLORS.textSecondary,

    fontSize: 13,

    marginTop: 12,

    textAlign: 'center',
  },

  errorContainer: {
    backgroundColor: COLORS.card,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 20,

    alignItems: 'center',
  },

  errorTitle: {
    color: COLORS.text,

    fontSize: 17,

    fontWeight: '700',

    marginBottom: 6,
  },

  errorText: {
    color: COLORS.textSecondary,

    fontSize: 12,

    lineHeight: 18,

    textAlign: 'center',

    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: COLORS.primary,

    borderRadius: 9,

    paddingHorizontal: 20,

    paddingVertical: 10,
  },

  retryButtonText: {
    color: COLORS.text,

    fontWeight: '700',

    fontSize: 13,
  },

  levelCard: {
    backgroundColor: COLORS.cardSecondary,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: COLORS.primaryLight,

    padding: 18,

    marginBottom: 24,
  },

  levelTopRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    marginBottom: 20,
  },

  sectionLabel: {
    color: COLORS.textSecondary,

    fontSize: 10,

    letterSpacing: 1,

    fontWeight: '700',

    marginBottom: 5,
  },

  levelTitle: {
    color: COLORS.text,

    fontSize: 27,

    fontWeight: '800',
  },

  titleText: {
    color: COLORS.primaryLight,

    fontSize: 15,

    fontWeight: '600',

    marginTop: 2,
  },

  xpContainer: {
    alignItems: 'flex-end',
  },

  xpValue: {
    color: COLORS.text,

    fontSize: 28,

    fontWeight: '800',
  },

  xpLabel: {
    color: COLORS.textSecondary,

    fontSize: 9,

    letterSpacing: 0.8,

    fontWeight: '700',
  },

  progressHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 7,
  },

  progressText: {
    color: COLORS.textSecondary,

    fontSize: 11,
  },

  progressPercent: {
    color: COLORS.text,

    fontSize: 11,

    fontWeight: '600',
  },

  progressBackground: {
    height: 10,

    backgroundColor: COLORS.background,

    borderRadius: 5,

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    backgroundColor: COLORS.primaryLight,

    borderRadius: 5,
  },

  nextLevelText: {
    color: COLORS.textSecondary,

    fontSize: 11,

    marginTop: 8,

    textAlign: 'right',
  },

  heading: {
    color: COLORS.text,

    fontSize: 18,

    fontWeight: '700',

    marginBottom: 12,
  },

  statsRow: {
    flexDirection: 'row',

    gap: 8,

    marginBottom: 26,
  },

  statCard: {
    flex: 1,

    backgroundColor: COLORS.card,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: COLORS.border,

    paddingVertical: 16,

    paddingHorizontal: 6,

    alignItems: 'center',
  },

  statValue: {
    color: COLORS.text,

    fontSize: 24,

    fontWeight: '800',
  },

  statLabel: {
    color: COLORS.textSecondary,

    fontSize: 9,

    lineHeight: 13,

    textAlign: 'center',

    marginTop: 5,
  },

  badgesHeadingRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },

  badgeCount: {
    color: COLORS.textSecondary,

    fontSize: 12,

    marginBottom: 12,
  },

  badgeGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',

    marginBottom: 24,
  },

  badgeCard: {
    width: '48.5%',

    backgroundColor: COLORS.card,

    borderRadius: 13,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 13,

    marginBottom: 11,

    minHeight: 215,

    alignItems: 'center',
  },

  badgeCardLocked: {
    opacity: 0.62,
  },

  badgeName: {
    color: COLORS.text,

    fontSize: 13,

    fontWeight: '800',

    textAlign: 'center',

    marginTop: 14,

    marginBottom: 5,
  },

  badgeDescription: {
    color: COLORS.textSecondary,

    fontSize: 10,

    lineHeight: 14,

    textAlign: 'center',

    flex: 1,
  },

  textLocked: {
    color: COLORS.textSecondary,
  },

  badgeState: {
    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 0.7,

    marginTop: 10,
  },

  unlockedText: {
    color: '#67D391',
  },

  lockedText: {
    color: COLORS.textSecondary,
  },

  infoCard: {
    backgroundColor: COLORS.card,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 15,

    marginBottom: 10,
  },

  infoTitle: {
    color: COLORS.text,

    fontSize: 15,

    fontWeight: '700',

    marginBottom: 9,
  },

  infoRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingVertical: 10,

    borderBottomWidth: 1,

    borderBottomColor: COLORS.border,
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  infoText: {
    color: COLORS.textSecondary,

    fontSize: 12,
  },

  infoXP: {
    color: COLORS.primaryLight,

    fontSize: 12,

    fontWeight: '800',
  },
});

export default GamificationProfileCard;
