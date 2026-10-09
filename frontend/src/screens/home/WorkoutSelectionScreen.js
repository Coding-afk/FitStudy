import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const workouts = [
  {
    id: 1,
    workoutId: 'W001',
    name: 'Upper body circuit',
    duration: 20,
    level: 'Intermediate',

    // Temporary until the real
    // workoutAssignments system is
    // connected.
    condition: 'non-gamified',

    completed: false,
  },

  {
    id: 2,
    workoutId: 'W002',
    name: 'Core and cardio',
    duration: 25,
    level: 'Intermediate',
    condition: 'gamified',
    completed: true,
  },

  {
    id: 3,
    workoutId: 'W003',
    name: 'Lower body strength',
    duration: 30,
    level: 'Intermediate',
    condition: 'non-gamified',
    completed: true,
  },

  {
    id: 4,
    workoutId: 'W004',
    name: 'Full body HIIT',
    duration: 20,
    level: 'Intermediate',
    condition: 'gamified',
    completed: true,
  },
];

export default function WorkoutSelectionScreen({ navigation, route }) {
  const participantId = route.params?.participantId ?? null;

  const completed = workouts.filter(workout => workout.completed).length;

  const total = 10;

  const progress = completed / total;

  const upNext = workouts.find(workout => !workout.completed);

  const handleStartWorkout = () => {
    if (!upNext) {
      return;
    }

    const screenName =
      upNext.condition === 'gamified'
        ? 'GamifiedWorkout'
        : 'NonGamifiedWorkout';

    navigation.getParent()?.navigate(screenName, {
      workoutId: upNext.workoutId,

      participantId,
    });
  };

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
                {upNext.duration} min
                {' · '}
                {upNext.level}
                {' · '}
                Workout {completed + 1}
                {' of '}
                {total}
              </Text>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={handleStartWorkout}
              >
                <Text style={styles.startBtnText}>Start workout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Completed</Text>

        <View style={styles.card}>
          {workouts
            .filter(workout => workout.completed)
            .map((workout, index, array) => (
              <View
                key={workout.id}
                style={[
                  styles.workoutRow,

                  index === array.length - 1 && styles.lastWorkoutRow,
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
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
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
    backgroundColor: '#f5f5f5',
  },

  container: {
    flexGrow: 1,
    padding: 24,
  },

  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    marginBottom: 20,
    marginTop: 40,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111',
    marginBottom: 8,
  },

  upNextCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    borderWidth: 0.5,
    borderColor: '#ddd',
  },

  upNextName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4,
  },

  upNextMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },

  startBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },

  startBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },

  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },

  lastWorkoutRow: {
    borderBottomWidth: 0,
  },

  workoutName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },

  workoutMeta: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },

  checkmark: {
    fontSize: 16,
    color: '#22c55e',
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
    color: '#888',
  },

  progressCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111',
  },

  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },

  progressNote: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
});
