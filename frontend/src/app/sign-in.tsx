import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import AuthForm from '../components/auth-form';
import AuthScreen from '../components/auth-screen';
import SecondaryButton from '../components/secondary-button';
import { hudLabel } from '../constants/theme';
import { signIn } from '../lib/auth';
import { saveSession } from '../lib/session-store';

export default function SignIn() {
  const submit = async (email: string, password: string) => {
    await saveSession(await signIn({ email, password }));
    router.replace('/room');
  };

  return (
    <AuthScreen
      title="Back on the start line"
      tagline="Race the clock. Photograph the city. Beat your split."
      lane="Lane 01 · Log in"
      stats={[
        { label: 'Tasks', value: '50' },
        { label: 'Tiers', value: '3' },
        { label: 'Gps', value: 'On' },
      ]}
      footer={
        <>
          <Text style={styles.footerText}>No runner profile yet?</Text>
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
    ...hudLabel,
    textAlign: 'center',
  },
});
