import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';

type TimeLimitPickerProps = {
  options: number[];
  value: number;
  disabled?: boolean;
  onChange: (seconds: number) => void;
};

// Host-only control: sets the match clock before both players ready up.
export default function TimeLimitPicker({
  options,
  value,
  disabled = false,
  onChange,
}: TimeLimitPickerProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Race length</Text>
      <View style={styles.row}>
        {options.map((seconds) => {
          const selected = seconds === value;
          return (
            <Pressable
              key={seconds}
              style={[styles.option, selected && styles.optionSelected, disabled && styles.optionDisabled]}
              onPress={disabled ? undefined : () => onChange(seconds)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`${seconds / 60} minute race`}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {seconds / 60} min
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    ...hudLabel,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontFamily: monoFont,
    fontSize: typography.label,
    fontWeight: '900',
    color: colors.muted,
  },
  optionTextSelected: {
    color: colors.accent,
  },
});
