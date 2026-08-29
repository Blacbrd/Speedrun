import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import type { Coordinates } from '../hooks/use-current-location';

type MapboxNativeMapProps = {
  center: Coordinates;
  zoom?: number;
};

// The app targets iOS; @rnmapbox/maps' web entry pulls in mapbox-gl, which is
// not a dependency here. This keeps the web bundle building.
export default function MapboxNativeMap({ center }: MapboxNativeMapProps) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>
        Map is native-only. Location: {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  text: {
    color: colors.text,
  },
});
