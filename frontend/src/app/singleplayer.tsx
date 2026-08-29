import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LiveMap from '../components/live-map';
import PrimaryButton from '../components/primary-button';
import TaskList from '../components/task-list';
import { colors } from '../constants/colors';
import { hudLabel, radius, spacing, typography } from '../constants/theme';
import { useActiveRun } from '../hooks/use-active-run';
import { useCurrentLocation } from '../hooks/use-current-location';
import { useRandomTasks } from '../hooks/use-random-tasks';
import { useSession } from '../hooks/use-session';
import { startRun } from '../lib/runs';

export default function SingleplayerSetup() {
  const { session, loading: sessionLoading } = useSession();
  const location = useCurrentLocation(Boolean(session));
  const { tasks, error, loading, regenerate } = useRandomTasks({
    playerId: session?.playerId,
    token: session?.accessToken,
    enabled: Boolean(session),
  });
  const { begin } = useActiveRun();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  if (sessionLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  const start = async () => {
    if (!session.playerId) {
      setStartError('Missing player id — sign in again to start a run.');
      return;
    }
    setStartError(null);
    setStarting(true);
    try {
      const run = await startRun(session.playerId, 'singleplayer', session.accessToken);
      begin(run.id, tasks);
      router.replace('/run');
    } catch (caught) {
      setStartError(caught instanceof Error ? caught.message : 'Could not start the run');
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.heading}>Singleplayer setup</Text>
      </View>

      <View style={styles.mapCard}>
        {location.coordinates ? (
          <LiveMap center={location.coordinates} />
        ) : (
          <View style={styles.centered}>
            {location.loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Text style={styles.error}>{location.error ?? 'Location unavailable'}</Text>
                <Pressable onPress={location.retry}>
                  <Text style={styles.back}>Retry</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.label}>Your tasks</Text>
          <Pressable
            style={styles.regenerate}
            onPress={regenerate}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Regenerate tasks"
          >
            <Text style={styles.regenerateText}>{loading ? 'Drawing…' : '⟳ Regenerate'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading && tasks.length === 0 ? <ActivityIndicator color={colors.accent} /> : null}

        <View style={styles.list}>
          <TaskList tasks={tasks} />
        </View>
      </View>

      <View style={styles.footer}>
        {startError ? <Text style={styles.error}>{startError}</Text> : null}
        <PrimaryButton
          label="Start run!"
          onPress={start}
          loading={starting}
          disabled={tasks.length === 0}
        />
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
    gap: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  back: {
    ...hudLabel,
    color: colors.accent,
  },
  heading: {
    fontSize: typography.title + 2,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: colors.text,
    textTransform: 'uppercase',
  },
  mapCard: {
    height: '34%',
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...hudLabel,
    color: colors.text,
  },
  regenerate: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  regenerateText: {
    ...hudLabel,
    color: colors.accent,
  },
  list: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  error: {
    color: colors.error,
    fontSize: typography.micro + 1,
  },
});
