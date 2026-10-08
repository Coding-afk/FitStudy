import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

export default function OnboardingScreen({ navigation }) {
  const [heartCondition, setHeartCondition] = useState(null);
  const [injury, setInjury] = useState(null);
  const [pregnant, setPregnant] = useState(null);

  const allAnswered = heartCondition !== null && injury !== null && pregnant !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to FitStudy</Text>
        <Text style={styles.subtitle}>
          Before you begin, we need a few details to keep you safe.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Health Screening</Text>

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Do you have any heart conditions?</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, heartCondition === 'yes' && styles.toggleActive]}
              onPress={() => setHeartCondition('yes')}>
              <Text style={[styles.toggleText, heartCondition === 'yes' && styles.toggleTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, heartCondition === 'no' && styles.toggleActive]}
              onPress={() => setHeartCondition('no')}>
              <Text style={[styles.toggleText, heartCondition === 'no' && styles.toggleTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Any joint or muscle injuries?</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, injury === 'yes' && styles.toggleActive]}
              onPress={() => setInjury('yes')}>
              <Text style={[styles.toggleText, injury === 'yes' && styles.toggleTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, injury === 'no' && styles.toggleActive]}
              onPress={() => setInjury('no')}>
              <Text style={[styles.toggleText, injury === 'no' && styles.toggleTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>Pregnant or postpartum?</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, pregnant === 'yes' && styles.toggleActive]}
              onPress={() => setPregnant('yes')}>
              <Text style={[styles.toggleText, pregnant === 'yes' && styles.toggleTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, pregnant === 'no' && styles.toggleActive]}
              onPress={() => setPregnant('no')}>
              <Text style={[styles.toggleText, pregnant === 'no' && styles.toggleTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          ⚠️ You may stop or withdraw at any time during any workout without penalty.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, !allAnswered && styles.btnDisabled]}
        disabled={!allAnswered}
        onPress={() => {
          const id = '#FIT-' + Math.floor(10000 + Math.random() * 90000);
          navigation.navigate('WorkoutSelection', { participantId: id});
        }}>
        <Text style={styles.btnText}>Agree and continue</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Your data is anonymous and never shared.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  cardLabel: {
    fontSize: 12,
    color: '#888',
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
    color: '#111',
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
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  toggleActive: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3b82f6',
  },
  toggleText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#3b82f6',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#eee',
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#fcd34d',
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  btn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: {
    backgroundColor: '#93c5fd',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
  },
});