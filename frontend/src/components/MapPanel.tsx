import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// TODO(mapbox): swap this for @rnmapbox/maps once MAPBOX_TOKEN is set in .env.
// react-native-maps (Apple/Google maps, no key needed) is a drop-in placeholder
// so this panel already shows a real live-location map today.
let MapView: any;
let Marker: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch {
  MapView = null;
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Props = {
  /** When false, skip requesting location and just show the placeholder box. */
  useLiveLocation?: boolean;
  height?: number;
};

export function MapPanel({ useLiveLocation = true, height = 260 }: Props) {
  const [region, setRegion] = useState<Region | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useLiveLocation) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, [useLiveLocation]);

  const showMap = useLiveLocation && MapView && region;

  return (
    <View style={[styles.container, { height }]}>
      {showMap ? (
        <MapView style={StyleSheet.absoluteFill} initialRegion={region} showsUserLocation>
          <Marker coordinate={region} title="You are here" />
        </MapView>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {error ?? (useLiveLocation ? 'Getting your location...' : 'Map (Mapbox goes here)')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, overflow: 'hidden' },
  placeholder: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#666' },
});
