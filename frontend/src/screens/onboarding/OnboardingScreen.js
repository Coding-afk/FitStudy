import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../../constants/theme';

export default function OnboardingScreen({ navigation, route }) {
  const { participantId } = route.params || {};

  const [heartCondition, setHeartCondition] = useState(null);
  const [injury, setInjury] = useState(null);
  const [pregnant, setPregnant] = useState(null);
  const [asthma, setAsthma] = useState(null);
  const [medication, setMedication] = useState(null);
  const [ageRange, setAgeRange] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [exerciseFrequency, setExerciseFrequency] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const allAnswered =
    heartCondition !== null &&
    injury !== null &&
    pregnant !== null &&
    asthma !== null &&
    medication !== null &&
    ageRange !== null &&
    fitnessLevel !== null &&
    exerciseFrequency !== null;

  const saveToFirestore = async () => {
    setLoading(true);
    try {
      const user = auth().currentUser;
      await firestore()
        .collection('onboarding')
        .doc(user.uid)
        .set({
          participantId,
          heartCondition,
          injury,
          pregnant,
          asthma,
          medication,
          ageRange,
          fitnessLevel,
          exerciseFrequency,
          completedAt: firestore.FieldValue.serverTimestamp(),
        });
      navigation.navigate('MainTabs', { participantId });
    } catch (error) {
      console.error('Error saving onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (heartCondition === 'yes' || medication === 'yes') {
      setBlocked(true);
      setShowWarning(true);
      return;
    }
    if (injury === 'yes' || pregnant === 'yes' || asthma === 'yes') {
      setBlocked(false);
      setShowWarning(true);
      return;
    }
    saveToFirestore();
  };

  const ToggleQuestion = ({ question, value, onChange }) => (
    <View style={styles.questionRow}>
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, value === 'yes' && styles.toggleActive]}
          onPress={() => onChange('yes')}>
          <Text style={[styles.toggleText, value === 'yes' && styles.toggleTextActive]}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, value === 'no' && styles.toggleActive]}
          onPress={() => onChange('no')}>
          <Text style={[styles.toggleText, value === 'no' && styles.toggleTextActive]}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const OptionQuestion = ({ question, options, value, onChange }) => (
    <View style={styles.optionSection}>
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.optionRow}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.optionBtn, value === option && styles.optionBtnActive]}
            onPress={() => onChange(option)}>
            <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Health Screening</Text>
        <Text style={styles.subtitle}>
          Please answer all questions honestly. Your answers are stored anonymously and used only for research purposes.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Health conditions</Text>
        <ToggleQuestion
          question="Do you have any heart conditions?"
          value={heartCondition}
          onChange={setHeartCondition}
        />
        <View style={styles.divider} />
        <ToggleQuestion
          question="Any joint or muscle injuries?"
          value={injury}
          onChange={setInjury}
        />
        <View style={styles.divider} />
        <ToggleQuestion
          question="Pregnant or postpartum?"
          value={pregnant}
          onChange={setPregnant}
        />
        <View style={styles.divider} />
        <ToggleQuestion
          question="Do you have any breathing conditions such as asthma?"
          value={asthma}
          onChange={setAsthma}
        />
        <View style={styles.divider} />
        <ToggleQuestion
          question="Are you currently on medication that affects physical activity?"
          value={medication}
          onChange={setMedication}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>About you</Text>
        <OptionQuestion
          question="What is your age range?"
          options={['18-24', '25-34', '35-44', '45+']}
          value={ageRange}
          onChange={setAgeRange}
        />
        <View style={styles.divider} />
        <OptionQuestion
          question="What is your fitness level?"
          options={['Beginner', 'Intermediate', 'Advanced']}
          value={fitnessLevel}
          onChange={setFitnessLevel}
        />
        <View style={styles.divider} />
        <OptionQuestion
          question="How often do you currently exercise?"
          options={['Never', '1-2x/week', '3-4x/week', '5+/week']}
          value={exerciseFrequency}
          onChange={setExerciseFrequency}
        />
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          ⚠️ You may stop or withdraw at any time during any workout without penalty.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, !allAnswered && styles.btnDisabled]}
        disabled={!allAnswered || loading}
        onPress={handleContinue}>
        <Text style={styles.btnText}>
          {loading ? 'Saving...' : 'Agree and continue'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Your data is anonymous and never shared.</Text>

      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {blocked ? (
              <>
                <Text style={styles.modalTitle}>Unable to participate</Text>
                <Text style={styles.modalText}>
                  Based on your health screening answers, we are unable to include you in this study for your safety. This study involves physical activity that may not be suitable for your current health condition.
                </Text>
                <TouchableOpacity
                  style={styles.modalBtnDanger}
                  onPress={() => {
                    setShowWarning(false);
                    navigation.navigate('Welcome');
                  }}>
                  <Text style={styles.modalBtnText}>Return to home</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Please note</Text>
                <Text style={styles.modalText}>
                  Based on your answers, you may have a condition that requires extra care during physical activity. You may still participate but please listen to your body and stop immediately if you feel unwell. You can withdraw at any time.
                </Text>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => {
                    setShowWarning(false);
                    saveToFirestore();
                  }}>
                  <Text style={styles.modalBtnText}>I understand, continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnOutline}
                  onPress={() => setShowWarning(false)}>
                  <Text style={styles.modalBtnOutlineText}>Go back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

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
    fontSize: 13,
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
  optionSection: {
    paddingVertical: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSecondary,
  },
  optionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  optionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  optionTextActive: {
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
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnDanger: {
    backgroundColor: '#e53e3e',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  modalBtnOutline: {
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  modalBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  modalBtnOutlineText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});