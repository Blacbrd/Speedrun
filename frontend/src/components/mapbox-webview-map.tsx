import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { MAPBOX_TOKEN } from '../constants/config';
import type { Coordinates } from '../hooks/use-current-location';

type MapboxWebViewMapProps = {
  center: Coordinates;
  zoom?: number;
};

const MAPBOX_GL_VERSION = 'v3.9.0';

function html(center: Coordinates, zoom: number): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
    <link href="https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.css" rel="stylesheet" />
    <script src="https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.js"></script>
    <style>
      html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      mapboxgl.accessToken = ${JSON.stringify(MAPBOX_TOKEN)};
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [${center.longitude}, ${center.latitude}],
        zoom: ${zoom},
      });
      new mapboxgl.Marker().setLngLat([${center.longitude}, ${center.latitude}]).addTo(map);
    </script>
  </body>
</html>`;
}

// Mapbox GL JS in a WebView: the only Mapbox renderer that runs inside Expo Go,
// which has no @rnmapbox/maps native module. Native builds use MapboxNativeMap.
export default function MapboxWebViewMap({ center, zoom = 15 }: MapboxWebViewMapProps) {
  return (
    <WebView
      style={styles.map}
      originWhitelist={['*']}
      source={{ html: html(center, zoom), baseUrl: 'https://localhost' }}
      javaScriptEnabled
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
