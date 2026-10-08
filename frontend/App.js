import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './screens/OnboardingScreen';
import WorkoutSelectionScreen from './screens/WorkoutSelectionScreen';
import ProgressScreen from './screens/ProgressScreen';


import { COLORS } from './src/constants/theme';

function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>FitStudy</Text>

        <Text style={styles.subtitle}>Application ready for development</Text>
const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#e5e7eb', alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 400, flex: 1, backgroundColor: '#f5f5f5' }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="WorkoutSelection" component={WorkoutSelectionScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </View>
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
}
