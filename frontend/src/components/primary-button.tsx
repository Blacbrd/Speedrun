import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/colors';
import { radius, shadow, spacing, typography } from '../constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const inactive = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        !inactive && shadow('button'),
        pressed && styles.buttonPressed,
        inactive && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.accentText} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  buttonDisabled: {
    backgroundColor: colors.borderStrong,
  },
  label: {
    color: colors.accentText,
    fontSize: typography.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
