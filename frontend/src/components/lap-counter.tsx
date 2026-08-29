import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';
import { useLapCounter } from '../hooks/use-lap-counter';

export default function LapCounter() {
  const { laps, addLap, removeLap, resetLaps } = useLapCounter();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Laps</Text>
      <Text style={styles.count}>{laps}</Text>

      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={removeLap}
          accessibilityRole="button"
          accessibilityLabel="Remove a lap"
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={addLap}
          accessibilityRole="button"
          accessibilityLabel="Add a lap"
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.reset}
        onPress={resetLaps}
        accessibilityRole="button"
        accessibilityLabel="Reset laps"
      >
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: hudLabel,
  count: {
    fontFamily: monoFont,
    fontSize: typography.display + 24,
    fontWeight: '900',
    letterSpacing: -2,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: typography.title + 6,
    fontWeight: '900',
    color: colors.accent,
  },
  reset: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  resetText: {
    ...hudLabel,
    fontSize: typography.label,
    color: colors.muted,
  },
});
