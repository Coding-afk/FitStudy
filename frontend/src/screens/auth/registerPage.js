import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../../constants/theme';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Please enter a username';
    if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!password) newErrors.password = 'Please enter a password';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const email = `${username.trim().toLowerCase()}@fitstudy.app`;
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const participantId = '#FIT-' + Math.floor(10000 + Math.random() * 90000);
      await firestore().collection('users').doc(userCredential.user.uid).set({
        username: username.trim(),
        participantId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        workoutsCompleted: 0,
      });
      navigation.navigate('Onboarding', { participantId, username: username.trim() });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ username: 'This username is already taken. Try another.' });
      } else {
        Alert.alert('Registration failed', error.message);
      }
    } finally {
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
        Your account keeps track of your progress anonymously throughout the study.
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
        />
        <Text style={styles.hint}>Don't use your real name — keep it anonymous.</Text>
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
        <Text style={styles.hint}>At least 6 characters.</Text>
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
        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Create account</Text>
        }
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