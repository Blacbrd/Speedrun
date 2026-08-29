import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { verifyTaskPhoto, type Verification } from '../lib/verification';

type Options = {
  taskId: string;
  playerId?: string | null;
  runId?: string | null;
  token?: string;
};

type Source = 'camera' | 'library';

async function pickPhoto(source: Source): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(
      source === 'camera' ? 'Camera permission denied' : 'Photo library permission denied',
    );
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });

  if (result.canceled) {
    return null;
  }
  return result.assets[0].uri;
}

export function usePhotoVerification({ taskId, playerId, runId, token }: Options) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const submit = useCallback(
    async (source: Source): Promise<Verification | null> => {
      setError(null);
      setVerification(null);
      try {
        const uri = await pickPhoto(source);
        if (!uri) {
          return null;
        }
        setPhotoUri(uri);
        setVerifying(true);
        const result = await verifyTaskPhoto({
          taskId,
          photoUri: uri,
          playerId,
          runId,
          token,
        });
        setVerification(result);
        return result;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Verification failed');
        return null;
      } finally {
        setVerifying(false);
      }
    },
    [playerId, runId, taskId, token],
  );

  return { photoUri, verification, error, verifying, submit };
}
