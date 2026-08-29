import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

// `enabled` defers the permission prompt until the caller is ready to show a map.
// `watch` keeps the fix updating, which matches need so the opponent sees movement.
export function useCurrentLocation(enabled = true, watch = false) {
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
    if (enabled) {
      request();
    }
  }, [enabled, request]);

  useEffect(() => {
    if (!enabled || !watch || !coordinates) {
      return;
    }

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
    )
      .then((handle) => {
        if (cancelled) {
          handle.remove();
          return;
        }
        subscription = handle;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      subscription?.remove();
    };
    // Only the first fix arms the watcher; later updates come from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, watch, coordinates !== null]);

  return { coordinates, error, loading, retry: request };
}
