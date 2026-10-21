// Participant leaderboard. Rankings and usernames come from the backend so
// clients cannot locally manipulate leaderboard order or score values.

import React, { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { getLeaderboard } from '../../services/gamification';

import { COLORS } from '../../constants/theme';


function getRankIcon(rank) {
  if (rank === 1) {
    return '🥇';
  }

  if (rank === 2) {
    return '🥈';
  }

  if (rank === 3) {
    return '🥉';
  }

  return `#${rank}`;
}


function LeaderboardRow({ entry }) {
  return (
    <View
      style={[
        styles.rankingRow,
        entry.isCurrentUser && styles.currentUserRow,
      ]}
    >
      <View style={styles.rankContainer}>
        <Text
          style={[
            styles.rankText,
            entry.rank <= 3 && styles.medalText,
          ]}
        >
          {getRankIcon(entry.rank)}
        </Text>
      </View>

      <View style={styles.playerContainer}>
        <View style={styles.playerNameRow}>
          <Text style={styles.playerName}>
            {entry.alias}
          </Text>

          {entry.isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>
                YOU
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.playerLevel}>
          Level {entry.level}
          {' · '}
          {entry.title}
        </Text>
      </View>

      <View style={styles.xpContainer}>
        <Text style={styles.xp}>
          {entry.totalXP}
        </Text>

        <Text style={styles.xpLabel}>
          XP
        </Text>
      </View>
    </View>
  );
}


function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


  const loadLeaderboard = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError('');

        const data = await getLeaderboard(25);
        setLeaderboard(data);
      } catch (requestError) {
        console.error(
          'Failed to load leaderboard:',
          requestError,
        );

        setError('Unable to load the leaderboard.');
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [],
  );


  useFocusEffect(
    useCallback(() => {
      loadLeaderboard(true);
    }, [loadLeaderboard]),
  );


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard(false);
    setRefreshing(false);
  }, [loadLeaderboard]);


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primaryLight}
        />

        <Text style={styles.loadingText}>
          Loading leaderboard...
        </Text>
      </View>
    );
  }


  if (error && !leaderboard) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Leaderboard unavailable
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadLeaderboard(true)}
        >
          <Text style={styles.retryButtonText}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  const entries = leaderboard?.entries ?? [];
  const currentUser = leaderboard?.currentUser ?? null;
  const totalPlayers = leaderboard?.totalPlayers ?? 0;


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primaryLight}
          colors={[COLORS.primaryLight]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Leaderboard
        </Text>

        <Text style={styles.subtitle}>
          Earn XP during gamified workouts and climb the rankings.
        </Text>
      </View>


      {currentUser && (
        <View style={styles.positionCard}>
          <View>
            <Text style={styles.positionLabel}>
              Your position
            </Text>

            <Text style={styles.positionName}>
              {currentUser.alias}
            </Text>

            <Text style={styles.positionLevel}>
              Level {currentUser.level}
              {' · '}
              {currentUser.title}
            </Text>
          </View>

          <View style={styles.positionRight}>
            <Text style={styles.positionRank}>
              #{currentUser.rank}
            </Text>

            <Text style={styles.positionXp}>
              {currentUser.totalXP} XP
            </Text>
          </View>
        </View>
      )}


      <View style={styles.summaryRow}>
        <Text style={styles.sectionTitle}>
          Rankings
        </Text>

        <Text style={styles.playerCount}>
          {totalPlayers}{' '}
          {totalPlayers === 1 ? 'player' : 'players'}
        </Text>
      </View>


      <View style={styles.leaderboardCard}>
        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No rankings yet
            </Text>

            <Text style={styles.emptyText}>
              Complete a gamified workout to earn XP.
            </Text>
          </View>
        ) : (
          entries.map((entry, index) => (
            <View key={`${entry.rank}-${entry.alias}`}>
              <LeaderboardRow entry={entry} />

              {index < entries.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))
        )}
      </View>


      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          How rankings work
        </Text>

        <Text style={styles.infoText}>
          Rankings are based on total XP from gamified workouts. The username
          chosen for FitStudy is shown on the leaderboard; Firebase IDs and
          account details are never displayed.
        </Text>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 34,
    paddingBottom: 30,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 5,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 7,
  },

  errorText: {
    color: COLORS.textSecondary,
    fontSize: 12,
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
  },

  positionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    padding: 16,
    marginBottom: 24,
  },

  positionLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 4,
  },

  positionName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  positionLevel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  positionRight: {
    alignItems: 'flex-end',
  },

  positionRank: {
    color: COLORS.primaryLight,
    fontSize: 25,
    fontWeight: '800',
  },

  positionXp: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  playerCount: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },

  leaderboardCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  currentUserRow: {
    backgroundColor: COLORS.cardSecondary,
  },

  rankContainer: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rankText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  medalText: {
    fontSize: 21,
  },

  playerContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },

  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  youBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 7,
  },

  youBadgeText: {
    color: COLORS.text,
    fontSize: 7,
    fontWeight: '800',
  },

  playerLevel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  xpContainer: {
    alignItems: 'flex-end',
    minWidth: 55,
  },

  xp: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  xpLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 54,
  },

  emptyContainer: {
    padding: 28,
    alignItems: 'center',
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: 18,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },

  infoText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
  },
});


export default LeaderboardScreen;
