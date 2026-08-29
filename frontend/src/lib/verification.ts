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

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
  gif: 'image/gif',
};

function describePhoto(uri: string): { name: string; type: string } {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const type = MIME_TYPES[extension];
  if (!type) {
    return { name: 'submission.jpg', type: 'image/jpeg' };
  }
  return { name: `submission.${extension}`, type };
}

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
    ...describePhoto(photoUri),
  } as unknown as Blob);

  return postForm<Verification>('/api/gemini/verify', form, token);
}
