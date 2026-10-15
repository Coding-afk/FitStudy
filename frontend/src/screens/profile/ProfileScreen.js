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
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  getProfile,
  updateUsername
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
  const [newUsername, setNewUsername] = useState('');
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);

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

  const handleUsernameReset = () => {
    setNewUsername('');
    setUsernameModalVisible(true);
  };

  const saveUsername = async () => {
    const username = newUsername?.trim();
    if (!username || username.length < 3 || username.length > 20) {
      Alert.alert(
        'Invalid Username',
        'Username must be between 3 and 20 characters.',
      );
      return;
    }
    try {
      await updateUsername(username);
      Alert.alert(
        'Success',
        'Your username has been updated.',
      );
      const updateProfile = await getProfile();
      setProfile(updateProfile);
      setUsernameModalVisible(false);
    } catch (error) {
      console.error("Username update failed:", error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Could not update username.',
      );
    }
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
    <Modal
      visible={usernameModalVisible}
      transparent
      animationType='fade'
      onRequestClose={() => setUsernameModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reset Username</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter new username'
            placeholderTextColor={COLORS.textSecondary}
            value={newUsername}
            onChangeText={setNewUsername}
            autoCapitalize='none'
            maxLength={20}
          />
          <View style={styles.modelButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setUsernameModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={saveUsername}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
         🏆 Awards and Badges Details 🏅
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGamificationInfo}
        >
          <Text style={styles.buttonText}>
           🔥 View Awards & Badges 🔥
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Settings & Preferences
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUsernameReset}
        >
          <Text style={styles.buttonText}>
            Reset Username
          </Text>
        </TouchableOpacity>

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

  modalOverlay: {
    flex: 1,
    backgroundColor:  'rgba(0,0,0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
});