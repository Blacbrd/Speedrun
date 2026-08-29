import { StyleSheet, Text, View } from 'react-native';

import { MapPanel } from '../components/MapPanel';
import { TaskList } from '../components/TaskList';
import { spacing } from '../theme';

export default function Singleplayer() {
  return (
    <View style={styles.container}>
      <MapPanel />
      <Text style={styles.sectionTitle}>Tasks</Text>
      <TaskList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: spacing.sm },
});
