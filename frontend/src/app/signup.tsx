import { Link, router } from 'expo-router';
import { Text } from 'react-native';

import { AuthForm } from '../components/AuthForm';
import { login, signup } from '../lib/api';
import { colors } from '../theme';

export default function Signup() {
  return (
    <AuthForm
      title="Sign up"
      submitLabel="Create account"
      fields={['email', 'username', 'password']}
      onSubmit={async ({ email, username, password }) => {
        await signup(email, password, username || undefined);
        // Logging in explicitly keeps this working even if Supabase email
        // confirmation is turned on (sign_up alone won't return a session then).
        await login(email, password);
        router.replace('/home');
      }}
      footer={
        <Link href="/login" style={{ textAlign: 'center', marginTop: 16, color: colors.primary }}>
          <Text>Already have an account? Log in</Text>
        </Link>
      }
    />
  );
}
