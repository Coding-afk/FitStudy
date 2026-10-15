import {StyleSheet, Text} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import WorkoutSelectionScreen from '../screens/home/WorkoutSelectionScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {COLORS} from '../constants/theme';

const Tab = createBottomTabNavigator();

function HomeIcon({focused}) {
  return <Text style={focused ? styles.iconActive : styles.icon}>🏠</Text>;
}

function LeaderboardIcon({focused}) {
  return <Text style={focused ? styles.iconActive : styles.icon}>🏆</Text>;
}

function AccountIcon({focused}) {
  return <Text style={focused ? styles.iconActive : styles.icon}>👤</Text>;
}

function MainTabs({route}) {
  const participantId = route.params?.participantId ?? null;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 65,
          paddingTop: 5,
          paddingBottom: 7,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={WorkoutSelectionScreen}
        initialParams={{participantId}}
        options={{tabBarIcon: HomeIcon}}
      />

      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{tabBarIcon: LeaderboardIcon}}
      />

      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        initialParams={{participantId}}
        options={{tabBarIcon: AccountIcon}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 19,
    color: COLORS.textSecondary,
  },
  iconActive: {
    fontSize: 19,
    color: COLORS.primaryLight,
  },
});

export default MainTabs;
