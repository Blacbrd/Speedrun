import Constants, { ExecutionEnvironment } from 'expo-constants';
import { lazy, Suspense } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { MAPBOX_TOKEN } from '../constants/config';
import type { Coordinates } from '../hooks/use-current-location';
import MapboxWebViewMap from './mapbox-webview-map';

// @rnmapbox/maps is a native module, so it cannot be loaded inside Expo Go.
// Lazy so its module body only runs in builds that actually contain it.
const MapboxNativeMap = lazy(() => import('./mapbox-native-map'));

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type RoomMapProps = {
  center: Coordinates;
};

export default function RoomMap({ center }: RoomMapProps) {
  if (!MAPBOX_TOKEN) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Missing EXPO_PUBLIC_MAPBOX_TOKEN — add it to frontend/.env
        </Text>
      </View>
    );
  }

  if (isExpoGo) {
    return <MapboxWebViewMap center={center} />;
  }

  return (
    <Suspense fallback={<ActivityIndicator style={styles.loader} color={colors.accent} />}>
      <MapboxNativeMap center={center} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.border,
  },
  placeholderText: {
    color: colors.text,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
  },
});
