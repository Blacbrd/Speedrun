import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { usePhotoVerification } from '../hooks/use-photo-verification';
import type { Task } from '../lib/tasks';

type TaskSubmissionProps = {
  task: Task;
  playerId?: string | null;
  token?: string;
};

export default function TaskSubmission({ task, playerId, token }: TaskSubmissionProps) {
  const { photoUri, verification, error, verifying, submit } = usePhotoVerification({
    taskId: String(task.id),
    playerId,
    token,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => submit('camera')} disabled={verifying}>
          <Text style={styles.buttonText}>Take photo</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => submit('library')} disabled={verifying}>
          <Text style={styles.buttonText}>Pick photo</Text>
        </Pressable>
      </View>

      {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}

      {verifying ? <ActivityIndicator color={colors.accent} /> : null}

      {verification ? (
        <View>
          <Text style={[styles.verdict, verification.match ? styles.accepted : styles.denied]}>
            {verification.match ? 'Accepted' : 'Denied'}
          </Text>
          <Text style={styles.reason}>{verification.reason}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: colors.accentText,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  verdict: {
    fontSize: 16,
    fontWeight: '700',
  },
  accepted: {
    color: colors.success,
  },
  denied: {
    color: colors.error,
  },
  reason: {
    color: colors.text,
  },
  error: {
    color: colors.error,
  },
});
