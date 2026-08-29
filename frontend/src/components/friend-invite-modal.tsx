import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { hudLabel, radius, spacing, typography } from '../constants/theme';
import type { FriendPlayer } from '../lib/players';

type FriendInviteModalProps = {
  visible: boolean;
  friends: FriendPlayer[];
  loading: boolean;
  error: string | null;
  invitingPlayerId: string | null;
  onClose: () => void;
  onInvite: (friend: FriendPlayer) => void;
};

// Stand-in for a real friends list: the seeded test accounts, one tap to race.
export default function FriendInviteModal({
  visible,
  friends,
  loading,
  error,
  invitingPlayerId,
  onClose,
  onInvite,
}: FriendInviteModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.label}>Challenge</Text>
              <Text style={styles.heading}>Pick a rival</Text>
            </View>
            <Pressable
              style={styles.close}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close invite list"
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          {loading ? <ActivityIndicator color={colors.accent} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!loading && !error && friends.length === 0 ? (
            <Text style={styles.empty}>No opponents available on this account.</Text>
          ) : null}

          {friends.map((friend) => {
            const inviting = invitingPlayerId === friend.playerId;
            return (
              <Pressable
                key={friend.playerId}
                style={({ pressed }) => [styles.friend, pressed && styles.friendPressed]}
                onPress={() => onInvite(friend)}
                disabled={invitingPlayerId !== null}
                accessibilityRole="button"
                accessibilityLabel={`Invite ${friend.name}`}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{friend.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.friendBody}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendEmail}>{friend.email}</Text>
                </View>
                {inviting ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Text style={styles.invite}>Invite</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3,6,12,0.72)',
  },
  sheet: {
    backgroundColor: colors.backgroundLift,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...hudLabel,
    color: colors.accent,
  },
  heading: {
    fontSize: typography.title,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: colors.text,
  },
  close: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeText: {
    ...hudLabel,
    color: colors.text,
  },
  friend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  friendPressed: {
    opacity: 0.9,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '900',
    fontSize: typography.body,
  },
  friendBody: {
    flex: 1,
  },
  friendName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  friendEmail: {
    color: colors.muted,
    fontSize: typography.micro + 1,
  },
  invite: {
    ...hudLabel,
    color: colors.accent,
  },
  error: {
    color: colors.error,
    fontSize: typography.micro + 1,
  },
  empty: {
    color: colors.muted,
    fontSize: typography.caption,
  },
});
