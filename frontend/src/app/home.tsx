import { Redirect, router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandHeader from '../components/brand-header';
import RunButton from '../components/run-button';
import SecondaryButton from '../components/secondary-button';
import StatStrip from '../components/stat-strip';
import TrackBackdrop from '../components/track-backdrop';
import { colors } from '../constants/colors';
import { hudLabel, spacing } from '../constants/theme';
import { useInviteListener } from '../hooks/use-invite-listener';
import { useSession } from '../hooks/use-session';
import type { Match } from '../lib/matches';

export default function Home() {
  const { session, loading, signOut } = useSession();

  // An invite arrives as a matches INSERT naming this player; jump into the room.
  useInviteListener(
    session?.playerId ?? null,
    useCallback((match: Match) => {
      router.push({ pathname: '/match', params: { matchId: match.id } });
    }, []),
  );

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

        <View style={styles.hero}>
          <StatStrip
            stats={[
              { label: 'Best time', value: '04:12' },
              { label: 'Races won', value: '3' },
              { label: 'Total runs', value: '11' },
            ]}
          />

          <RunButton caption="Start a session" onPress={() => router.push('/mode-select')} />
        </View>

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
    paddingBottom: spacing.lg,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
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
