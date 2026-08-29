import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchMatchState, type Match, type MatchPlayer, type MatchState, type MatchTask } from '../lib/matches';
import { getSupabase } from '../lib/supabase';

type Options = {
  matchId: string | null;
  playerId: string;
  token?: string;
};

export type OpponentEvent = {
  message: string;
  at: number;
};

const POLL_INTERVAL_MS = 5000;

function mergePlayer(state: MatchState, row: MatchPlayer): MatchState {
  const players = state.players.some((player) => player.player_id === row.player_id)
    ? state.players.map((player) => (player.player_id === row.player_id ? { ...player, ...row } : player))
    : [...state.players, row];
  return { ...state, players };
}

// Single source of truth for a match room: hydrates over REST, then keeps
// itself current from Realtime, falling back to polling when Realtime is
// unavailable (no anon key) or hasn't subscribed yet.
export function useMatchRoom({ matchId, playerId, token }: Options) {
  const [state, setState] = useState<MatchState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtime, setRealtime] = useState(false);
  const [opponentEvent, setOpponentEvent] = useState<OpponentEvent | null>(null);
  const stateRef = useRef<MatchState | null>(null);

  stateRef.current = state;

  const refresh = useCallback(async () => {
    if (!matchId) {
      return;
    }
    try {
      setState(await fetchMatchState(matchId, token));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load the match');
    } finally {
      setLoading(false);
    }
  }, [matchId, token]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !matchId) {
      return;
    }

    // Unique per effect run (not just per matchId) for the same reason as
    // use-invite-listener: StrictMode's dev double-invoke would otherwise
    // grab the same already-subscribed channel object and throw on the
    // second .on() call.
    const channel = supabase
      .channel(`match-${matchId}:${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as Match;
          setState((current) => (current ? { ...current, match: { ...current.match, ...row } } : current));
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_players', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as MatchPlayer;
          setState((current) => (current ? mergePlayer(current, row) : current));
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_tasks', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as Partial<MatchTask>;
          if (row.status === 'completed' && row.completed_by && row.completed_by !== playerId) {
            const known = stateRef.current?.tasks.find((task) => task.id === row.id);
            setOpponentEvent({
              message: known ? `Opponent completed “${known.title}”` : 'Opponent completed a task',
              at: Date.now(),
            });
          }
          // match_tasks rows carry no task title/description, and completions
          // reseed the active set, so re-read the flattened state.
          refresh();
        },
      )
      .subscribe((status) => {
        setRealtime(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setRealtime(false);
    };
  }, [matchId, playerId, refresh]);

  useEffect(() => {
    if (realtime || !matchId) {
      return;
    }
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [matchId, realtime, refresh]);

  const applyOwnScore = useCallback((score: number) => {
    setState((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        players: current.players.map((player) =>
          player.player_id === playerId ? { ...player, score } : player,
        ),
      };
    });
  }, [playerId]);

  return { state, error, loading, realtime, opponentEvent, refresh, applyOwnScore };
}
