import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  getProfile,
} from '../../services/profile';

import {
  COLORS,
} from '../../constants/theme';


export default function ProfileScreen({
  user,
  navigation,
  route,
}) {
  const participantId = route?.params?.participantId ?? null;

  const [profile, setProfile] = useState(user || {});
  const [loading, setLoading] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);


  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);

      Alert.alert(
        'Error',
        'Unable to load your profile',
      );
    } finally {
      setLoading(false);
    }
  }, []);


  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );


  const userInfo = {
    name: profile.name || 'Not assigned',
    studyId:
      profile.studyId ||
      participantId ||
      'Not assigned',
    group: profile.group || 'Not assigned',
    completedGamified: Number(profile.completedGamified ?? 0),
    completedNonGamified: Number(profile.completedNonGamified ?? 0),
    totalTarget: 10,
  };

  const completedWorkouts = Math.min(
    userInfo.totalTarget,
    Math.max(
      0,
      userInfo.completedGamified +
        userInfo.completedNonGamified,
    ),
  );

  const overallProgress = Math.min(
    1,
    Math.max(
      0,
      completedWorkouts / userInfo.totalTarget,
    ),
  );


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }


  const handleGamificationInfo = () => {
    navigation
      .getParent()
      ?.navigate('GamificationStatsAwards');
  };


  const handlePasswordReset = () => {
    Alert.alert(
      'Password Reset',
      'A password reset link has been sent to your registered email.',
    );
  };


  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.getParent()?.reset({
              index: 0,
              routes: [
                {
                  name: 'Onboarding',
                },
              ],
            });
          },
        },
      ],
    );
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeTitle}>
          Welcome, {userInfo.name}!
        </Text>

        <Text style={styles.subtitle}>
          FitStudy Research Profile
        </Text>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Study Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Participant ID:
          </Text>

          <Text style={styles.infoValue}>
            {userInfo.studyId}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Assigned Cohort:
          </Text>

          <Text style={styles.infoValue}>
            {userInfo.group}
          </Text>
        </View>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Overall Workout Completion
        </Text>

        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Completed Workouts
          </Text>

          <Text style={styles.progressValue}>
            {completedWorkouts} / {userInfo.totalTarget}
          </Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${overallProgress * 100}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressNote}>
          {completedWorkouts === userInfo.totalTarget
            ? 'All study workouts completed.'
            : `${
                userInfo.totalTarget - completedWorkouts
              } workouts remaining`}
        </Text>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Gamification Details
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGamificationInfo}
        >
          <Text style={styles.buttonText}>
            View Gamification Information
          </Text>
        </TouchableOpacity>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Settings & Preferences
        </Text>

        <View style={styles.settingRow}>
          <Text style={styles.infoLabel}>
            Notifications
          </Text>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary,
            }}
            thumbColor={COLORS.text}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.infoLabel}>
            High Contrast Text
          </Text>

          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary,
            }}
            thumbColor={COLORS.text}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePasswordReset}
        >
          <Text style={styles.buttonText}>
            Reset Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.logoutButton,
          ]}
          onPress={handleLogout}
        >
          <Text
            style={[
              styles.buttonText,
              styles.logoutText,
            ]}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 24) + 16
        : 50,
  },

  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },

  progressValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  progressBarBackground: {
    height: 12,
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 6,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  progressNote: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  button: {
    backgroundColor: COLORS.cardSecondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  buttonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },

  logoutButton: {
    backgroundColor: '#3A1E1E',
    borderColor: '#722F2F',
  },

  logoutText: {
    color: '#FF8080',
  },
});
