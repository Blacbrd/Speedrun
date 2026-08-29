import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import AuthForm from '../components/auth-form';
import AuthScreen from '../components/auth-screen';
import SecondaryButton from '../components/secondary-button';
import { colors } from '../constants/colors';
import { typography } from '../constants/theme';
import { signIn } from '../lib/auth';
import { saveSession } from '../lib/session-store';

export default function SignIn() {
  const submit = async (email: string, password: string) => {
    await saveSession(await signIn({ email, password }));
    router.replace('/room');
  };

  return (
    <AuthScreen
      title="Welcome back"
      tagline="Race the clock. Photograph the city."
      footer={
        <>
          <Text style={styles.footerText}>New here?</Text>
          <SecondaryButton label="Create an account" onPress={() => router.push('/sign-up')} />
        </>
      }
    >
      <AuthForm submitLabel="Log in" onSubmit={submit} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  footerText: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: typography.caption,
  },
});
