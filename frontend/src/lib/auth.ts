import { postJson } from './api';
import type { Session } from './auth-types';

type Credentials = {
  email: string;
  password: string;
};

// The backend returns the Supabase auth payload; tolerate both a flat session
// and one nested under `session`, since Supabase clients expose both shapes.
type AuthResponse = {
  access_token?: string;
  refresh_token?: string | null;
  session?: {
    access_token?: string;
    refresh_token?: string | null;
  } | null;
  user?: {
    id?: string | null;
    email?: string | null;
  } | null;
};

function toSession(response: AuthResponse): Session {
  const accessToken = response.access_token ?? response.session?.access_token;
  if (!accessToken) {
    throw new Error('Auth response did not include an access token');
  }

  return {
    accessToken,
    refreshToken: response.refresh_token ?? response.session?.refresh_token ?? null,
    playerId: response.user?.id ?? null,
    email: response.user?.email ?? null,
  };
}

export async function signUp(credentials: Credentials): Promise<Session> {
  return toSession(await postJson<AuthResponse>('/api/auth/signup', credentials));
}

export async function signIn(credentials: Credentials): Promise<Session> {
  return toSession(await postJson<AuthResponse>('/api/auth/login', credentials));
}
