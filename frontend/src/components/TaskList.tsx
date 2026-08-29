import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { fetchTasks } from '../lib/api';
import { colors, spacing } from '../theme';

export type Task = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
};

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load tasks'));
  }, []);

  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <FlatList
      data={tasks}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.difficulty} · {item.score} pts
          </Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginHorizontal: spacing.md },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  desc: { fontSize: 14, color: '#333', marginTop: 4 },
});
