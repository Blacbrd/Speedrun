import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/colors';
import { glow, hudLabel, radius, spacing } from '../constants/theme';
import BrandHeader from './brand-header';
import StatStrip, { type Stat } from './stat-strip';
import TrackBackdrop from './track-backdrop';

type AuthScreenProps = {
  title: string;
  tagline: string;
  lane: string;
  stats: Stat[];
  children: ReactNode;
  footer?: ReactNode;
};

// Shared shell for sign-in / sign-up: track backdrop, HUD masthead + stats,
// then a compact form panel and footer link. Keyboard-aware, iPhone-first.
export default function AuthScreen({
  title,
  tagline,
  lane,
  stats,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TrackBackdrop />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandHeader title={title} tagline={tagline} />
          <StatStrip stats={stats} />

          <View style={[styles.card, glow(colors.shadow, 24)]}>
            <View style={styles.cardHeader}>
              <View style={styles.laneBadge}>
                <Text style={styles.laneText}>{lane}</Text>
              </View>
              <View style={styles.laneRule} />
            </View>
            {children}
          </View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  laneBadge: {
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  laneText: {
    ...hudLabel,
    color: colors.accent,
  },
  laneRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairline,
  },
  footer: {
    alignItems: 'center',
  },
});
