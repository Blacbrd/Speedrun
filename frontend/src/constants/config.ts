// Every env var the app reads is declared here, nowhere else.
// Expo only exposes vars prefixed with EXPO_PUBLIC_ to the client bundle.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
