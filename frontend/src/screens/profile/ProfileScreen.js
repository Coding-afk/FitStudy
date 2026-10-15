import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {changeUsername, getProfile} from '../../services/profile';
import {
  changePassword,
  logoutUser,
  reauthenticateCurrentUser,
} from '../../services/auth';
import {COLORS} from '../../constants/theme';

const PASSWORD_RULES = [
  {test: value => value.length >= 8, label: 'at least 8 characters'},
  {test: value => /[A-Z]/.test(value), label: 'one uppercase letter'},
  {test: value => /[0-9]/.test(value), label: 'one number'},
  {
    test: value => /[^A-Za-z0-9\s]/.test(value),
    label: 'one special character',
  },
];

export default function ProfileScreen({navigation, route}) {
  const participantId = route?.params?.participantId ?? null;

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [changingUsername, setChangingUsername] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Unable to load your profile');
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
    name: profile.name || 'Participant',
    studyId: profile.studyId || participantId || 'Not assigned',
    group: profile.group || 'participant',
    completedGamified: Number(profile.completedGamified ?? 0),
    completedNonGamified: Number(profile.completedNonGamified ?? 0),
    totalTarget: 10,
  };

  const completedWorkouts = Math.min(
    userInfo.totalTarget,
    Math.max(
      0,
      userInfo.completedGamified + userInfo.completedNonGamified,
    ),
  );

  const overallProgress = Math.min(
    1,
    Math.max(0, completedWorkouts / userInfo.totalTarget),
  );

  const handleGamificationInfo = () => {
    navigation.getParent()?.navigate('GamificationStatsAwards');
  };

  const openUsernameModal = () => {
    setNewUsername(profile.name || '');
    setUsernamePassword('');
    setUsernameModalVisible(true);
  };

  const performUsernameChange = async cleanUsername => {
    try {
      setChangingUsername(true);

      // Username changes also change Firebase's hidden synthetic login email.
      // Re-authenticate first so a stale session cannot change credentials.
      await reauthenticateCurrentUser(usernamePassword);

      const updatedProfile = await changeUsername(cleanUsername);

      setProfile(updatedProfile);
      setUsernameModalVisible(false);
      setUsernamePassword('');

      // Changing the username also changes the hidden Firebase Auth email on
      // the backend. Sign out immediately so the next session starts cleanly
      // with the new username.
      const rootNavigation = navigation.getParent();

      try {
        await logoutUser();
      } finally {
        rootNavigation?.reset({
          index: 0,
          routes: [{name: 'Welcome'}],
        });
      }

      Alert.alert(
        'Username changed',
        `Your username is now ${updatedProfile.name}. Please sign in again using the new username and your current password.`,
      );
    } catch (error) {
      console.error('Username change failed:', error);

      const detail = error?.response?.data?.detail;

      if (
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/wrong-password'
      ) {
        Alert.alert('Incorrect password', 'Your current password is incorrect.');
      } else if (error?.response?.status === 409) {
        Alert.alert(
          'Username unavailable',
          detail || 'That username is already taken.',
        );
      } else {
        Alert.alert(
          'Unable to change username',
          detail || error?.message || 'Please try again.',
        );
      }
    } finally {
      setChangingUsername(false);
    }
  };

  const handleChangeUsername = () => {
    const cleanUsername = newUsername.trim();

    if (!cleanUsername || !usernamePassword) {
      Alert.alert(
        'Missing information',
        'Enter a new username and your current password.',
      );
      return;
    }

    if (!/^[A-Za-z0-9_]{3,20}$/.test(cleanUsername)) {
      Alert.alert(
        'Invalid username',
        'Use 3-20 characters containing only letters, numbers and underscores.',
      );
      return;
    }

    if (cleanUsername.toLowerCase() === String(profile.name || '').toLowerCase()) {
      Alert.alert('Choose a new username', 'Enter a different username.');
      return;
    }

    Alert.alert(
      'Change username?',
      'Changing your username will sign you out. You will need to sign in again using your new username and current password.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Change Username',
          onPress: () => performUsernameChange(cleanUsername),
        },
      ],
    );
  };

  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing information', 'Please complete all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please confirm your new password.');
      return;
    }

    const missing = PASSWORD_RULES.filter(rule => !rule.test(newPassword)).map(
      rule => rule.label,
    );

    if (missing.length > 0) {
      Alert.alert(
        'Invalid password',
        `Your new password must include ${missing.join(', ')}.`,
      );
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        'Choose a new password',
        'Your new password must be different from your current password.',
      );
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      setPasswordModalVisible(false);
      Alert.alert('Success', 'Your password has been changed successfully.');
    } catch (error) {
      console.error('Password change failed:', error);

      if (
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/wrong-password'
      ) {
        Alert.alert('Incorrect password', 'Your current password is incorrect.');
      } else {
        Alert.alert(
          'Unable to change password',
          error?.message || 'Please try again.',
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutUser();
            navigation.getParent()?.reset({
              index: 0,
              routes: [{name: 'Welcome'}],
            });
          } catch (error) {
            console.error('Logout failed:', error);
            Alert.alert('Logout failed', 'Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Welcome, {userInfo.name}!</Text>
          <Text style={styles.subtitle}>FitStudy Research Profile</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Study Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Participant ID:</Text>
            <Text style={styles.infoValue}>{userInfo.studyId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Study role:</Text>
            <Text style={styles.infoValue}>{userInfo.group}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Workout Completion</Text>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Completed Workouts</Text>
            <Text style={styles.progressValue}>
              {completedWorkouts} / {userInfo.totalTarget}
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {width: `${overallProgress * 100}%`},
              ]}
            />
          </View>

          <Text style={styles.progressNote}>
            {completedWorkouts === userInfo.totalTarget
              ? 'All study workouts completed.'
              : `${userInfo.totalTarget - completedWorkouts} workouts remaining`}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Awards and Badges Details 🏅</Text>
          <TouchableOpacity style={styles.button} onPress={handleGamificationInfo}>
            <Text style={styles.buttonText}>🔥 View Awards & Badges 🔥</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings & Preferences</Text>

          <TouchableOpacity style={styles.button} onPress={openUsernameModal}>
            <Text style={styles.buttonText}>Change Username</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={openPasswordModal}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={usernameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUsernameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Username</Text>

            <Text style={styles.modalDescription}>
              Your username is what you use to sign in and what appears on the leaderboard.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="New username"
              placeholderTextColor={COLORS.textSecondary}
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />

            <TextInput
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor={COLORS.textSecondary}
              value={usernamePassword}
              onChangeText={setUsernamePassword}
              secureTextEntry
            />

            <Text style={styles.passwordHint}>
              Usernames use 3-20 letters, numbers or underscores.
            </Text>

            <View style={styles.usernameWarning}>
              <Text style={styles.usernameWarningTitle}>You will be signed out</Text>
              <Text style={styles.usernameWarningText}>
                After changing your username, sign in again using the new username and your current password.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setUsernameModalVisible(false)}
                disabled={changingUsername}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleChangeUsername}
                disabled={changingUsername}
              >
                {changingUsername ? (
                  <ActivityIndicator color={COLORS.text} />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor={COLORS.textSecondary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={COLORS.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={COLORS.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Text style={styles.passwordHint}>
              Use at least 8 characters, including an uppercase letter, a number
              and a special character.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setPasswordModalVisible(false)}
                disabled={changingPassword}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color={COLORS.text} />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 50,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  modalDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.cardSecondary,
    marginBottom: 10,
  },
  passwordHint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  usernameWarning: {
    backgroundColor: COLORS.cardSecondary,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  usernameWarningTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  usernameWarningText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelButton: {
    backgroundColor: COLORS.cardSecondary,
    borderColor: COLORS.border,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
});
