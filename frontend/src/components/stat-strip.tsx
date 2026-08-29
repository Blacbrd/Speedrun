import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';

export type Stat = {
  label: string;
  value: string;
};

type StatStripProps = {
  stats: Stat[];
};

// HUD readout row used under the masthead on the auth screens.
export default function StatStrip({ stats }: StatStripProps) {
  return (
    <View style={styles.strip}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={styles.cell}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    position: 'absolute',
    left: 0,
    top: -spacing.xs,
    bottom: -spacing.xs,
    width: 1,
    backgroundColor: colors.hairline,
  },
  value: {
    fontFamily: monoFont,
    fontSize: typography.title,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: colors.accent,
  },
  label: {
    ...hudLabel,
    fontSize: 10,
    letterSpacing: 1.2,
  },
});
