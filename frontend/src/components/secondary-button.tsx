import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/colors';
import { hudLabel, radius, spacing, typography } from '../constants/theme';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
};

export default function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    ...hudLabel,
    fontSize: typography.label,
    color: colors.accent,
  },
});
