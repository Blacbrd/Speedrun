import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLapCounter } from '../hooks/use-lap-counter';
import { colors, spacing } from '../theme';

export default function LapCounter() {
  const { laps, addLap, removeLap, resetLaps } = useLapCounter();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Laps</Text>
      <Text style={styles.count}>{laps}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={removeLap} accessibilityLabel="Remove a lap">
          <Text style={styles.buttonText}>-</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={addLap} accessibilityLabel="Add a lap">
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
      <Pressable style={styles.reset} onPress={resetLaps} accessibilityLabel="Reset laps">
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: colors.muted,
  },
  count: {
    fontSize: 64,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 28,
    color: colors.primaryText,
    fontWeight: '600',
  },
  reset: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resetText: {
    fontSize: 16,
    color: colors.primary,
  },
});
