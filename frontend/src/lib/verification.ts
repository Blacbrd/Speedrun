import { postForm } from './api';
import { describePhoto } from './photo';

// Backend contract: POST /api/gemini/verify -> {response, message, photo_url}.
export type Verification = {
  response: boolean;
  message: string;
  photo_url: string | null;
};

type VerifyArgs = {
  taskId: string;
  photoUri: string;
  playerId?: string | null;
  runId?: string | null;
  token?: string;
};

export async function verifyTaskPhoto({
  taskId,
  photoUri,
  playerId,
  runId,
  token,
}: VerifyArgs): Promise<Verification> {
  const form = new FormData();
  form.append('task_id', taskId);
  if (playerId) {
    form.append('player_id', playerId);
  }
  if (runId) {
    form.append('run_id', runId);
  }
  // React Native's FormData accepts this file descriptor shape for uploads.
  form.append('file', {
    uri: photoUri,
    ...describePhoto(photoUri),
  } as unknown as Blob);

  return postForm<Verification>('/api/gemini/verify', form, token);
}
