import { useCallback, useEffect, useState } from 'react';

import { fetchRandomTasks, type Task } from '../lib/tasks';

type Options = {
  playerId?: string | null;
  token?: string;
  count?: number;
  enabled?: boolean;
};

// Backs the singleplayer setup screen: an initial draw plus "Regenerate".
export function useRandomTasks({ playerId, token, count = 5, enabled = true }: Options) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);

  const regenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await fetchRandomTasks({ playerId, count, token }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [count, playerId, token]);

  useEffect(() => {
    if (enabled) {
      regenerate();
    }
  }, [enabled, regenerate]);

  return { tasks, error, loading, regenerate };
}
