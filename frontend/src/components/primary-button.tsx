import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { glow, radius, spacing, typography } from '../constants/theme';

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
        !inactive && glow(colors.glowWarm, 16),
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
        <>
          <Text style={[styles.label, inactive && styles.labelDisabled]}>{label}</Text>
          <View style={styles.chevrons}>
            <Text style={[styles.chevron, inactive && styles.labelDisabled]}>›››</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  buttonDisabled: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.accentText,
    fontSize: typography.body,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  labelDisabled: {
    color: colors.muted,
  },
  chevrons: {
    justifyContent: 'center',
  },
  chevron: {
    color: colors.accentText,
    fontSize: typography.label,
    fontWeight: '900',
    letterSpacing: -1,
  },
});
