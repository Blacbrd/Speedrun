import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RoomMap from '../components/room-map';
import TaskList from '../components/task-list';
import TaskSubmission from '../components/task-submission';
import { colors } from '../constants/colors';
import { useCurrentLocation } from '../hooks/use-current-location';
import { useSession } from '../hooks/use-session';
import { useTasks } from '../hooks/use-tasks';
import type { Task } from '../lib/tasks';

export default function Room() {
  const { session, loading: sessionLoading, signOut } = useSession();
  const location = useCurrentLocation(Boolean(session));
  const { tasks, error: tasksError, loading: tasksLoading } = useTasks(session?.accessToken);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const signOutAndLeave = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{session.email ?? 'Signed in'}</Text>
        <Pressable onPress={signOutAndLeave}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.mapContainer}>
        {location.coordinates ? (
          <RoomMap center={location.coordinates} />
        ) : (
          <View style={styles.centered}>
            {location.loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Text style={styles.error}>{location.error ?? 'Location unavailable'}</Text>
                <Pressable onPress={location.retry}>
                  <Text style={styles.signOut}>Retry</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {tasksLoading ? <ActivityIndicator color={colors.accent} /> : null}
        {tasksError ? <Text style={styles.error}>{tasksError}</Text> : null}
        <TaskList
          tasks={tasks}
          selectedTaskId={selectedTask ? String(selectedTask.id) : null}
          onSelect={setSelectedTask}
        />
      </View>

      {selectedTask ? (
        <TaskSubmission
          key={String(selectedTask.id)}
          task={selectedTask}
          playerId={session.playerId}
          token={session.accessToken}
        />
      ) : null}
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
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerText: {
    color: colors.muted,
  },
  signOut: {
    color: colors.accent,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  tasksContainer: {
    height: 220,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  error: {
    color: colors.error,
    paddingHorizontal: 16,
  },
});
