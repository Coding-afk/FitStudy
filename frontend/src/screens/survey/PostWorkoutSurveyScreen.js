// Mandatory post-workout survey. It validates all five ratings and submits only
// the assignment ID plus ratings; workout condition/user identity are derived server-side.

import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {saveSurveyResponse} from '../../services/survey';
import RatingSelector from '../../components/survey/RatingSelector';
import {COLORS} from '../../constants/theme';

export default function PostWorkoutSurveyScreen({navigation, route, onBack}) {
  const participantId = route?.params?.participantId ?? null;
  const assignmentId = route?.params?.assignmentId ?? null;

  const [motivation, setMotivation] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [easeOfUse, setEaseOfUse] = useState(null);
  const [perceivedConsistency, setPerceivedConsistency] = useState(null);
  const [perceivedUsefulness, setPerceivedUsefulness] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReturnHome = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {participantId},
        },
      ],
    });
  };

  // Only rating values and assignmentId are submitted. The backend verifies ownership,
  // prevents duplicates, derives condition/workoutId, and then completes the assignment.
  const handleSubmit = async () => {
    if (!assignmentId) {
      Alert.alert(
        'Missing workout assignment',
        'This survey is not linked to a workout. Please return to Home and try again.',
      );
      return;
    }

    if (
      !motivation ||
      !engagement ||
      !easeOfUse ||
      !perceivedConsistency ||
      !perceivedUsefulness
    ) {
      Alert.alert(
        'Missing Ratings',
        'Please provide a rating (1-5) for all questions before submitting.',
      );
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await saveSurveyResponse({
        assignmentId,
        motivation,
        engagement,
        easeOfUse,
        perceivedConsistency,
        perceivedUsefulness,
      });

      Alert.alert(
        'Thank You!',
        'Your feedback has been recorded. Your next workout is now available.',
        [{text: 'Continue', onPress: handleReturnHome}],
      );
    } catch (error) {
      console.error('Survey submission failed:', error);

      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      // If the server already has the survey, no duplicate was written.
      // Treat it as completed so a lost network response cannot trap the user.
      if (
        status === 409 &&
        typeof detail === 'string' &&
        detail.toLowerCase().includes('survey already exists')
      ) {
        Alert.alert(
          'Survey already submitted',
          'Your feedback was already recorded. You can continue to your next workout.',
          [{text: 'Continue', onPress: handleReturnHome}],
        );
        return;
      }

      Alert.alert(
        'Submission Failed',
        detail || 'Unable to submit your survey. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Post-Workout Survey</Text>
      <Text style={styles.subtitle}>
        Please rate your workout experience to help with our study research.
      </Text>

      <View style={styles.requiredCard}>
        <Text style={styles.requiredTitle}>Required before continuing</Text>
        <Text style={styles.requiredText}>
          Submitting this survey completes your current study workout and unlocks the next one.
        </Text>
      </View>

      <RatingSelector
        label="1. I felt focused and driven to complete the exercises in today's session."
        value={motivation}
        onSelect={setMotivation}
      />

      <RatingSelector
        label="2. The interface and activity kept my attention throughout the routine."
        value={engagement}
        onSelect={setEngagement}
      />

      <RatingSelector
        label="3. The instructions and visual prompts were clear and straightforward to follow."
        value={easeOfUse}
        onSelect={setEaseOfUse}
      />

      <RatingSelector
        label="4. I would be inclined to complete similar workout sessions on a regular schedule."
        value={perceivedConsistency}
        onSelect={setPerceivedConsistency}
      />

      <RatingSelector
        label="5. Today's session provided a valuable and effective exercise experience."
        value={perceivedUsefulness}
        onSelect={setPerceivedUsefulness}
      />

      <View style={styles.submitSection}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Survey</Text>
          )}
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  requiredCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 22,
  },
  requiredTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  requiredText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  submitSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
