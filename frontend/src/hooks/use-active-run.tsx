import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Task } from '../lib/tasks';

type ActiveRun = {
  runId: string;
  tasks: Task[];
  completedTaskIds: string[];
  startedAt: number;
};

type ActiveRunContextValue = {
  run: ActiveRun | null;
  begin: (runId: string, tasks: Task[]) => void;
  completeTask: (taskId: string) => void;
  end: () => void;
};

const ActiveRunContext = createContext<ActiveRunContextValue | null>(null);

// The run's id + task list are shared between the run screen and the camera
// screen, so they live in context instead of being serialised into route params.
export function ActiveRunProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState<ActiveRun | null>(null);

  const begin = useCallback((runId: string, tasks: Task[]) => {
    setRun({ runId, tasks, completedTaskIds: [], startedAt: Date.now() });
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setRun((current) => {
      if (!current || current.completedTaskIds.includes(taskId)) {
        return current;
      }
      return { ...current, completedTaskIds: [...current.completedTaskIds, taskId] };
    });
  }, []);

  const end = useCallback(() => {
    setRun(null);
  }, []);

  const value = useMemo(
    () => ({ run, begin, completeTask, end }),
    [begin, completeTask, end, run],
  );

  return <ActiveRunContext.Provider value={value}>{children}</ActiveRunContext.Provider>;
}

export function useActiveRun(): ActiveRunContextValue {
  const context = useContext(ActiveRunContext);
  if (!context) {
    throw new Error('useActiveRun must be used inside an ActiveRunProvider');
  }
  return context;
}
