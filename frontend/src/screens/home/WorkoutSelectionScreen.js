import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/theme';

const workouts = [
  {
    id: 1,
    name: 'Upper body circuit',
    duration: 20,
    level: 'Intermediate',
    completed: false,
  },
  {
    id: 2,
    name: 'Core and cardio',
    duration: 25,
    level: 'Intermediate',
    completed: true,
  },
  {
    id: 3,
    name: 'Lower body strength',
    duration: 30,
    level: 'Intermediate',
    completed: true,
  },
  {
    id: 4,
    name: 'Full body HIIT',
    duration: 20,
    level: 'Intermediate',
    completed: true,
  },
];

export default function WorkoutSelectionScreen({ navigation, route }) {
  const { participantId } = route.params || {};
  const completed = workouts.filter(w => w.completed).length;
  const total = 10;
  const progress = completed / total;
  const upNext = workouts.find(w => !w.completed);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Your workouts</Text>

        {upNext && (
          <>
            <Text style={styles.sectionLabel}>Up next</Text>
            <View style={styles.upNextCard}>
              <Text style={styles.upNextName}>{upNext.name}</Text>
              <Text style={styles.upNextMeta}>
                {upNext.duration} min · {upNext.level} · Workout {completed + 1}{' '}
                of {total}
              </Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() =>
                  navigation.navigate('StandardWorkout', { participantId })
                }
              >
                <Text style={styles.startBtnText}>Start workout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Completed</Text>
        <View style={styles.card}>
          {workouts
            .filter(w => w.completed)
            .map((workout, index, arr) => (
              <View
                key={workout.id}
                style={[
                  styles.workoutRow,
                  index === arr.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {workout.duration} min · {workout.level}
                  </Text>
                </View>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ))}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Overall progress</Text>
            <Text style={styles.progressCount}>
              {completed} / {total} done
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressNote}>
            Complete all 10 workouts to unlock your reward.
          </Text>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
    marginTop: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  upNextCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  upNextName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  upNextMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  startBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  workoutName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  workoutMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.success,
  },
  progressSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
  },
  navIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  navIconActive: {
    fontSize: 20,
    color: COLORS.primary,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  navLabelActive: {
    fontSize: 10,
    color: COLORS.primary,
  },
});
