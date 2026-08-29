import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LiveMap from '../components/live-map';
import TaskOverlay from '../components/task-overlay';
import { colors } from '../constants/colors';
import { glow, hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';
import { useActiveRun } from '../hooks/use-active-run';
import { useCurrentLocation } from '../hooks/use-current-location';
import { formatDuration, useElapsedSeconds } from '../hooks/use-elapsed-seconds';
import { useSession } from '../hooks/use-session';
import { finishRun } from '../lib/runs';

export default function RunScreen() {
  const { session, loading: sessionLoading } = useSession();
  const { run, end } = useActiveRun();
  const location = useCurrentLocation(Boolean(session));
  const elapsed = useElapsedSeconds(run?.startedAt ?? null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Nothing to show without an active run (e.g. after a reload).
  if (!run) {
    return <Redirect href="/home" />;
  }

  const finish = async () => {
    setError(null);
    setFinishing(true);
    try {
      await finishRun(run.runId, elapsed, session.accessToken);
      end();
      router.replace('/home');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not finish the run');
    } finally {
      setFinishing(false);
    }
  };

  const openCamera = (taskId: string) => {
    setOverlayVisible(false);
    router.push({ pathname: '/camera', params: { taskId } });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.hud}>
        <View>
          <Text style={styles.label}>Elapsed</Text>
          <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
        </View>
        <View style={styles.hudRight}>
          <Text style={styles.label}>Tasks</Text>
          <Text style={styles.progress}>
            {run.completedTaskIds.length}/{run.tasks.length}
          </Text>
        </View>
      </View>

      <View style={styles.mapSection}>
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
                  <Text style={styles.retry}>Retry</Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        <Pressable
          style={[styles.overlayControl, glow(colors.shadow, 12)]}
          onPress={() => setOverlayVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Show run tasks"
        >
          <Text style={styles.overlayControlIcon}>☰</Text>
          <Text style={styles.overlayControlText}>
            {run.completedTaskIds.length}/{run.tasks.length}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={({ pressed }) => [styles.finish, pressed && styles.finishPressed]}
          onPress={finish}
          disabled={finishing}
          accessibilityRole="button"
          accessibilityLabel="End run"
        >
          {finishing ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={styles.finishText}>End run</Text>
          )}
        </Pressable>
      </View>

      <TaskOverlay
        visible={overlayVisible}
        tasks={run.tasks}
        completedTaskIds={run.completedTaskIds}
        onClose={() => setOverlayVisible(false)}
        onSelect={(task) => openCamera(String(task.id))}
      />
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
  hud: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  hudRight: {
    alignItems: 'flex-end',
  },
  label: {
    ...hudLabel,
  },
  timer: {
    fontFamily: monoFont,
    fontSize: typography.display - 4,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: colors.accent,
  },
  progress: {
    fontFamily: monoFont,
    fontSize: typography.title,
    fontWeight: '900',
    color: colors.text,
  },
  mapSection: {
    height: '80%',
    overflow: 'hidden',
  },
  overlayControl: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundLift,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  overlayControlIcon: {
    color: colors.accent,
    fontSize: typography.label,
    fontWeight: '900',
  },
  overlayControlText: {
    fontFamily: monoFont,
    fontSize: typography.micro,
    fontWeight: '900',
    color: colors.text,
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  finish: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorSurface,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
  },
  finishPressed: {
    opacity: 0.85,
  },
  finishText: {
    ...hudLabel,
    color: colors.error,
    fontSize: typography.label,
  },
  error: {
    color: colors.error,
    fontSize: typography.micro + 1,
  },
  retry: {
    ...hudLabel,
    color: colors.accent,
  },
});
