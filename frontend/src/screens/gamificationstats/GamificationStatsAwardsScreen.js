

import React from 'react';


import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';

import GamificationProfileCard from '../../components/gamification/GamificationProfileCard';
import { COLORS } from '../../constants/theme';

export default function GamificationStatsAwardsScreen({ navigation, onBack }) {
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Navigation Bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Screen Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Gamification & Stats</Text>
          <Text style={styles.screenSubtitle}>
            Track your XP progression, workout achievements, and earned badges.
          </Text>
        </View>

        {/* Embedded Gamification Profile Card */}
        <GamificationProfileCard />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function SafeAreaWrapper({ children }) {
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backButtonText: {
    color: COLORS.primaryLight,
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  screenSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
});