import { postForm } from './api';

export type Verification = {
  match: boolean;
  reason: string;
};

type VerifyArgs = {
  taskId: string;
  photoUri: string;
  playerId?: string | null;
  token?: string;
};

export async function verifyTaskPhoto({
  taskId,
  photoUri,
  playerId,
  token,
}: VerifyArgs): Promise<Verification> {
  const form = new FormData();
  form.append('task_id', taskId);
  if (playerId) {
    form.append('player_id', playerId);
  }
  // React Native's FormData accepts this file descriptor shape for uploads.
  form.append('file', {
    uri: photoUri,
    name: 'submission.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  return postForm<Verification>('/api/gemini/verify', form, token);
}
