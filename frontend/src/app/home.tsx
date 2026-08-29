import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandHeader from '../components/brand-header';
import RunButton from '../components/run-button';
import SecondaryButton from '../components/secondary-button';
import StatStrip from '../components/stat-strip';
import TrackBackdrop from '../components/track-backdrop';
import { colors } from '../constants/colors';
import { hudLabel, spacing } from '../constants/theme';
import { useSession } from '../hooks/use-session';

export default function Home() {
  const { session, loading, signOut } = useSession();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  const signOutAndLeave = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TrackBackdrop />

      <View style={styles.content}>
        <BrandHeader
          title="Ready to run"
          tagline="Hit the pad, pick a mode, and start hunting photos."
        />

        <StatStrip
          stats={[
            { label: 'Mode', value: 'Solo' },
            { label: 'Tasks', value: '5' },
            { label: 'Gps', value: 'On' },
          ]}
        />

        <View style={styles.spacer} />

        <RunButton caption="Start a session" onPress={() => router.push('/mode-select')} />

        <SecondaryButton label="Team" onPress={() => router.push('/team')} />

        <Pressable
          style={styles.signOut}
          onPress={signOutAndLeave}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>{session.email ?? 'Signed in'} · Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    alignItems: 'stretch',
  },
  spacer: {
    flex: 1,
  },
  signOut: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  signOutText: {
    ...hudLabel,
    fontSize: 10,
  },
});
