import { StyleSheet, View } from 'react-native';

import { colors } from '../constants/colors';

// Purely decorative: two colour glows plus concentric track curves and a
// starting grid, all built from plain Views so no drawing library is needed.
export default function TrackBackdrop() {
  return (
    <View style={styles.backdrop} pointerEvents="none">
      <View style={[styles.glow, styles.glowWarm]} />
      <View style={[styles.glow, styles.glowCool]} />

      {[0, 1, 2, 3].map((lane) => (
        <View
          key={lane}
          style={[
            styles.curve,
            {
              width: 620 + lane * 150,
              height: 620 + lane * 150,
              borderRadius: (620 + lane * 150) / 2,
              bottom: -430 - lane * 78,
              marginLeft: -(620 + lane * 150) / 2,
            },
          ]}
        />
      ))}

      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5].map((stripe) => (
          <View key={stripe} style={styles.stripe} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.55,
  },
  glowWarm: {
    top: -230,
    right: -170,
    backgroundColor: colors.glowWarm,
  },
  glowCool: {
    bottom: -220,
    left: -190,
    backgroundColor: colors.glowCool,
  },
  curve: {
    position: 'absolute',
    left: '50%',
    borderWidth: 1.5,
    borderColor: colors.lane,
    backgroundColor: 'transparent',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
  },
  stripe: {
    flex: 1,
    marginRight: 6,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
});
