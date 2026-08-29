import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import type { Task } from '../lib/tasks';

type TaskListProps = {
  tasks: Task[];
  selectedTaskId?: string | null;
  onSelect: (task: Task) => void;
};

export default function TaskList({ tasks, selectedTaskId, onSelect }: TaskListProps) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(task) => String(task.id)}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <Pressable
          style={[styles.row, String(item.id) === selectedTaskId && styles.rowSelected]}
          onPress={() => onSelect(item)}
        >
          <Text style={styles.title}>{item.title}</Text>
          {item.difficulty ? <Text style={styles.meta}>{item.difficulty}</Text> : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowSelected: {
    backgroundColor: '#eaf3fd',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
  },
});
