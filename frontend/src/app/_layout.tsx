import { Stack } from 'expo-router';

import { ActiveRunProvider } from '../hooks/use-active-run';

export default function RootLayout() {
  return (
    <ActiveRunProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ActiveRunProvider>
  );
}
