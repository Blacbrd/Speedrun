import * as SecureStore from 'expo-secure-store';

import type { Session } from './auth-types';

const SESSION_KEY = 'speedrun.session';

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { accessToken } = value as Partial<Session>;
  return typeof accessToken === 'string' && accessToken.length > 0;
}

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isSession(parsed)) {
      return parsed;
    }
  } catch {
    // fall through: stored value is unusable
  }
  await clearSession();
  return null;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
