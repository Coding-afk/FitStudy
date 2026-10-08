import { StyleSheet, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';

import WorkoutSelectionScreen from './src/screens/home/WorkoutSelectionScreen';

import ProgressScreen from './src/screens/progress/ProgressScreen';

import { COLORS } from './src/constants/theme';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          <Stack.Screen
            name="WorkoutSelection"
            component={WorkoutSelectionScreen}
          />

          <Stack.Screen name="Progress" component={ProgressScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
