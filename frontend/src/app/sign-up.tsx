import { Link, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthForm from '../components/auth-form';
import { colors } from '../constants/colors';
import { signUp } from '../lib/auth';
import { saveSession } from '../lib/session-store';

export default function SignUp() {
  const submit = async (email: string, password: string) => {
    await saveSession(await signUp({ email, password }));
    router.replace('/room');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <AuthForm title="Create account" submitLabel="Sign up" onSubmit={submit} />
        <Text style={styles.footer}>
          Already have an account? <Link href="/sign-in" style={styles.link}>Sign in</Link>
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
