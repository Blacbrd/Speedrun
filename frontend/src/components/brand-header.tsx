import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { radius, shadow, spacing, typography } from '../constants/theme';

type BrandHeaderProps = {
  title: string;
  tagline?: string;
};

export default function BrandHeader({ title, tagline }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.logo, shadow('button')]}>
        <Text style={styles.logoMark}>S</Text>
      </View>
      <Text style={styles.name}>Speedrun</Text>
      <Text style={styles.title}>{title}</Text>
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    color: colors.accentText,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  name: {
    marginTop: spacing.lg,
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.display,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: typography.caption,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
  },
});
