import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import { StyleSheet } from 'react-native';

import { MAPBOX_TOKEN } from '../constants/config';
import type { Coordinates } from '../hooks/use-current-location';

Mapbox.setAccessToken(MAPBOX_TOKEN);

type MapboxNativeMapProps = {
  center: Coordinates;
  zoom?: number;
};

export default function MapboxNativeMap({ center, zoom = 15 }: MapboxNativeMapProps) {
  return (
    <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street} scaleBarEnabled={false}>
      <Camera
        zoomLevel={zoom}
        centerCoordinate={[center.longitude, center.latitude]}
        animationMode="none"
      />
      <LocationPuck puckBearingEnabled />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
