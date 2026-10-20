// Health screening and consent flow. The backend evaluates eligibility so a
// participant cannot bypass warning/blocked rules by changing frontend state alone.

import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {logoutUser} from '../../services/auth';
import {submitHealthScreening} from '../../services/profile';
import {COLORS} from '../../constants/theme';

export default function OnboardingScreen({navigation}) {
  const [heartCondition, setHeartCondition] = useState(null);
  const [injury, setInjury] = useState(null);
  const [pregnant, setPregnant] = useState(null);
  const [asthma, setAsthma] = useState(null);
  const [medication, setMedication] = useState(null);
  const [ageRange, setAgeRange] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [exerciseFrequency, setExerciseFrequency] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [serverMessage, setServerMessage] = useState('');

  const allAnswered =
    heartCondition !== null &&
    injury !== null &&
    pregnant !== null &&
    asthma !== null &&
    medication !== null &&
    ageRange !== null &&
    fitnessLevel !== null &&
    exerciseFrequency !== null;

  const getScreeningData = () => ({
    heartCondition,
    injury,
    pregnant,
    asthma,
    medication,
    ageRange,
    fitnessLevel,
    exerciseFrequency,
  });

  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  };

  // Send raw answers to the backend; eligibility/warning/blocked decisions must
  // be made server-side so they cannot be bypassed by editing the client.
  const submitScreening = async warningAcknowledged => {
    if (!allAnswered) {
      return;
    }

    setLoading(true);

    try {
      const result = await submitHealthScreening(
        getScreeningData(),
        warningAcknowledged,
      );

      if (result.outcome === 'eligible') {
        setShowWarning(false);
        goToHome();
        return;
      }

      setOutcome(result.outcome);
      setServerMessage(result.message || '');
      setShowWarning(true);
    } catch (error) {
      console.error('Health screening failed:', error);

      Alert.alert(
        'Unable to submit screening',
        error?.response?.data?.detail ||
          error?.message ||
          'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    submitScreening(false);
  };

  const handleWarningContinue = () => {
    submitScreening(true);
  };

  // Blocked participants are signed out before returning to Welcome so an
  // authenticated session cannot accidentally continue into the study.
  const handleBlockedReturn = async () => {
    setShowWarning(false);
    setLoading(true);

    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to sign out blocked participant:', error);
    } finally {
      // Always leave the screening screen. Previously this reset only
      // happened when logout failed, so a successful logout could leave
      // the participant visually stuck on Health Screening.
      navigation.reset({
        index: 0,
        routes: [{name: 'Welcome'}],
      });

      setLoading(false);
    }
  };

  const ToggleQuestion = ({question, value, onChange}) => (
    <View style={styles.questionRow}>
      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, value === 'yes' && styles.toggleActive]}
          onPress={() => onChange('yes')}>
          <Text
            style={[
              styles.toggleText,
              value === 'yes' && styles.toggleTextActive,
            ]}>
            Yes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, value === 'no' && styles.toggleActive]}
          onPress={() => onChange('no')}>
          <Text
            style={[
              styles.toggleText,
              value === 'no' && styles.toggleTextActive,
            ]}>
            No
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const OptionQuestion = ({question, options, value, onChange}) => (
    <View style={styles.optionSection}>
      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.optionRow}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionBtn,
              value === option && styles.optionBtnActive,
            ]}
            onPress={() => onChange(option)}>
            <Text
              style={[
                styles.optionText,
                value === option && styles.optionTextActive,
              ]}>
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
          Please answer all questions honestly. Your screening is saved against
          your anonymous participant account and is used to determine study
          eligibility.
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
          question="Do you currently have an injury that may affect exercise?"
          value={injury}
          onChange={setInjury}
        />

        <View style={styles.divider} />

        <ToggleQuestion
          question="Are you currently pregnant?"
          value={pregnant}
          onChange={setPregnant}
        />

        <View style={styles.divider} />

        <ToggleQuestion
          question="Do you have asthma or another breathing condition?"
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
          ⚠️ You may stop or withdraw at any time during any workout without
          penalty.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, (!allAnswered || loading) && styles.btnDisabled]}
        disabled={!allAnswered || loading}
        onPress={handleContinue}>
        {loading ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <Text style={styles.btnText}>Agree and continue</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Your screening is linked only to your anonymous participant account.
      </Text>

      <Modal
        visible={showWarning}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (outcome !== 'blocked') {
            setShowWarning(false);
          }
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {outcome === 'blocked' ? (
              <>
                <Text style={styles.modalTitle}>Unable to participate</Text>

                <Text style={styles.modalText}>
                  {serverMessage ||
                    'Based on your health screening answers, we are unable to include you in this study for your safety.'}
                </Text>

                <TouchableOpacity
                  style={styles.modalBtnDanger}
                  onPress={handleBlockedReturn}>
                  <Text style={styles.modalBtnText}>Return to welcome</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Please note</Text>

                <Text style={styles.modalText}>
                  {serverMessage ||
                    'One or more of your answers may require extra care during physical activity. You may continue after acknowledging this warning.'}
                </Text>

                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={handleWarningContinue}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={COLORS.text} />
                  ) : (
                    <Text style={styles.modalBtnText}>
                      I understand, continue
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalBtnOutline}
                  onPress={() => setShowWarning(false)}
                  disabled={loading}>
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
