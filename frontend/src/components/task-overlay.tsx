import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/colors';
import { hudLabel, radius, spacing, typography } from '../constants/theme';
import type { Task } from '../lib/tasks';
import TaskList from './task-list';

type TaskOverlayProps = {
  visible: boolean;
  tasks: Task[];
  completedTaskIds: string[];
  onClose: () => void;
  onSelect: (task: Task) => void;
};

// Slides over the run screen when the HUD's task control is tapped.
export default function TaskOverlay({
  visible,
  tasks,
  completedTaskIds,
  onClose,
  onSelect,
}: TaskOverlayProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.label}>Run tasks</Text>
              <Text style={styles.progress}>
                {completedTaskIds.length}/{tasks.length} done
              </Text>
            </View>
            <Pressable
              style={styles.close}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close task list"
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>Tap an unfinished task to photograph it.</Text>

          <View style={styles.list}>
            <TaskList tasks={tasks} completedTaskIds={completedTaskIds} onSelect={onSelect} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3,6,12,0.72)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: colors.backgroundLift,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...hudLabel,
    color: colors.accent,
  },
  progress: {
    fontSize: typography.title,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: colors.text,
  },
  close: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeText: {
    ...hudLabel,
    color: colors.text,
  },
  hint: {
    fontSize: typography.micro + 1,
    color: colors.muted,
  },
  list: {
    flexShrink: 1,
    paddingTop: spacing.sm,
  },
});
