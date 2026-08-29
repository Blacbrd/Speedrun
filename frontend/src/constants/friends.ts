// Hackathon-scale friend list: the two real test accounts, resolved to player
// ids at runtime through the players table (no friends API exists yet).
export type Friend = {
  email: string;
  name: string;
};

export const FRIENDS: Friend[] = [
  { email: 'blacbrd123@gmail.com', name: 'Blacbrd' },
  { email: 'aayanjatala@icloud.com', name: 'Aayan' },
];

export const TIME_LIMIT_OPTIONS = [180, 300, 600];

export const DEFAULT_TIME_LIMIT_SECONDS = 300;
