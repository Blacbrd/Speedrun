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
import { hudLabel, radius, spacing, typography } from '../constants/theme';

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
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <View
        style={[styles.field, focused && styles.fieldFocused, invalid && styles.fieldInvalid]}
      >
        <View style={[styles.rail, focused && styles.railFocused, invalid && styles.railInvalid]} />
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
    gap: spacing.xs + 2,
  },
  label: {
    ...hudLabel,
  },
  labelFocused: {
    color: colors.accent,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingRight: spacing.lg,
    minHeight: 50,
  },
  fieldFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.backgroundLift,
  },
  fieldInvalid: {
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorSurface,
  },
  // Lane marker down the left edge of every input.
  rail: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: colors.hairline,
  },
  railFocused: {
    backgroundColor: colors.accent,
  },
  railInvalid: {
    backgroundColor: colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  reveal: {
    paddingLeft: spacing.sm,
  },
  revealText: {
    ...hudLabel,
    color: colors.accent,
  },
});
