import { useEffect } from 'react';

import type { Match } from '../lib/matches';
import { getSupabase } from '../lib/supabase';

// The guest's "ping": a matches INSERT naming them is the invite itself.
export function useInviteListener(playerId: string | null, onInvite: (match: Match) => void) {
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !playerId) {
      return;
    }

    // A unique topic per effect run, not a fixed 'invites' name: React's
    // StrictMode double-invokes effects in dev (mount -> cleanup -> mount),
    // and supabase-js's channel() returns the SAME cached channel object for
    // a repeated topic name even if it's already subscribed - the second
    // invocation's .on() then throws "cannot add callbacks after
    // subscribe()". A fresh name each time means the two invocations never
    // touch the same channel object; the stale one is independently torn
    // down by its own cleanup.
    const channel = supabase
      .channel(`invites:${playerId}:${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `guest_id=eq.${playerId}`,
        },
        (payload) => onInvite(payload.new as Match),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInvite, playerId]);
}
