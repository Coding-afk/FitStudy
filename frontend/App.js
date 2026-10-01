import React from 'react';

import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>FitStudy</Text>

        <Text style={styles.subtitle}>Welcome to FitStudy</Text>

        <Text style={styles.text}>
          Hope you enjoy your time here!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 20,
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
