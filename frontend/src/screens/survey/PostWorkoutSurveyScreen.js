import React, { useState } from 'react';
import { saveSurveyResponse } from '../../services/survey';
import { View, Text, StyleSheet, Button, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import RatingSelector from '../../components/survey/RatingSelector';
import { COLORS } from '../../constants/theme';

export default function PostWorkoutSurveyScreen({ navigation, route, onBack }) {
  //const assignmentId = route?.params?.assignmentId || null;

  const [motivation, setMotivation] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [easeOfUse, setEaseOfUse] = useState(null);
  const [perceivedConsistency, setPerceivedConsistency] = useState(null);
  const [perceivedUsefulness, setPerceivedUsefulness] = useState(null);

  const handleSubmit = async () => {
    if (!motivation || !engagement || !easeOfUse || !perceivedConsistency || !perceivedUsefulness) {
      Alert.alert(
        'Missing Ratings',
        'Please provide a rating (1-5) for all questions before submitting.'
      );
      return;
    }

    const payload = {
      //assignmentId,
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
          onPress: () => {
            if (onBack) onBack();
            else if (navigation?.navigate) navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      console.error('Survey submission failed:', error);
      Alert.alert(
        'Submission Failed',
        'Unable to submit your survey. Please try again.'
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Post-Workout Survey</Text>
      <Text style={styles.subtitle}>
        Please rate your workout experience to help with our study research.
      </Text>

      <RatingSelector
        label="1. How motivated were you during this session?"
        value={motivation}
        onSelect={setMotivation}
      />

      <RatingSelector
        label="2. How engaging was the workout routine?"
        value={engagement}
        onSelect={setEngagement}
      />

      <RatingSelector
        label="3. How easy was it to follow the instructions?"
        value={easeOfUse}
        onSelect={setEaseOfUse}
      />

      <RatingSelector
        label="4. How likely are you to maintain workout consistency with this routine?"
        value={perceivedConsistency}
        onSelect={setPerceivedConsistency}
      />

      <RatingSelector
        label="5. How useful was this session in helping achieve your fitness goals?"
        value={perceivedUsefulness}
        onSelect={setPerceivedUsefulness}
      />

      <View style={styles.submitSection}>
        <Button title="Submit Survey" onPress={handleSubmit} color={COLORS.primaryLight} />
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 50,
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
});