import React, { useEffect, useRef } from 'react';

import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BadgeIcon from './BadgeIcon';

import { getBadgeDefinition } from '../../constants/badges';

import { COLORS } from '../../constants/theme';

function BadgeUnlockModal({ visible, badgeId, onClose }) {
  const scale = useRef(new Animated.Value(0.6)).current;

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.6);
      opacity.setValue(0);

      return;
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scale, opacity]);

  if (!badgeId) {
    return null;
  }

  const badge = getBadgeDefinition(badgeId);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalCard,

            {
              opacity,

              transform: [
                {
                  scale,
                },
              ],
            },
          ]}
        >
          <Text style={styles.unlockLabel}>ACHIEVEMENT UNLOCKED</Text>

          <View style={styles.badgeContainer}>
            <View style={styles.glowLarge} />

            <View style={styles.glowSmall} />

            <BadgeIcon badgeId={badgeId} unlocked size={110} />
          </View>

          <Text style={styles.badgeName}>{badge.name}</Text>

          <Text style={styles.description}>{badge.description}</Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.82)',

    justifyContent: 'center',

    alignItems: 'center',

    padding: 24,
  },

  modalCard: {
    width: '100%',

    maxWidth: 360,

    backgroundColor: COLORS.card,

    borderRadius: 22,

    borderWidth: 1,

    borderColor: COLORS.primaryLight,

    paddingHorizontal: 24,

    paddingTop: 26,

    paddingBottom: 22,

    alignItems: 'center',
  },

  unlockLabel: {
    color: COLORS.primaryLight,

    fontSize: 11,

    fontWeight: '900',

    letterSpacing: 1.5,

    marginBottom: 22,
  },

  badgeContainer: {
    width: 150,
    height: 150,

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 10,
  },

  glowLarge: {
    position: 'absolute',

    width: 145,
    height: 145,

    borderRadius: 73,

    backgroundColor: COLORS.primary,

    opacity: 0.12,
  },

  glowSmall: {
    position: 'absolute',

    width: 125,
    height: 125,

    borderRadius: 63,

    backgroundColor: COLORS.primaryLight,

    opacity: 0.12,
  },

  badgeName: {
    color: COLORS.text,

    fontSize: 24,

    fontWeight: '800',

    textAlign: 'center',

    marginTop: 10,
  },

  description: {
    color: COLORS.textSecondary,

    fontSize: 13,

    lineHeight: 20,

    textAlign: 'center',

    marginTop: 8,

    marginBottom: 24,
  },

  continueButton: {
    width: '100%',

    backgroundColor: COLORS.primary,

    borderRadius: 12,

    paddingVertical: 13,

    alignItems: 'center',
  },

  continueText: {
    color: COLORS.text,

    fontSize: 14,

    fontWeight: '800',
  },
});

export default BadgeUnlockModal;
