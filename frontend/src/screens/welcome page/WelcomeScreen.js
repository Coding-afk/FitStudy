import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {COLORS} from '../../constants/theme';

export default function WelcomeScreen({navigation}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🏃</Text>
        </View>
      </View>

      <View style={styles.tagWrap}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Research study</Text>
        </View>
      </View>

      <Text style={styles.title}>Welcome to FitStudy</Text>

      <Text style={styles.subtitle}>
        We are investigating whether gamified workouts improve motivation and
        consistency compared to standard workouts.
      </Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>📋</Text>
          </View>

          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>What you'll do</Text>
            <Text style={styles.infoText}>
              Complete 10 workouts — a mix of gamified and standard — and
              answer a short survey after each one.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>⏱️</Text>
          </View>

          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>How long</Text>
            <Text style={styles.infoText}>
              Each workout is 20–30 minutes. The survey takes under a minute.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>🔒</Text>
          </View>

          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Your data</Text>
            <Text style={styles.infoText}>
              Your account uses an anonymous username and participant ID. You
              will complete a health screening before entering the study.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          ⚠️ You may stop or withdraw at any time without penalty.
          Participation is completely voluntary.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Register')}>
        <Text style={styles.primaryButtonText}>Create account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.secondaryButtonText}>Sign in</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        New participants complete the health screening after account creation.
      </Text>
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
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 28,
  },
  tagWrap: {
    marginBottom: 16,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoIconText: {
    fontSize: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
  },
  warningCard: {
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  warningText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});
