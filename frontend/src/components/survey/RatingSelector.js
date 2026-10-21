// Reusable 1-5 rating control for the post-workout research survey.
// The selected value is controlled by the parent survey screen.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function RatingSelector({ label, value, onSelect }) {
  const options = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttonRow}>
        {options.map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.button,
              value === num && styles.selectedButton,
            ]}
            onPress={() => onSelect(num)}
          >
            <Text
              style={[
                styles.buttonText,
                value === num && styles.selectedText,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS?.text || '#FFFFFF', // Bright readable color on dark background
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedButton: {
    backgroundColor: COLORS?.primary || '#007AFF',
    borderColor: COLORS?.primary || '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  selectedText: {
    color: '#FFFFFF',
  },
});