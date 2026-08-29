import { useCallback, useEffect, useState } from 'react';

import type { Session } from '../lib/auth-types';
import { clearSession, loadSession } from '../lib/session-store';
import { attachSupabaseSession, detachSupabaseSession } from '../lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadSession()
      .then(async (stored) => {
        if (!active) {
          return;
        }
        setSession(stored);
        if (stored) {
          // Realtime/RLS run as the player, so the Supabase client needs the
          // same session the backend issued at login.
          await attachSupabaseSession(stored);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await detachSupabaseSession();
    await clearSession();
    setSession(null);
  }, []);

  return { session, loading, signOut };
}
