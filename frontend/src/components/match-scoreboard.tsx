import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { hudLabel, monoFont, radius, spacing, typography } from '../constants/theme';

type Side = {
  label: string;
  score: number;
  ready: boolean;
};

type MatchScoreboardProps = {
  you: Side;
  opponent: Side | null;
};

function Column({ side, mine }: { side: Side | null; mine: boolean }) {
  return (
    <View style={[styles.column, mine && styles.columnMine]}>
      <Text style={styles.label}>{side?.label ?? 'Waiting'}</Text>
      <Text style={[styles.score, mine && styles.scoreMine]}>{side?.score ?? 0}</Text>
      <Text style={styles.state}>{side ? (side.ready ? 'Ready' : 'Not ready') : '—'}</Text>
    </View>
  );
}

export default function MatchScoreboard({ you, opponent }: MatchScoreboardProps) {
  return (
    <View style={styles.wrapper}>
      <Column side={you} mine />
      <Text style={styles.versus}>VS</Text>
      <Column side={opponent} mine={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  columnMine: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  label: {
    ...hudLabel,
    fontSize: 10,
  },
  score: {
    fontFamily: monoFont,
    fontSize: typography.title + 4,
    fontWeight: '900',
    color: colors.text,
  },
  scoreMine: {
    color: colors.accent,
  },
  state: {
    fontSize: typography.micro,
    color: colors.muted,
  },
  versus: {
    ...hudLabel,
    color: colors.muted,
  },
});
