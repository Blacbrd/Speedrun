import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HudToast from '../components/hud-toast';
import LiveMap from '../components/live-map';
import MatchScoreboard from '../components/match-scoreboard';
import PrimaryButton from '../components/primary-button';
import TaskList from '../components/task-list';
import TimeLimitPicker from '../components/time-limit-picker';
import TrackBackdrop from '../components/track-backdrop';
import { colors } from '../constants/colors';
import { TIME_LIMIT_OPTIONS } from '../constants/friends';
import { glow, hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';
import { useCurrentLocation } from '../hooks/use-current-location';
import { formatDuration } from '../hooks/use-elapsed-seconds';
import { useLocationBroadcast } from '../hooks/use-location-broadcast';
import { useMatchRoom } from '../hooks/use-match-room';
import { useRemainingSeconds } from '../hooks/use-remaining-seconds';
import { useSession } from '../hooks/use-session';
import { readyUp, setMatchTimeLimit, type MatchTask } from '../lib/matches';
import type { Task } from '../lib/tasks';

function asTask(matchTask: MatchTask): Task {
  return {
    id: matchTask.task_id,
    title: matchTask.title,
    description: matchTask.description,
    difficulty: matchTask.difficulty,
    score: matchTask.score,
  };
}

export default function MatchScreen() {
  const { matchId } = useLocalSearchParams<{ matchId?: string }>();
  const { session, loading: sessionLoading } = useSession();
  const playerId = session?.playerId ?? '';
  const room = useMatchRoom({ matchId: matchId ?? null, playerId, token: session?.accessToken });
  const location = useCurrentLocation(Boolean(session), true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const status = room.state?.match.status ?? null;
  const remaining = useRemainingSeconds(room.state?.match.ends_at ?? null);

  useLocationBroadcast({
    matchId: matchId ?? null,
    playerId,
    coordinates: location.coordinates,
    active: status === 'active',
    token: session?.accessToken,
  });

  // Coming back from the camera, pull the authoritative scores/task set.
  const refresh = room.refresh;
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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

  if (!matchId) {
    return <Redirect href="/home" />;
  }

  if (room.loading && !room.state) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!room.state) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.error}>{room.error ?? 'Match unavailable'}</Text>
          <Pressable onPress={() => router.replace('/home')}>
            <Text style={styles.retry}>Back home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { match, players, tasks } = room.state;
  const me = players.find((player) => player.player_id === playerId) ?? null;
  const opponent = players.find((player) => player.player_id !== playerId) ?? null;
  const isHost = match.host_id === playerId;
  const activeTasks = tasks.filter((task) => task.status === 'active');
  const finished = match.status === 'active' && remaining !== null && remaining <= 0;

  const opponentCoordinates =
    opponent?.latitude !== null && opponent?.latitude !== undefined && opponent?.longitude !== null && opponent?.longitude !== undefined
      ? { latitude: opponent.latitude, longitude: opponent.longitude }
      : null;

  const chooseTimeLimit = async (seconds: number) => {
    setActionError(null);
    setBusy(true);
    try {
      await setMatchTimeLimit(match.id, seconds, session.accessToken);
      await room.refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Could not set the race length');
    } finally {
      setBusy(false);
    }
  };

  const ready = async () => {
    setActionError(null);
    setBusy(true);
    try {
      await readyUp(match.id, playerId, session.accessToken);
      await room.refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Could not ready up');
    } finally {
      setBusy(false);
    }
  };

  const scoreboard = (
    <MatchScoreboard
      you={{ label: 'You', score: me?.score ?? 0, ready: me?.ready ?? false }}
      opponent={
        opponent
          ? { label: 'Rival', score: opponent.score, ready: opponent.ready }
          : null
      }
    />
  );

  if (finished) {
    const youWon = (me?.score ?? 0) > (opponent?.score ?? 0);
    const drew = (me?.score ?? 0) === (opponent?.score ?? 0);
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <TrackBackdrop />
        <View style={styles.resultBody}>
          <Text style={styles.label}>Time up</Text>
          <Text style={styles.result}>{drew ? 'Dead heat' : youWon ? 'You win' : 'You lose'}</Text>
          {scoreboard}
          <PrimaryButton label="Back to home" onPress={() => router.replace('/home')} />
        </View>
      </SafeAreaView>
    );
  }

  if (match.status !== 'active') {
    const waiting = Boolean(me?.ready) && !opponent?.ready;
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <TrackBackdrop />
        <View style={styles.lobby}>
          <Text style={styles.label}>{isHost ? 'You invited a rival' : 'You were challenged'}</Text>
          <Text style={styles.heading}>Starting grid</Text>

          {scoreboard}

          {isHost ? (
            <TimeLimitPicker
              options={TIME_LIMIT_OPTIONS}
              value={match.time_limit_seconds}
              disabled={busy || Boolean(me?.ready)}
              onChange={chooseTimeLimit}
            />
          ) : (
            <Text style={styles.hint}>
              Host picked {match.time_limit_seconds / 60} min — ready up when you are.
            </Text>
          )}

          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

          {waiting ? (
            <Text style={styles.waiting}>Waiting for other player…</Text>
          ) : (
            <PrimaryButton
              label={me?.ready ? 'Ready' : "I'm ready"}
              onPress={ready}
              loading={busy}
              disabled={Boolean(me?.ready)}
            />
          )}

          {!room.realtime ? (
            <Text style={styles.hint}>Live updates unavailable — polling the match instead.</Text>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.hud}>
        <View>
          <Text style={styles.label}>Remaining</Text>
          <Text style={styles.timer}>{formatDuration(remaining ?? 0)}</Text>
        </View>
        <View style={styles.hudRight}>{scoreboard}</View>
      </View>

      <View style={styles.mapSection}>
        {location.coordinates ? (
          <LiveMap center={location.coordinates} opponent={opponentCoordinates} />
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
        <HudToast
          message={room.opponentEvent?.message ?? null}
          eventKey={room.opponentEvent?.at ?? null}
        />
      </View>

      <View style={styles.taskSection}>
        <Text style={styles.label}>{activeTasks.length} tasks live</Text>
        <View style={[styles.taskList, glow(colors.shadow, 10)]}>
          <TaskList
            tasks={activeTasks.map(asTask)}
            onSelect={(task) =>
              router.push({
                pathname: '/match-camera',
                params: { matchId: match.id, taskId: String(task.id), title: task.title },
              })
            }
          />
        </View>
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
  lobby: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  resultBody: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  label: {
    ...hudLabel,
  },
  heading: {
    fontSize: typography.display - 6,
    fontWeight: '900',
    letterSpacing: -1.4,
    color: colors.text,
    textTransform: 'uppercase',
  },
  result: {
    fontSize: typography.display - 2,
    fontWeight: '900',
    letterSpacing: -1.6,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: typography.micro + 1,
    color: colors.muted,
  },
  waiting: {
    ...hudLabel,
    color: colors.accent,
    fontSize: typography.label,
    textAlign: 'center',
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  hudRight: {
    flex: 1,
  },
  timer: {
    fontFamily: monoFont,
    fontSize: typography.display - 8,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: colors.accent,
  },
  mapSection: {
    height: '52%',
    overflow: 'hidden',
  },
  taskSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  taskList: {
    flex: 1,
    borderRadius: radius.md,
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
