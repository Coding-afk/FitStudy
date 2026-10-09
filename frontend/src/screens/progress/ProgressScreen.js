import { StyleSheet, Text, View, ScrollView } from 'react-native';

const workoutData = [
  {
    id: 1,
    name: 'Core and cardio',
    type: 'standard',
    motivation: 3,
  },
  {
    id: 2,
    name: 'Lower body strength',
    type: 'gamified',
    motivation: 4,
  },
  {
    id: 3,
    name: 'Full body HIIT',
    type: 'standard',
    motivation: 2,
  },
  {
    id: 4,
    name: 'Upper body circuit',
    type: 'gamified',
    motivation: 5,
  },
  {
    id: 5,
    name: 'Core and cardio',
    type: 'gamified',
    motivation: 4,
  },
  {
    id: 6,
    name: 'Lower body strength',
    type: 'standard',
    motivation: 3,
  },
  {
    id: 7,
    name: 'Full body HIIT',
    type: 'gamified',
    motivation: 5,
  },
];

const BAR_MAX_HEIGHT = 80;

export default function ProgressScreen() {
  const completed = workoutData.length;

  const total = 10;

  const avgMotivation = (
    workoutData.reduce((sum, workout) => sum + workout.motivation, 0) /
    completed
  ).toFixed(1);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Your progress</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed</Text>

            <Text style={styles.statValue}>
              {completed}

              <Text style={styles.statTotal}>/{total}</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. motivation</Text>

            <Text style={styles.statValue}>
              {avgMotivation}

              <Text style={styles.statTotal}>/5</Text>
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Motivation by workout</Text>

          <View style={styles.chartArea}>
            <View style={styles.bars}>
              {workoutData.map((workout, index) => (
                <View key={workout.id} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,

                      {
                        height: (workout.motivation / 5) * BAR_MAX_HEIGHT,
                      },

                      workout.type === 'gamified'
                        ? styles.barGamified
                        : styles.barStandard,
                    ]}
                  />

                  <Text style={styles.barLabel}>W{index + 1}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendGamified]} />

              <Text style={styles.legendText}>Gamified</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendStandard]} />

              <Text style={styles.legendText}>Standard</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.progressRow}>
            <Text style={styles.cardTitle}>Workouts remaining</Text>

            <Text style={styles.progressCount}>{total - completed}</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,

                {
                  width: `${(completed / total) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressNote}>
            Complete all 10 to unlock your reward.
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

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },

  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },

  statValue: {
    fontSize: 28,
    fontWeight: '500',
    color: '#111',
  },

  statTotal: {
    fontSize: 14,
    color: '#888',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111',
    marginBottom: 12,
  },

  chartArea: {
    height: 100,
    justifyContent: 'flex-end',
  },

  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT,
  },

  barWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },

  bar: {
    width: 20,
    borderRadius: 3,
  },

  barGamified: {
    backgroundColor: '#3b82f6',
  },

  barStandard: {
    backgroundColor: '#86efac',
  },

  barLabel: {
    fontSize: 9,
    color: '#aaa',
  },

  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },

  legendGamified: {
    backgroundColor: '#3b82f6',
  },

  legendStandard: {
    backgroundColor: '#86efac',
  },

  legendText: {
    fontSize: 10,
    color: '#888',
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressCount: {
    fontSize: 13,
    color: '#888',
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
