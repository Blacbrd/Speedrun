import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { glow, hudLabel, spacing } from '../constants/theme';

type RunButtonProps = {
  onPress: () => void;
  label?: string;
  caption?: string;
};

const SIZE = 188;

// The home screen's hero: a big circular start pad.
export default function RunButton({ onPress, label = 'Run!', caption }: RunButtonProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.halo} />
      <Pressable
        style={({ pressed }) => [styles.button, glow(colors.glowWarm, 30), pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.label}>{label}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: SIZE + 40,
    height: SIZE + 40,
    borderRadius: (SIZE + 40) / 2,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  label: {
    color: colors.accentText,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    textTransform: 'uppercase',
  },
  caption: {
    ...hudLabel,
    color: colors.accentText,
    opacity: 0.7,
  },
});
