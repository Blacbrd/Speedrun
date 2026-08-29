import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { MAPBOX_TOKEN } from '../constants/config';
import type { Coordinates } from '../hooks/use-current-location';

type MapboxWebViewMapProps = {
  center: Coordinates;
  opponent?: Coordinates | null;
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
      const me = new mapboxgl.Marker().setLngLat([${center.longitude}, ${center.latitude}]).addTo(map);
      let opponent = null;

      // Markers move through these hooks instead of re-rendering the page, so
      // position updates never re-download map tiles.
      window.setSelf = function (longitude, latitude) {
        me.setLngLat([longitude, latitude]);
      };
      window.setOpponent = function (longitude, latitude) {
        if (longitude === null || latitude === null) {
          if (opponent) { opponent.remove(); opponent = null; }
          return;
        }
        if (!opponent) {
          opponent = new mapboxgl.Marker({ color: '#ff3b3b' }).setLngLat([longitude, latitude]).addTo(map);
          opponent.setPopup(new mapboxgl.Popup({ closeButton: false }).setText('Opponent'));
          return;
        }
        opponent.setLngLat([longitude, latitude]);
      };
    </script>
  </body>
</html>`;
}

// Mapbox GL JS in a WebView: the only Mapbox renderer that runs inside Expo Go,
// which has no @rnmapbox/maps native module. Native builds use MapboxNativeMap.
export default function MapboxWebViewMap({ center, opponent = null, zoom = 15 }: MapboxWebViewMapProps) {
  const webview = useRef<WebView>(null);
  // The page is built once from the first fix; later positions are injected.
  const source = useRef({ html: html(center, zoom), baseUrl: 'https://localhost' });

  useEffect(() => {
    webview.current?.injectJavaScript(
      `window.setSelf && window.setSelf(${center.longitude}, ${center.latitude}); true;`,
    );
  }, [center.latitude, center.longitude]);

  const opponentLatitude = opponent?.latitude ?? null;
  const opponentLongitude = opponent?.longitude ?? null;

  useEffect(() => {
    const args =
      opponentLatitude === null || opponentLongitude === null
        ? 'null, null'
        : `${opponentLongitude}, ${opponentLatitude}`;
    webview.current?.injectJavaScript(`window.setOpponent && window.setOpponent(${args}); true;`);
  }, [opponentLatitude, opponentLongitude]);

  return (
    <WebView
      ref={webview}
      style={styles.map}
      originWhitelist={['*']}
      source={source.current}
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
