import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useState } from 'react';

import { COLORS } from '../../constants/theme';

export default function OnboardingScreen({ navigation, route }) {
  const { participantId } = route.params || {};
  const [heartCondition, setHeartCondition] = useState(null);
  const [injury, setInjury] = useState(null);
  const [pregnant, setPregnant] = useState(null);

  const allAnswered =
    heartCondition !== null && injury !== null && pregnant !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Screening</Text>
        <Text style={styles.subtitle}>
          Before you begin, we need a few details to keep you safe.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Please answer all questions</Text>

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>
            Do you have any heart conditions?
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                heartCondition === 'yes' && styles.toggleActive,
              ]}
              onPress={() => setHeartCondition('yes')}
            >
              <Text
                style={[
                  styles.toggleText,
                  heartCondition === 'yes' && styles.toggleTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                heartCondition === 'no' && styles.toggleActive,
              ]}
              onPress={() => setHeartCondition('no')}
            >
              <Text
                style={[
                  styles.toggleText,
                  heartCondition === 'no' && styles.toggleTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Any joint or muscle injuries?</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                injury === 'yes' && styles.toggleActive,
              ]}
              onPress={() => setInjury('yes')}
            >
              <Text
                style={[
                  styles.toggleText,
                  injury === 'yes' && styles.toggleTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, injury === 'no' && styles.toggleActive]}
              onPress={() => setInjury('no')}
            >
              <Text
                style={[
                  styles.toggleText,
                  injury === 'no' && styles.toggleTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Pregnant or postpartum?</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                pregnant === 'yes' && styles.toggleActive,
              ]}
              onPress={() => setPregnant('yes')}
            >
              <Text
                style={[
                  styles.toggleText,
                  pregnant === 'yes' && styles.toggleTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                pregnant === 'no' && styles.toggleActive,
              ]}
              onPress={() => setPregnant('no')}
            >
              <Text
                style={[
                  styles.toggleText,
                  pregnant === 'no' && styles.toggleTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          ⚠️ You may stop or withdraw at any time during any workout without
          penalty.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, !allAnswered && styles.btnDisabled]}
        disabled={!allAnswered}
        onPress={() => {
          navigation.navigate('Register', { participantId });
        }}
      >
        <Text style={styles.btnText}>Agree and continue</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Your data is anonymous and never shared.
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  questionText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    paddingRight: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSecondary,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: COLORS.text,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
  },
  warningCard: {
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.5,
  },
  btnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
