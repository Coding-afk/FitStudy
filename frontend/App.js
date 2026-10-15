import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {onAuthStateChanged} from 'firebase/auth';

import AppNavigator from './src/navigation/AppNavigator';
import {auth} from './src/config/firebase';
import {COLORS} from './src/constants/theme';
import {logoutUser} from './src/services/auth';
import {getProfile} from './src/services/profile';

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState('Welcome');
  const [navigatorKey, setNavigatorKey] = useState(0);

  const bootstrappedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (!bootstrappedRef.current) {
        bootstrappedRef.current = true;

        if (!currentUser) {
          setInitialRouteName('Welcome');
          setInitializing(false);
          return;
        }

        try {
          const profile = await getProfile();

          if (profile.studyStatus === 'ineligible') {
            await logoutUser();
            setInitialRouteName('Welcome');
          } else if (!profile.screeningCompleted || !profile.screeningPassed) {
            setInitialRouteName('Onboarding');
          } else {
            setInitialRouteName('MainTabs');
          }
        } catch (error) {
          console.error('Failed to restore participant session:', error);

          // A signed-in Firebase account without a usable Firestore profile
          // should not bypass registration/screening.
          try {
            await logoutUser();
          } catch (logoutError) {
            console.error('Failed to clear incomplete session:', logoutError);
          }

          setInitialRouteName('Welcome');
        } finally {
          setInitializing(false);
        }

        return;
      }

      // Registration and login screens control navigation when a user signs in.
      // If the user signs out, rebuild the navigator at Welcome.
      if (!currentUser) {
        setInitialRouteName('Welcome');
        setNavigatorKey(current => current + 1);
      }
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator
        key={navigatorKey}
        initialRouteName={initialRouteName}
      />
    </NavigationContainer>
  );
}
