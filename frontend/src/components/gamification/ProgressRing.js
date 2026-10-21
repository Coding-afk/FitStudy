// Small reusable progress-ring visual used for level/progress feedback.
// Progress is clamped before rendering so invalid values cannot distort the UI.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

function ProgressRing({ progress = 0, size = 112, strokeWidth = 10 }) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeOffset = circumference - (safeProgress / 100) * circumference;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primaryLight}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={styles.percentage}>{Math.round(safeProgress)}%</Text>

        <Text style={styles.label}>Progress</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  percentage: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
  },

  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});

export default ProgressRing;
