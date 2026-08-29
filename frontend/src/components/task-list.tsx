import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';
import type { Task } from '../lib/tasks';

type TaskListProps = {
  tasks: Task[];
  completedTaskIds?: string[];
  onSelect?: (task: Task) => void;
};

// Task cards for both the setup list and the in-run overlay.
export default function TaskList({ tasks, completedTaskIds = [], onSelect }: TaskListProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {tasks.map((task, index) => {
        const done = completedTaskIds.includes(String(task.id));
        return (
          <Pressable
            key={String(task.id)}
            style={({ pressed }) => [
              styles.card,
              done && styles.cardDone,
              pressed && onSelect && !done ? styles.cardPressed : null,
            ]}
            onPress={onSelect && !done ? () => onSelect(task) : undefined}
            disabled={!onSelect || done}
            accessibilityRole={onSelect ? 'button' : undefined}
            accessibilityLabel={`${task.title}${done ? ', done' : ''}`}
          >
            <View style={styles.index}>
              <Text style={[styles.indexText, done && styles.indexTextDone]}>
                {done ? '✓' : String(index + 1).padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.body}>
              <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
                {task.title}
              </Text>
              {task.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {task.description}
                </Text>
              ) : null}
            </View>

            <View style={styles.meta}>
              {task.difficulty ? (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{task.difficulty}</Text>
                </View>
              ) : null}
              {task.score !== null && task.score !== undefined ? (
                <Text style={styles.score}>{task.score} pts</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardDone: {
    borderColor: colors.accentSoft,
    backgroundColor: colors.accentSoft,
  },
  cardPressed: {
    borderColor: colors.borderStrong,
    transform: [{ scale: 0.995 }],
  },
  index: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontFamily: monoFont,
    fontSize: typography.micro,
    fontWeight: '900',
    color: colors.muted,
  },
  indexTextDone: {
    color: colors.accent,
    fontSize: typography.label,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.body - 1,
    fontWeight: '700',
    color: colors.text,
  },
  titleDone: {
    color: colors.accent,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: typography.micro + 1,
    lineHeight: 16,
    color: colors.muted,
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pillText: {
    ...hudLabel,
    fontSize: 9,
    color: colors.text,
  },
  score: {
    fontFamily: monoFont,
    fontSize: typography.micro,
    color: colors.muted,
  },
});
