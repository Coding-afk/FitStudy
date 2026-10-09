import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { getBadgeDefinition } from '../../constants/badges';

import { COLORS } from '../../constants/theme';

function BadgeIcon({ badgeId, unlocked = true, size = 72 }) {
  const badge = getBadgeDefinition(badgeId);

  const innerSize = size * 0.72;

  const symbolSize = size * 0.3;

  return (
    <View
      style={[
        styles.outerBadge,

        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },

        unlocked ? styles.outerUnlocked : styles.outerLocked,
      ]}
    >
      <View
        style={[
          styles.innerBadge,

          {
            width: innerSize,
            height: innerSize,

            borderRadius: innerSize / 2,
          },

          unlocked ? styles.innerUnlocked : styles.innerLocked,
        ]}
      >
        <Text
          style={[
            styles.symbol,

            {
              fontSize: symbolSize,
            },

            !unlocked && styles.symbolLocked,
          ]}
        >
          {unlocked ? badge.symbol : '×'}
        </Text>
      </View>

      <View
        style={[
          styles.bottomRibbon,

          {
            width: size * 0.58,

            bottom: -size * 0.04,
          },

          !unlocked && styles.ribbonLocked,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.ribbonText,

            {
              fontSize: Math.max(7, size * 0.105),
            },
          ]}
        >
          {badge.shortLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBadge: {
    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 3,
  },

  outerUnlocked: {
    backgroundColor: COLORS.primary,

    borderColor: COLORS.primaryLight,
  },

  outerLocked: {
    backgroundColor: COLORS.cardSecondary,

    borderColor: COLORS.border,

    opacity: 0.65,
  },

  innerBadge: {
    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 1,
  },

  innerUnlocked: {
    backgroundColor: COLORS.card,

    borderColor: COLORS.primaryLight,
  },

  innerLocked: {
    backgroundColor: COLORS.background,

    borderColor: COLORS.border,
  },

  symbol: {
    color: COLORS.text,
    fontWeight: '900',
    textAlign: 'center',
  },

  symbolLocked: {
    color: COLORS.textSecondary,
  },

  bottomRibbon: {
    position: 'absolute',

    minHeight: 18,

    backgroundColor: COLORS.primaryLight,

    justifyContent: 'center',

    alignItems: 'center',

    borderRadius: 8,

    paddingHorizontal: 4,

    paddingVertical: 2,
  },

  ribbonLocked: {
    backgroundColor: COLORS.border,
  },

  ribbonText: {
    color: COLORS.text,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default BadgeIcon;
