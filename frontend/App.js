import React from 'react';

import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { COLORS } from './src/constants/theme';

function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>FitStudy</Text>

        <Text style={styles.subtitle}>Application ready for development</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    padding: 24,
  },

  title: {
    color: COLORS.text,

    fontSize: 34,
    fontWeight: 'bold',

    marginBottom: 10,
  },

  subtitle: {
    color: COLORS.textSecondary,

    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
