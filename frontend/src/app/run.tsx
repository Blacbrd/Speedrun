import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { colors, spacing } from '../theme';

// Mode picker between /home and /singleplayer - multiplayer/friends modes
// can slot in here later as more buttons.
export default function Run() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a mode</Text>
      <Button label="Singleplayer" onPress={() => router.push('/singleplayer')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 24, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
