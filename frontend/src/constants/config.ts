// Every env var the app reads is declared here, nowhere else.
// Expo only exposes vars prefixed with EXPO_PUBLIC_ to the client bundle.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

// Client-side Supabase access is anon-key only; the service-role key must never
// reach the bundle.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
