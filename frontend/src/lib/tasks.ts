import { get } from './api';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  score: number | null;
};

type RandomTasksArgs = {
  playerId?: string | null;
  count?: number;
  token?: string;
};

// A fresh draw for a run; the backend excludes tasks the player already verified.
export async function fetchRandomTasks({
  playerId,
  count = 5,
  token,
}: RandomTasksArgs): Promise<Task[]> {
  const query = new URLSearchParams({ count: String(count) });
  if (playerId) {
    query.set('player_id', playerId);
  }
  return get<Task[]>(`/api/tasks/random?${query.toString()}`, token);
}
