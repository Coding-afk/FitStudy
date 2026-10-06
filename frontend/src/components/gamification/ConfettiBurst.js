import { useEffect, useRef } from 'react';

import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const CONFETTI_COLORS = ['#FFFFFF', '#5D8AA8', '#82B1D1', '#FFD166', '#6FCF97'];

function ConfettiBurst({ active = true, onFinished }) {
  const { width, height } = Dimensions.get('window');

  const pieces = useRef(
    Array.from(
      {
        length: 36,
      },

      (_, index) => ({
        id: index,

        progress: new Animated.Value(0),

        startX: Math.random() * width,

        drift: (Math.random() - 0.5) * 180,

        delay: Math.random() * 350,

        duration: 1400 + Math.random() * 800,

        size: 6 + Math.random() * 5,

        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      }),
    ),
  ).current;

  useEffect(() => {
    if (!active) {
      return;
    }

    const animations = pieces.map(piece =>
      Animated.timing(piece.progress, {
        toValue: 1,

        duration: piece.duration,

        delay: piece.delay,

        useNativeDriver: true,
      }),
    );

    Animated.parallel(animations).start(() => {
      if (onFinished) {
        onFinished();
      }
    });
  }, [active, onFinished, pieces]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      {pieces.map(piece => {
        const translateY = piece.progress.interpolate({
          inputRange: [0, 1],

          outputRange: [-20, height * 0.75],
        });

        const translateX = piece.progress.interpolate({
          inputRange: [0, 1],

          outputRange: [0, piece.drift],
        });

        const rotate = piece.progress.interpolate({
          inputRange: [0, 1],

          outputRange: ['0deg', '720deg'],
        });

        const opacity = piece.progress.interpolate({
          inputRange: [0, 0.8, 1],

          outputRange: [1, 1, 0],
        });

        return (
          <Animated.View
            key={piece.id}
            style={[
              styles.piece,

              {
                left: piece.startX,

                width: piece.size,

                height: piece.size * 1.6,

                backgroundColor: piece.color,

                opacity,

                transform: [
                  {
                    translateX,
                  },

                  {
                    translateY,
                  },

                  {
                    rotate,
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 1000,

    elevation: 1000,
  },

  piece: {
    position: 'absolute',

    top: 0,

    borderRadius: 2,
  },
});

export default ConfettiBurst;
