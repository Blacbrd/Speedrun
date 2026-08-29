import { useCallback, useState } from 'react';

import { verifyMatchPhoto, type MatchVerification } from '../lib/matches';
import { pickPhoto, type PhotoSource } from '../lib/photo';

type Options = {
  matchId: string;
  taskId: string;
  playerId: string;
  token?: string;
};

// Same shape as usePhotoVerification, but scored against a match.
export function useMatchVerification({ matchId, taskId, playerId, token }: Options) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [verification, setVerification] = useState<MatchVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const submit = useCallback(
    async (source: PhotoSource): Promise<MatchVerification | null> => {
      setError(null);
      setVerification(null);
      try {
        const uri = await pickPhoto(source);
        if (!uri) {
          return null;
        }
        setPhotoUri(uri);
        setVerifying(true);
        const result = await verifyMatchPhoto({ matchId, taskId, playerId, photoUri: uri, token });
        setVerification(result);
        return result;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Verification failed');
        return null;
      } finally {
        setVerifying(false);
      }
    },
    [matchId, playerId, taskId, token],
  );

  return { photoUri, verification, error, verifying, submit };
}
