import { StyleSheet, Text, View } from 'react-native';

import LapCounter from '../components/lap-counter';
import { TEAM_NAME } from '../constants/team';

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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  teamName: {
    fontSize: 28,
    fontWeight: '600',
  },
});
