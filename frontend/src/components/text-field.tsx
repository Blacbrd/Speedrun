import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
};

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        style={[styles.input, focused && styles.inputFocused, style]}
        placeholderTextColor={colors.placeholder}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...inputProps}
      />
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg - 2,
    fontSize: typography.body,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
});
