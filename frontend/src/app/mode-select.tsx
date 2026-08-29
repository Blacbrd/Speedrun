import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TrackBackdrop from '../components/track-backdrop';
import { colors } from '../constants/colors';
import { hudLabel, radius, spacing, typography } from '../constants/theme';

type ModeCardProps = {
  title: string;
  caption: string;
  badge: string;
  disabled?: boolean;
  onPress?: () => void;
};

function ModeCard({ title, caption, badge, disabled = false, onPress }: ModeCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        disabled ? styles.cardDisabled : styles.cardActive,
        pressed && !disabled ? styles.cardPressed : null,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.badge, disabled && styles.mutedText]}>{badge}</Text>
      <Text style={[styles.title, disabled && styles.mutedText]}>{title}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </Pressable>
  );
}

export default function ModeSelect() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TrackBackdrop />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.heading}>Pick your race</Text>
      </View>

      <View style={styles.cards}>
        <ModeCard
          badge="Lane 01"
          title="Singleplayer"
          caption="Five random photo tasks, one clock, just you."
          onPress={() => router.push('/singleplayer')}
        />
        <ModeCard
          badge="Lane 02"
          title="Multiplayer"
          caption="Coming soon — race friends in real time."
          disabled
        />
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
  heading: {
    fontSize: typography.title + 6,
    fontWeight: '900',
    letterSpacing: -1,
    color: colors.text,
    textTransform: 'uppercase',
  },
  cards: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cardActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  cardDisabled: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  badge: {
    ...hudLabel,
    color: colors.accent,
  },
  title: {
    fontSize: typography.display - 4,
    fontWeight: '900',
    letterSpacing: -1.4,
    color: colors.text,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: typography.caption,
    lineHeight: 20,
    color: colors.muted,
  },
  mutedText: {
    color: colors.muted,
  },
});
