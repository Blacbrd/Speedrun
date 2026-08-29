import { postJson } from './api';

export type Run = {
  id: string;
  player_id: string;
  mode: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  tasks_completed: number;
  score: number;
};

export type RunMode = 'singleplayer' | 'multiplayer';

export async function startRun(
  playerId: string,
  mode: RunMode = 'singleplayer',
  token?: string,
): Promise<Run> {
  return postJson<Run>('/api/runs/start', { player_id: playerId, mode }, token);
}

export async function finishRun(
  runId: string,
  durationSeconds: number,
  token?: string,
): Promise<Run> {
  return postJson<Run>(`/api/runs/${runId}/finish`, { duration_seconds: durationSeconds }, token);
}
