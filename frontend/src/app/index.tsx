import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { getStoredUserId } from '../lib/api';
import { colors } from '../theme';

export default function Index() {
  useEffect(() => {
    (async () => {
      const userId = await getStoredUserId();
      router.replace(userId ? '/home' : '/login');
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
});
