// New-participant registration screen. It creates the Firebase Auth account,
// saves the initial profile, and cleans up the Auth user if profile creation fails.

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { deleteRegisteredUser, registerUser } from '../../services/auth';
import { saveProfile } from '../../services/profile';
import { COLORS } from '../../constants/theme';

const PASSWORD_RULES = [
  { test: value => value.length >= 8, label: 'at least 8 characters' },
  { test: value => /[A-Z]/.test(value), label: 'one uppercase letter' },
  { test: value => /[0-9]/.test(value), label: 'one number' },
  {
    test: value => /[^A-Za-z0-9\s]/.test(value),
    label: 'one special character',
  },
];

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Perform basic client-side validation for immediate user feedback.
   *
   * Firebase and the backend remain responsible for enforcing the actual
   * authentication and account rules.
   */
  const validate = () => {
    const newErrors = {};
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      newErrors.username = 'Please enter a username';
    } else if (cleanUsername.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (cleanUsername.length > 20) {
      newErrors.username = 'Username must be 20 characters or fewer';
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      newErrors.username = 'Use only letters, numbers and underscores';
    }

    if (!password) {
      newErrors.password = 'Please enter a password';
    } else {
      const missing = PASSWORD_RULES.filter(rule => !rule.test(password)).map(
        rule => rule.label,
      );

      if (missing.length > 0) {
        newErrors.password = `Password must include ${missing.join(', ')}.`;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Registration involves two separate systems:
   *
   * 1. Firebase Authentication creates the login account.
   * 2. The FitStudy backend stores the participant profile.
   *
   * If Firebase succeeds but profile creation fails, the newly created
   * Firebase user is removed again. This prevents an orphan Firebase account
   * from existing without its required FitStudy profile.
   */
  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Firebase creates the authentication account first.
      const credential = await registerUser(username, password);

      const participantId = '#FIT-' + Math.floor(10000 + Math.random() * 90000);

      try {
        // The backend profile must exist before registration is considered complete.
        await saveProfile({
          username: username.trim(),
          participantId,
        });
      } catch (profileError) {
        /**
         * Firebase Auth succeeded, but the participant profile did not.
         * Remove the newly created Auth user to avoid leaving an incomplete account.
         */
        try {
          await deleteRegisteredUser(credential.user);
        } catch (cleanupError) {
          console.error(
            'Failed to clean up incomplete Firebase account:',
            cleanupError,
          );
        }

        // Re-throw the original profile error so normal registration
        // error handling below can display feedback to the participant.
        throw profileError;
      }

      // Registration succeeded, so continue to mandatory health screening.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Username already taken',
          'An account with this username already exists. Please choose another username or sign in instead.',
        );
        return;
      }

      if (error.code === 'auth/weak-password') {
        Alert.alert('Password too weak', 'Please choose a stronger password.');
        return;
      }

      if (error.code === 'auth/network-request-failed') {
        Alert.alert(
          'Connection error',
          'Unable to connect. Please check your internet connection and try again.',
        );
        return;
      }

      console.error('Registration failed:', error);

      Alert.alert(
        'Registration failed',
        'Something went wrong while creating your account. Please try again.',
      );
    } finally {
      // Re-enable the form after either success or failure.
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🏃</Text>
        </View>
      </View>

      <Text style={styles.title}>Create an account</Text>

      <Text style={styles.subtitle}>
        Create your anonymous account first. You will complete the health
        screening before entering the study.
      </Text>

      <View style={styles.inputWrap}>
        <Text style={styles.label}>Username</Text>

        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="Choose a username"
          placeholderTextColor={COLORS.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.hint}>
          Don't use your real name — keep it anonymous.
        </Text>

        {errors.username && <Text style={styles.error}>{errors.username}</Text>}
      </View>

      <View style={styles.inputWrap}>
        <Text style={styles.label}>Password</Text>

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Create a password"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.hint}>
          At least 8 characters, with an uppercase letter, a number and a
          special character.
        </Text>

        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>

      <View style={styles.inputWrap}>
        <Text style={styles.label}>Confirm password</Text>

        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Repeat your password"
          placeholderTextColor={COLORS.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Create account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>already have an account?</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Sign in instead →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    alignItems: 'center',
  },
  logoWrap: {
    marginTop: 40,
    marginBottom: 16,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  inputWrap: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    fontSize: 13,
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  hint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  error: {
    fontSize: 11,
    color: '#e53e3e',
    marginTop: 4,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.5,
  },
  btnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '500',
  },
});
