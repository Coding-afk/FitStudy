import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './screens/OnboardingScreen';
import WorkoutSelectionScreen from './screens/WorkoutSelectionScreen';
import ProgressScreen from './screens/ProgressScreen';


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