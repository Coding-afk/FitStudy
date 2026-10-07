import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/theme';

function BadgeUnlockModal({
  visible,
  badge,
  hasMoreBadges = false,
  onContinue,
}) {
  if (!badge) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.unlockLabel}>BADGE UNLOCKED</Text>

          <View style={styles.badgeIcon}>
            <Text style={styles.badgeIconText}>★</Text>
          </View>

          <Text style={styles.badgeName}>{badge.name}</Text>

          <Text style={styles.description}>{badge.description}</Text>

          <Pressable style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>
              {hasMoreBadges ? 'Next Badge' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.75)',

    alignItems: 'center',

    justifyContent: 'center',

    padding: 25,
  },

  card: {
    width: '100%',

    maxWidth: 360,

    backgroundColor: COLORS.card,

    borderWidth: 1,

    borderColor: COLORS.primaryLight,

    borderRadius: 20,

    padding: 26,

    alignItems: 'center',
  },

  unlockLabel: {
    color: COLORS.primaryLight,

    fontSize: 13,

    fontWeight: 'bold',

    letterSpacing: 1,

    marginBottom: 20,
  },

  badgeIcon: {
    width: 90,

    height: 90,

    borderRadius: 45,

    backgroundColor: COLORS.primary,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 18,
  },

  badgeIconText: {
    color: COLORS.text,

    fontSize: 42,

    fontWeight: 'bold',
  },

  badgeName: {
    color: COLORS.text,

    fontSize: 24,

    fontWeight: 'bold',

    textAlign: 'center',

    marginBottom: 10,
  },

  description: {
    color: COLORS.textSecondary,

    fontSize: 14,

    lineHeight: 20,

    textAlign: 'center',

    marginBottom: 24,
  },

  button: {
    width: '100%',

    backgroundColor: COLORS.primary,

    paddingVertical: 14,

    borderRadius: 12,

    alignItems: 'center',
  },

  buttonText: {
    color: COLORS.text,

    fontSize: 16,

    fontWeight: 'bold',
  },
});

export default BadgeUnlockModal;
