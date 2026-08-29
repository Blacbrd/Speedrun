import { get } from './api';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
};

export async function fetchTasks(token?: string): Promise<Task[]> {
  return get<Task[]>('/api/tasks', token);
}
