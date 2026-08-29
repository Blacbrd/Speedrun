import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';
import PrimaryButton from './primary-button';
import TextField from './text-field';

type AuthFormProps = {
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export default function AuthForm({ submitLabel, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const disabled = submitting || email.trim().length === 0 || password.length === 0;

  const submit = async () => {
    if (disabled) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <TextField
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <PrimaryButton
        label={submitLabel}
        onPress={submit}
        disabled={disabled}
        loading={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  errorBox: {
    backgroundColor: colors.errorSurface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.caption,
  },
});
