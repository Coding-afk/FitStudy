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
import { COLORS } from '../../constants/theme';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASSWORD_RULES = [
  { test: pw => pw.length >= 8, label: 'at least 8 characters' },
  { test: pw => /[A-Z]/.test(pw), label: 'one uppercase letter' },
  { test: pw => /[0-9]/.test(pw), label: 'one number' },
  { test: pw => /[^A-Za-z0-9\s]/.test(pw), label: 'one special character' },
];

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Please enter a username';
    if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!email.trim()) newErrors.email = 'Please enter your email address';
    else if (!EMAIL_PATTERN.test(email.trim())) newErrors.email = 'Please enter a valid email address';
    if (!password) {
      newErrors.password = 'Please enter a password';
    } else {

      const missing = PASSWORD_RULES.filter(rule => !rule.test(password)).map(rule => rule.label);
      if (missing.length > 0) {
        newErrors.password = 'Password must include ' + missing.join(', ') + '.';
      }
    }
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const normalisedEmail = email.trim().toLowerCase();

      const participantId = '#FIT-' + Math.floor(10000 + Math.random() * 90000);
      navigation.navigate('Onboarding', { participantId, username });
    } catch (error) {
      Alert.alert('Registration failed', error.message);
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
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="you@example.com"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Text style={styles.hint}>Used only to reset your password and recover your account.</Text>
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}
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
        <Text style={styles.hint}>At least 8 characters, with an uppercase letter, a number and a special character.</Text>
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