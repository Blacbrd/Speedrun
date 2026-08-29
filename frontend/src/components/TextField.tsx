import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { colors, radius } from '../theme';

export function TextField(props: TextInputProps) {
  return <TextInput style={styles.input} placeholderTextColor={colors.muted} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
});
