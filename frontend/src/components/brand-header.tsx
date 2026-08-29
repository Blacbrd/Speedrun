import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { radius, spacing, typography } from '../constants/theme';

type BrandHeaderProps = {
  tagline?: string;
};

export default function BrandHeader({ tagline }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoMark}>S</Text>
      </View>
      <Text style={styles.name}>Speedrun</Text>
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    color: colors.accentText,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  name: {
    fontSize: typography.display,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },
});
