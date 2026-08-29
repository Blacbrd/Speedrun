import { useCallback, useState } from 'react';

export function useLapCounter(initialLaps = 0) {
  const [laps, setLaps] = useState(initialLaps);

  const addLap = useCallback(() => setLaps((current) => current + 1), []);
  const removeLap = useCallback(() => setLaps((current) => Math.max(0, current - 1)), []);
  const resetLaps = useCallback(() => setLaps(initialLaps), [initialLaps]);

  return { laps, addLap, removeLap, resetLaps };
}
