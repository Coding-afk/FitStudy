import React, { useEffect, useRef, useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import Sound from 'react-native-sound';

import { COLORS } from '../../constants/theme';

Sound.setCategory('Playback');

function CountdownTimer({ targetSeconds }) {
  const [seconds, setSeconds] = useState(targetSeconds);

  const [running, setRunning] = useState(false);

  const soundRef = useRef(null);

  useEffect(() => {
    const sound = new Sound(
      'timer_complete.mp3',
      Sound.MAIN_BUNDLE,

      error => {
        if (error) {
          console.log('Unable to load timer sound:', error);

          return;
        }

        soundRef.current = sound;
      },
    );

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  useEffect(() => {
    setSeconds(targetSeconds);

    setRunning(false);
  }, [targetSeconds]);

  const playFinishedSound = () => {
    if (!soundRef.current) {
      return;
    }

    soundRef.current.stop(() => {
      soundRef.current.play();
    });
  };

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(previous => {
        if (previous <= 1) {
          clearInterval(timer);

          setRunning(false);

          playFinishedSound();

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [running]);

  const resetTimer = () => {
    setSeconds(targetSeconds);

    setRunning(false);
  };

  const toggleTimer = () => {
    if (seconds <= 0) {
      setSeconds(targetSeconds);
    }

    setRunning(previous => !previous);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Pressable style={styles.startButton} onPress={toggleTimer}>
          <Text style={styles.buttonText}>{running ? 'Stop' : 'Start'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.resetButton} onPress={resetTimer}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.time}>{seconds} sec</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 8,

    marginBottom: 10,
  },

  section: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',
  },

  time: {
    color: COLORS.text,

    fontSize: 16,

    fontWeight: 'bold',

    alignSelf: 'center',
  },

  startButton: {
    backgroundColor: COLORS.primary,

    paddingVertical: 8,

    paddingHorizontal: 16,

    borderRadius: 8,

    minWidth: 75,

    alignItems: 'center',
  },

  buttonText: {
    color: COLORS.text,

    fontWeight: 'bold',
  },

  resetButton: {
    backgroundColor: COLORS.cardSecondary,

    paddingVertical: 8,

    paddingHorizontal: 16,

    borderRadius: 8,

    minWidth: 75,

    alignItems: 'center',
  },

  resetText: {
    color: COLORS.textSecondary,

    fontWeight: '600',
  },
});

export default CountdownTimer;
