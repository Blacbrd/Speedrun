import { FRIENDS, type Friend } from '../constants/friends';
import { getSupabase } from './supabase';

export type FriendPlayer = Friend & {
  playerId: string;
};

type PlayerRow = {
  id: string;
  email: string | null;
  username: string | null;
};

// The backend exposes no players lookup, so the invite list resolves ids
// straight from the players table with the player's own Supabase session.
export async function fetchFriendPlayers(currentPlayerId: string): Promise<FriendPlayer[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured — set EXPO_PUBLIC_SUPABASE_URL/ANON_KEY');
  }

  const { data, error } = await supabase
    .from('players')
    .select('id, email, username')
    .in(
      'email',
      FRIENDS.map((friend) => friend.email),
    );

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as PlayerRow[];
  return FRIENDS.flatMap((friend) => {
    const row = rows.find((candidate) => candidate.email === friend.email);
    if (!row || row.id === currentPlayerId) {
      return [];
    }
    return [{ ...friend, name: row.username ?? friend.name, playerId: row.id }];
  });
}
