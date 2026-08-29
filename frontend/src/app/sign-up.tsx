import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import AuthForm from '../components/auth-form';
import AuthScreen from '../components/auth-screen';
import SecondaryButton from '../components/secondary-button';
import { colors } from '../constants/colors';
import { spacing, typography } from '../constants/theme';
import { signUp } from '../lib/auth';
import { saveSession } from '../lib/session-store';

export default function SignUp() {
  const submit = async (email: string, password: string) => {
    await saveSession(await signUp({ email, password }));
    router.replace('/room');
  };

  return (
    <AuthScreen tagline="Create an account to start your first run.">
      <AuthForm submitLabel="Sign up" onSubmit={submit} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <SecondaryButton label="Log in" onPress={() => router.replace('/sign-in')} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  footerText: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: typography.caption,
  },
});
