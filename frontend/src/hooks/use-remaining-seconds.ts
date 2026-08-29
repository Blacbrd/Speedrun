import { useEffect, useState } from 'react';

// Countdown driven by the server's `ends_at` so both devices agree; a local
// stopwatch would drift between players.
export function useRemainingSeconds(endsAt: string | null): number | null {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setSeconds(null);
      return;
    }

    const end = new Date(endsAt).getTime();
    if (Number.isNaN(end)) {
      setSeconds(null);
      return;
    }

    const tick = () => setSeconds(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return seconds;
}
