import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { MapPanel } from '../components/MapPanel';
import { logout } from '../lib/api';
import { colors, spacing } from '../theme';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speedrun</Text>
      <MapPanel />
      <Button label="Run" onPress={() => router.push('/run')} style={styles.run} />
      <Button label="Team" variant="secondary" onPress={() => router.push('/team')} />
      <Button
        label="Log out"
        variant="secondary"
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: spacing.md, gap: spacing.md },
  title: { fontSize: 28, fontWeight: '600', color: colors.text },
  run: { marginTop: spacing.sm },
});
