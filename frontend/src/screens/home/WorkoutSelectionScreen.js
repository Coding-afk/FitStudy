import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

const workouts = [
  { id: 1, name: 'Upper body circuit', duration: 20, level: 'Intermediate', completed: false },
  { id: 2, name: 'Core and cardio', duration: 25, level: 'Intermediate', completed: true },
  { id: 3, name: 'Lower body strength', duration: 30, level: 'Intermediate', completed: true },
  { id: 4, name: 'Full body HIIT', duration: 20, level: 'Intermediate', completed: true },
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
              <Text style={styles.upNextMeta}>{upNext.duration} min · {upNext.level} · Workout {completed + 1} of {total}</Text>
              <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('StandardWorkout')}>
                <Text style={styles.startBtnText}>Start workout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Completed</Text>
        <View style={styles.card}>
          {workouts.filter(w => w.completed).map((workout, index, arr) => (
            <View key={workout.id} style={[styles.workoutRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutMeta}>{workout.duration} min · {workout.level}</Text>
              </View>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ))}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Overall progress</Text>
            <Text style={styles.progressCount}>{completed} / {total} done</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressNote}>Complete all 10 workouts to unlock your reward.</Text>
        </View>

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('WorkoutSelection', { participantId })}>
          <Text style={styles.navIconActive}>⌂</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress', { participantId })}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Account', { participantId })}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Account</Text>
        </TouchableOpacity>
      </View>

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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
  },
  navIcon: {
    fontSize: 20,
    color: '#aaa',
  },
  navIconActive: {
    fontSize: 20,
    color: '#3b82f6',
  },
  navLabel: {
    fontSize: 10,
    color: '#aaa',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#3b82f6',
  },
});