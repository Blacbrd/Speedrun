import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  invalid?: boolean;
};

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, invalid = false, secureTextEntry, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          invalid && styles.fieldInvalid,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !revealed}
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
        {secureTextEntry ? (
          <Pressable
            style={styles.reveal}
            onPress={() => setRevealed((current) => !current)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.revealText}>{revealed ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
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
    letterSpacing: 0.2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
  },
  fieldFocused: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
  },
  fieldInvalid: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.errorBorder,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    fontSize: typography.body,
    color: colors.text,
  },
  reveal: {
    paddingLeft: spacing.md,
  },
  revealText: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.accent,
  },
});
