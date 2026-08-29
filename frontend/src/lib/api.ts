import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ACCESS_TOKEN_KEY = 'speedrun_access_token';
const USER_ID_KEY = 'speedrun_user_id';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.detail ?? `Request failed (${res.status})`);
  }

  return data;
}

export async function signup(email: string, password: string, username?: string) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
}

export async function login(email: string, password: string) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.access_token) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.access_token);
  }
  if (data.user_id) {
    await SecureStore.setItemAsync(USER_ID_KEY, data.user_id);
  }

  return data;
}

export async function getStoredUserId() {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

export async function logout() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}

export async function fetchTasks() {
  return request('/api/tasks/');
}
