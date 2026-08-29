import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonPressed: {
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
