import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function useCurrentLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const request = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Location permission denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { coordinates, error, loading, retry: request };
}
