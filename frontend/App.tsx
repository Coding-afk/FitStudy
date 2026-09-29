import React, { useState } from 'react';

import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { auth } from './src/config/firebase';
import { loginUser, registerUser } from './src/services/auth';


function App() {
  const [message, setMessage] = useState('Ready');

  const testRegistration = async () => {
    try {
      const result = await registerUser(
        'fitstudytest@example.com',
        'Test123456!',
      );

      setMessage(`Registered: ${result.user.uid}`);
    } catch (error) {
      console.log(error);

      setMessage('Registration failed');
    }
  };
  const testLogin = async () => {
    try {
      const result = await loginUser('fitstudytest@example.com', 'Test123456!');

      setMessage(`Logged in: ${result.user.uid}`);
    } catch (error) {
      console.log(error);

      setMessage('Login failed');
    }
  };

  const testToken = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      setMessage('No user is currently logged in');
      return;
    }

    const token = await user.getIdToken();

    if (token) {
      setMessage('Firebase ID token received');
    }
  } catch (error) {
    console.log(error);

    setMessage('Could not get Firebase ID token');
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>{message}</Text>

        <Button title="Test Firebase Registration" onPress={testRegistration} />
        <Button title="Test Login" onPress={testLogin} />
        <Button title="Test ID Token" onPress={testToken} />
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
});

export default App;
