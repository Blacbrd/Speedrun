import { StyleSheet, Text, View } from 'react-native';

import LapCounter from '../components/lap-counter';
import { TEAM_NAME } from '../constants/team';
import { colors, spacing } from '../theme';

export default function Team() {
  return (
    <View style={styles.container}>
      <Text style={styles.teamName}>{TEAM_NAME}</Text>
      <LapCounter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  teamName: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
  },
});
