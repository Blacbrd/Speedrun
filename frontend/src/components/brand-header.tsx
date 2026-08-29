import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { glow, hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';

type BrandHeaderProps = {
  title: string;
  tagline?: string;
  timer?: string;
};

// HUD-style masthead: wordmark + live race clock, then the screen title.
export default function BrandHeader({ title, tagline, timer = '00:00.00' }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.wordmarkRow}>
          <View style={[styles.mark, glow(colors.glowWarm, 14)]}>
            <Text style={styles.markText}>S</Text>
          </View>
          <Text style={styles.wordmark}>Speedrunners</Text>
        </View>

        <View style={styles.clock}>
          <View style={styles.liveDot} />
          <Text style={styles.clockText}>{timer}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: colors.accentText,
    fontSize: 20,
    fontWeight: '900',
  },
  wordmark: {
    ...hudLabel,
    color: colors.text,
    fontSize: typography.label,
  },
  clock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  clockText: {
    fontFamily: monoFont,
    fontSize: typography.micro,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.accent,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.display,
    lineHeight: typography.display + 2,
    fontWeight: '900',
    letterSpacing: -1.4,
    color: colors.text,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: typography.caption,
    lineHeight: 20,
    color: colors.muted,
  },
});
