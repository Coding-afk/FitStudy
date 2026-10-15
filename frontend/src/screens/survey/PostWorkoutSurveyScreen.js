import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';

import { saveSurveyResponse } from '../../services/survey';

import RatingSelector from '../../components/survey/RatingSelector';

import { COLORS } from '../../constants/theme';

export default function PostWorkoutSurveyScreen({ navigation, route, onBack }) {
  const participantId = route?.params?.participantId ?? null;
  const assignmentId = route?.params?.assignmentId ?? null;
  const workoutId = route?.params?.workoutId ?? null;
  const condition = route?.params?.condition ?? null;

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

          params: {
            participantId,
          },
        },
      ],
    });
  };

  const handleSubmit = async () => {
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

    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      assignmentId,
      workoutId,
      condition,
      motivation,
      engagement,
      easeOfUse,
      perceivedConsistency,
      perceivedUsefulness,
    };

    try {
      await saveSurveyResponse(payload);

      Alert.alert('Thank You!', 'Your feedback has been recorded.', [
        {
          text: 'Continue',
          onPress: handleReturnHome,
        },
      ]);
    } catch (error) {
      console.error('Survey submission failed:', error);

      Alert.alert(
        'Submission Failed',
        'Unable to submit your survey. Please try again.',
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
        label="3. The instructions and visual prompts were clear and straightforward to follow"
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
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
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
    marginBottom: 24,
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