import { Platform, type TextStyle, type ViewStyle } from 'react-native';

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
  display: 40,
  title: 22,
  body: 16,
  label: 13,
  caption: 14,
  micro: 11,
};

// Condensed numeric/HUD readouts (timers, stats) use the platform mono face.
export const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});

export const hudLabel: TextStyle = {
  fontSize: typography.micro,
  fontWeight: '700',
  letterSpacing: 1.6,
  textTransform: 'uppercase',
  color: colors.muted,
};

// Cross-platform elevation; iOS/web get a soft glow, Android an elevation value.
export function glow(color: string, strength = 18): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOpacity: 0.6,
      shadowRadius: strength,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 6 },
    default: { boxShadow: `0 6px ${strength * 1.4}px ${color}` },
  }) as ViewStyle;
}
