import React from 'react';

import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>FitStudy</Text>

        <Text style={styles.text}>Welcome to FitStudy</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },

  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default App;
