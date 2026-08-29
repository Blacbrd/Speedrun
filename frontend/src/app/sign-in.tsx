import { Link, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthForm from '../components/auth-form';
import { colors } from '../constants/colors';
import { signIn } from '../lib/auth';
import { saveSession } from '../lib/session-store';

export default function SignIn() {
  const submit = async (email: string, password: string) => {
    await saveSession(await signIn({ email, password }));
    router.replace('/room');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <AuthForm title="Sign in" submitLabel="Sign in" onSubmit={submit} />
        <Text style={styles.footer}>
          No account? <Link href="/sign-up" style={styles.link}>Sign up</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  footer: {
    color: colors.muted,
    textAlign: 'center',
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
});
