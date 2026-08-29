import { useEffect } from 'react';

import type { Coordinates } from './use-current-location';
import { sendMatchLocation } from '../lib/matches';

type Options = {
  matchId: string | null;
  playerId: string;
  coordinates: Coordinates | null;
  active: boolean;
  token?: string;
};

const BROADCAST_INTERVAL_MS = 5000;

// Pushes the player's position to the match while it's running; the opponent
// picks it up through their match_players subscription.
export function useLocationBroadcast({ matchId, playerId, coordinates, active, token }: Options) {
  useEffect(() => {
    if (!active || !matchId || !coordinates) {
      return;
    }

    let cancelled = false;
    const send = () => {
      if (cancelled) {
        return;
      }
      // A dropped position update is not worth surfacing mid-race.
      sendMatchLocation(matchId, playerId, coordinates.latitude, coordinates.longitude, token).catch(
        () => undefined,
      );
    };

    send();
    const interval = setInterval(send, BROADCAST_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [active, coordinates, matchId, playerId, token]);
}
