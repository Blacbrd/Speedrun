import { Link, router } from 'expo-router';
import { Text } from 'react-native';

import { AuthForm } from '../components/AuthForm';
import { login } from '../lib/api';
import { colors } from '../theme';

export default function Login() {
  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      fields={['email', 'password']}
      onSubmit={async ({ email, password }) => {
        await login(email, password);
        router.replace('/home');
      }}
      footer={
        <Link href="/signup" style={{ textAlign: 'center', marginTop: 16, color: colors.primary }}>
          <Text>Need an account? Sign up</Text>
        </Link>
      }
    />
  );
}
