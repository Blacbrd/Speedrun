import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants/config';
import type { Session } from './auth-types';

let client: SupabaseClient | null = null;

// Null when the anon key/URL aren't configured — callers fall back to polling
// the REST API instead of Realtime.
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

// Realtime reads are RLS-checked as the signed-in player, so the client needs
// the very session the backend handed back at login/signup. Without this,
// subscriptions connect happily and then deliver nothing.
export async function attachSupabaseSession(session: Session): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !session.refreshToken) {
    return false;
  }
  const { error } = await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  return !error;
}

export async function detachSupabaseSession(): Promise<void> {
  await getSupabase()?.auth.signOut({ scope: 'local' });
}
