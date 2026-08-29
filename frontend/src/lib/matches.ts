import { get, postForm, postJson } from './api';
import { describePhoto } from './photo';

// Mirrors backend/schemas/match.py.
export type MatchStatus = 'pending' | 'active' | 'finished' | 'cancelled';

export type Match = {
  id: string;
  host_id: string;
  guest_id: string | null;
  status: MatchStatus;
  time_limit_seconds: number;
  started_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type MatchPlayer = {
  match_id: string;
  player_id: string;
  ready: boolean;
  score: number;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
};

export type MatchTask = {
  id: string;
  match_id: string;
  task_id: string;
  status: string;
  completed_by: string | null;
  completed_at: string | null;
  title: string;
  description: string;
  difficulty: string;
  score: number;
};

export type MatchState = {
  match: Match;
  players: MatchPlayer[];
  tasks: MatchTask[];
};

export type MatchVerification = {
  response: boolean;
  message: string;
  photo_url: string | null;
  score: number;
  new_task: MatchTask | null;
};

export async function inviteToMatch(
  hostId: string,
  guestId: string,
  timeLimitSeconds: number,
  token?: string,
): Promise<Match> {
  return postJson<Match>(
    '/api/matches/invite',
    { host_id: hostId, guest_id: guestId, time_limit_seconds: timeLimitSeconds },
    token,
  );
}

export async function setMatchTimeLimit(
  matchId: string,
  seconds: number,
  token?: string,
): Promise<Match> {
  return postJson<Match>(`/api/matches/${matchId}/time-limit`, { seconds }, token);
}

export async function readyUp(matchId: string, playerId: string, token?: string): Promise<Match> {
  return postJson<Match>(`/api/matches/${matchId}/ready`, { player_id: playerId }, token);
}

export async function fetchMatchState(matchId: string, token?: string): Promise<MatchState> {
  return get<MatchState>(`/api/matches/${matchId}`, token);
}

export async function sendMatchLocation(
  matchId: string,
  playerId: string,
  latitude: number,
  longitude: number,
  token?: string,
): Promise<void> {
  await postJson(
    `/api/matches/${matchId}/location`,
    { player_id: playerId, latitude, longitude },
    token,
  );
}

type VerifyArgs = {
  matchId: string;
  taskId: string;
  playerId: string;
  photoUri: string;
  token?: string;
};

export async function verifyMatchPhoto({
  matchId,
  taskId,
  playerId,
  photoUri,
  token,
}: VerifyArgs): Promise<MatchVerification> {
  const form = new FormData();
  form.append('task_id', taskId);
  form.append('player_id', playerId);
  // React Native's FormData accepts this file descriptor shape for uploads.
  form.append('file', { uri: photoUri, ...describePhoto(photoUri) } as unknown as Blob);

  return postForm<MatchVerification>(`/api/matches/${matchId}/verify`, form, token);
}
