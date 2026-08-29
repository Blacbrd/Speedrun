import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LapCounter from '../components/lap-counter';
import TrackBackdrop from '../components/track-backdrop';
import { colors } from '../constants/colors';
import { TEAM_NAME } from '../constants/team';
import { hudLabel, spacing, typography } from '../constants/theme';

export default function Team() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TrackBackdrop />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.label}>Team</Text>
        <Text style={styles.teamName}>{TEAM_NAME}</Text>
      </View>

      <View style={styles.body}>
        <LapCounter />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  back: {
    ...hudLabel,
    color: colors.accent,
  },
  label: hudLabel,
  teamName: {
    fontSize: typography.display - 4,
    fontWeight: '900',
    letterSpacing: -1.4,
    color: colors.text,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
});
