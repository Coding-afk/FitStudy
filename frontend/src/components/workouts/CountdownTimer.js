// Countdown control for time-based exercise sets.
// It plays the completion sound once the timer reaches zero and releases the
// native sound resource when the component is unmounted.

import React, { useEffect, useRef, useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import Sound from 'react-native-sound';

import { COLORS } from '../../constants/theme';

Sound.setCategory('Playback', true);

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

        sound.setVolume(1.0);
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
    const sound = soundRef.current;

    if (!sound) {
      console.log('Timer sound is not loaded yet.');
      return;
    }

    // Do not call stop() before the first play. On some Android builds the
    // stop callback is not fired when the clip is already stopped, which
    // means play() never runs. Seek to the beginning and play directly.
    sound.setCurrentTime(0);
    sound.setVolume(1.0);
    sound.play(success => {
      if (!success) {
        console.log('Timer sound playback failed.');
      }
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
