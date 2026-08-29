import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { MAPBOX_TOKEN } from '../constants/config';
import type { Coordinates } from '../hooks/use-current-location';
import MapboxWebViewMap from './mapbox-webview-map';

// @rnmapbox/maps (mapbox-native-map.tsx) is a native module - it needs a
// custom dev client/EAS build, and Metro's default bundler resolves every
// static import even behind lazy()/dynamic import() (no real code-splitting
// without extra config), so merely importing it here breaks the bundle for
// everyone, including plain Expo Go. Use the WebView map unconditionally
// until there's a custom dev client to gate the native path behind.

type LiveMapProps = {
  center: Coordinates;
  opponent?: Coordinates | null;
};

// Shared by the setup, run and match screens: the player's live position on
// Mapbox, plus the opponent's marker during a multiplayer match.
export default function LiveMap({ center, opponent = null }: LiveMapProps) {
  if (!MAPBOX_TOKEN) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Missing EXPO_PUBLIC_MAPBOX_TOKEN — add it to frontend/.env
        </Text>
      </View>
    );
  }

  return <MapboxWebViewMap center={center} opponent={opponent} />;
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
});
