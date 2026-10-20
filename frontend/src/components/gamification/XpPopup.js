// Temporary animated XP popup used to give immediate gamified feedback
// when a participant completes a set or earns a reward.

import React, { useEffect, useRef } from 'react';

import { Animated, StyleSheet, Text } from 'react-native';

import { COLORS } from '../../constants/theme';

function XpPopup({ amount = 10, onFinished }) {
  const opacity = useRef(new Animated.Value(0)).current;

  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,

          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,

          useNativeDriver: true,
        }),
      ]),

      Animated.delay(650),

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,

          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: -20,
          duration: 250,

          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onFinished) {
        onFinished();
      }
    });
  }, [opacity, translateY, onFinished]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,

        {
          opacity,

          transform: [
            {
              translateY,
            },
          ],
        },
      ]}
    >
      <Text style={styles.text}>+{amount} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',

    top: 110,

    alignSelf: 'center',

    backgroundColor: COLORS.cardSecondary,

    borderWidth: 1,

    borderColor: COLORS.primaryLight,

    paddingVertical: 10,

    paddingHorizontal: 20,

    borderRadius: 20,

    zIndex: 100,
    elevation: 10,
  },

  text: {
    color: COLORS.text,

    fontSize: 18,

    fontWeight: 'bold',
  },
});

export default XpPopup;
