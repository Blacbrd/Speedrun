import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { glow, hudLabel, radius, spacing, typography } from '../constants/theme';

type HudToastProps = {
  message: string | null;
  // Changes whenever a new event fires, so repeated messages still re-show.
  eventKey: number | null;
  durationMs?: number;
};

export default function HudToast({ message, eventKey, durationMs = 3500 }: HudToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message || eventKey === null) {
      return;
    }
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timeout);
  }, [durationMs, eventKey, message]);

  if (!visible || !message) {
    return null;
  }

  return (
    <View style={[styles.toast, glow(colors.shadow, 14)]} pointerEvents="none">
      <Text style={styles.label}>Rival</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.backgroundLift,
    padding: spacing.md,
    gap: 2,
  },
  label: {
    ...hudLabel,
    color: colors.accent,
    fontSize: 10,
  },
  text: {
    color: colors.text,
    fontSize: typography.caption,
  },
});
