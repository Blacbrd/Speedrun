import { Platform, type ViewStyle } from 'react-native';

import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 44,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: 34,
  title: 22,
  body: 16,
  label: 13,
  caption: 14,
};

// Cross-platform elevation; iOS gets a soft shadow, Android an elevation value.
export function shadow(level: 'card' | 'button'): ViewStyle {
  const card = level === 'card';
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: card ? 0.06 : 0.22,
      shadowRadius: card ? 24 : 14,
      shadowOffset: { width: 0, height: card ? 12 : 8 },
    },
    android: { elevation: card ? 2 : 4 },
    default: {
      boxShadow: card
        ? `0 12px 24px rgba(11, 18, 32, 0.06)`
        : `0 8px 14px rgba(11, 18, 32, 0.22)`,
    },
  }) as ViewStyle;
}
