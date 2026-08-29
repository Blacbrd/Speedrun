import { useEffect, useState } from 'react';

// Strava-style count-up: ticks once a second from `startedAt` (a Date.now()).
export function useElapsedSeconds(startedAt: number | null): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (startedAt === null) {
      setSeconds(0);
      return;
    }

    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return seconds;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
