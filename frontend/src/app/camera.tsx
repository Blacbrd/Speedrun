import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../components/primary-button';
import { colors } from '../constants/colors';
import { hudLabel, radius, spacing, typography } from '../constants/theme';
import { useActiveRun } from '../hooks/use-active-run';
import { usePhotoVerification } from '../hooks/use-photo-verification';
import { useSession } from '../hooks/use-session';

export default function CameraScreen() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { session, loading } = useSession();
  const { run, completeTask } = useActiveRun();
  const task = run?.tasks.find((candidate) => String(candidate.id) === taskId) ?? null;

  const { photoUri, verification, error, verifying, submit } = usePhotoVerification({
    taskId: taskId ?? '',
    playerId: session?.playerId,
    runId: run?.runId,
    token: session?.accessToken,
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  if (!run || !task) {
    return <Redirect href="/home" />;
  }

  const capture = async (source: 'camera' | 'library') => {
    const result = await submit(source);
    if (result?.response) {
      completeTask(String(task.id));
      router.back();
    }
  };

  const rejected = verification !== null && !verification.response;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {rejected ? (
        <View style={styles.banner}>
          <Text style={styles.bannerLabel}>Not verified</Text>
          <Text style={styles.bannerText}>{verification.message}</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to run">
          <Text style={styles.back}>‹ Back to run</Text>
        </Pressable>
        <Text style={styles.label}>Photo proof</Text>
        <Text style={styles.title}>{task.title}</Text>
        {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
      </View>

      <View style={styles.preview}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.previewImage} contentFit="cover" />
        ) : (
          <Text style={styles.previewHint}>Take a photo that clearly shows the subject.</Text>
        )}
        {verifying ? (
          <View style={styles.verifying}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.verifyingText}>Checking with the referee…</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={photoUri ? 'Retake photo' : 'Take photo'}
          onPress={() => capture('camera')}
          loading={verifying}
        />
        <Pressable
          style={styles.secondary}
          onPress={() => capture('library')}
          disabled={verifying}
          accessibilityRole="button"
          accessibilityLabel="Choose from library"
        >
          <Text style={styles.secondaryText}>Choose from library</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  banner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorSurface,
    gap: 2,
  },
  bannerLabel: {
    ...hudLabel,
    color: colors.error,
  },
  bannerText: {
    color: colors.text,
    fontSize: typography.caption,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  back: {
    ...hudLabel,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  label: {
    ...hudLabel,
  },
  title: {
    fontSize: typography.title + 2,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: colors.text,
  },
  description: {
    fontSize: typography.caption,
    lineHeight: 20,
    color: colors.muted,
  },
  preview: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: spacing.md,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  previewHint: {
    color: colors.muted,
    fontSize: typography.caption,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  verifying: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(7,11,20,0.72)',
  },
  verifyingText: {
    ...hudLabel,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  secondary: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    ...hudLabel,
    color: colors.accent,
  },
  error: {
    color: colors.error,
    fontSize: typography.micro + 1,
  },
});
