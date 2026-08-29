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

    const channel = supabase
      .channel('invites')
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
