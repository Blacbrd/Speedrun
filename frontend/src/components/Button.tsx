import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function Button({ label, onPress, loading, variant = 'primary', style }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      style={[styles.button, isPrimary ? styles.primary : styles.secondary, style]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primaryText : colors.primary} />
      ) : (
        <Text style={isPrimary ? styles.primaryText : styles.secondaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  primaryText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  secondaryText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});

export const buttonStyles = { spacing };
