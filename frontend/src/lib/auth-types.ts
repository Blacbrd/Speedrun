export type Session = {
  accessToken: string;
  refreshToken: string | null;
  playerId: string | null;
  email: string | null;
};
