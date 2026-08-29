import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';
import { Button } from './Button';
import { TextField } from './TextField';

type Field = 'email' | 'username' | 'password';

type Props = {
  title: string;
  submitLabel: string;
  fields: Field[];
  onSubmit: (values: { email: string; username: string; password: string }) => Promise<void>;
  footer?: React.ReactNode;
};

/** Shared email/username/password form - both login and signup are one of these. */
export function AuthForm({ title, submitLabel, fields, onSubmit, footer }: Props) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ email: email.trim(), username: username.trim(), password });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {fields.includes('email') && (
        <TextField
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      )}
      {fields.includes('username') && (
        <TextField
          placeholder="Username (optional)"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
      )}
      {fields.includes('password') && (
        <TextField placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label={submitLabel} onPress={handleSubmit} loading={loading} style={styles.submit} />

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  title: { fontSize: 28, fontWeight: '600', marginBottom: spacing.sm, color: colors.text },
  error: { color: colors.danger },
  submit: { marginTop: spacing.sm },
});
