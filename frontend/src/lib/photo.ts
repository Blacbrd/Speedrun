import * as ImagePicker from 'expo-image-picker';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
  gif: 'image/gif',
};

// Multipart uploads need a filename + mime that match the picked asset.
export function describePhoto(uri: string): { name: string; type: string } {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const type = MIME_TYPES[extension];
  if (!type) {
    return { name: 'submission.jpg', type: 'image/jpeg' };
  }
  return { name: `submission.${extension}`, type };
}

export type PhotoSource = 'camera' | 'library';

// Returns null when the player backs out of the picker.
export async function pickPhoto(source: PhotoSource): Promise<string | null> {
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
