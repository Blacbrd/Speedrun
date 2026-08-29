import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import AuthForm from '../components/auth-form';
import AuthScreen from '../components/auth-screen';
import SecondaryButton from '../components/secondary-button';
import { hudLabel } from '../constants/theme';
import { signUp } from '../lib/auth';
import { saveSession } from '../lib/session-store';

export default function SignUp() {
  const submit = async (email: string, password: string) => {
    await saveSession(await signUp({ email, password }));
    router.replace('/home');
  };

  return (
    <AuthScreen
      title="Enter the race"
      tagline="Create a profile and start your first photo run in under a minute."
      lane="Lane 02 · Sign up"
      stats={[
        { label: 'Tasks', value: '50' },
        { label: 'Tiers', value: '3' },
        { label: 'Setup', value: '60s' },
      ]}
      footer={
        <>
          <Text style={styles.footerText}>Already on the start list?</Text>
          <SecondaryButton label="Log in" onPress={() => router.replace('/sign-in')} />
        </>
      }
    >
      <AuthForm submitLabel="Sign up" onSubmit={submit} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  footerText: {
    ...hudLabel,
    textAlign: 'center',
  },
});
