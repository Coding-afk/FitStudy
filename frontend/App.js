import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

import AppNavigator from './src/navigation/AppNavigator';
import { auth } from './src/config/firebase';
import { COLORS } from './src/constants/theme';
import { logoutUser } from './src/services/auth';
import { getProfile } from './src/services/profile';

/**
 * Root application component.
 *
 * Main responsibilities:
 * - Restore the Firebase authentication session when the app starts.
 * - Check the participant's backend profile before deciding where to send them.
 * - Prevent incomplete or ineligible users from entering the study.
 * - Reset navigation after logout so protected screens are cleared.
 */
export default function App() {
  // Keeps the app on the loading screen while Firebase restores the saved session
  // and the backend profile is being checked.
  const [initializing, setInitializing] = useState(true);

  // The first screen shown depends on the user's authentication and screening status.
  const [initialRouteName, setInitialRouteName] = useState('Welcome');

  // Changing this key rebuilds the navigator.
  // This is useful after logout so the previous authenticated navigation stack is removed.
  const [navigatorKey, setNavigatorKey] = useState(0);

  // Firebase can trigger the auth-state listener multiple times.
  // This keeps track of whether the initial app-start authentication check has already happened.
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    /**
     * Firebase stores the signed-in session on the device.
     * When the app opens, this listener receives:
     * - the restored Firebase user if they were still signed in, or
     * - null if there is no active session.
     */
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      // Handle the first auth-state callback as the application's startup check.
      if (!bootstrappedRef.current) {
        bootstrappedRef.current = true;

        // If there is no saved Firebase session, start on the public Welcome screen.
        if (!currentUser) {
          setInitialRouteName('Welcome');
          setInitializing(false);
          return;
        }

        try {
          /**
           * A Firebase login alone does not mean the participant may enter the study.
           * The backend profile is checked to determine:
           * - whether they are eligible,
           * - whether health screening is complete,
           * - and whether they can enter the main application.
           */
          const profile = await getProfile();

          if (profile.studyStatus === 'ineligible') {
            /**
             * Ineligible participants must not regain access simply because Firebase
             * restored an older signed-in session.
             */
            await logoutUser();
            setInitialRouteName('Welcome');
          } else if (!profile.screeningCompleted || !profile.screeningPassed) {
            /**
             * Registered users who have not completed screening must return to
             * the Health Screening screen before accessing the main application.
             */
            setInitialRouteName('Onboarding');
          } else {
            /**
             * Returning participants who are authenticated, eligible,
             * and fully screened can go directly to the main application.
             */
            setInitialRouteName('MainTabs');
          }
        } catch (error) {
          console.error('Failed to restore participant session:', error);

          /**
           * If Firebase has a signed-in user but the backend profile cannot be loaded,
           * treat the account as incomplete.
           *
           * Signing the user out prevents an orphan/incomplete Firebase account
           * from bypassing registration or screening requirements.
           */
          try {
            await logoutUser();
          } catch (logoutError) {
            console.error('Failed to clear incomplete session:', logoutError);
          }

          setInitialRouteName('Welcome');
        } finally {
          /**
           * Only show the navigator once Firebase and the backend profile check
           * have finished. This prevents the wrong screen from briefly flashing.
           */
          setInitializing(false);
        }

        return;
      }

      /**
       * Registration and Login screens control navigation when a user signs in.
       *
       * If the user signs out, reset the navigator completely so authenticated
       * screens are removed from the navigation back stack.
       */
      if (!currentUser) {
        setInitialRouteName('Welcome');
        setNavigatorKey(current => current + 1);
      }
    });

    // Remove the Firebase authentication listener if the root component unmounts.
    return unsubscribe;
  }, []);

  /**
   * Show a simple loading screen while Firebase restores the saved session
   * and the participant profile is being checked.
   */
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  /**
   * Main application navigation.
   *
   * navigatorKey changes after logout, forcing React Navigation to create
   * a fresh navigation tree starting from the correct public route.
   */
  return (
    <NavigationContainer>
      <AppNavigator key={navigatorKey} initialRouteName={initialRouteName} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
