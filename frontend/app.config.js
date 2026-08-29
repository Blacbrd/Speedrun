// Dynamic config so the native Mapbox SDK download token (a secret) comes from
// the environment instead of being committed in app.json. The static values in
// app.json are passed in as `config`.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...config.plugins,
    [
      '@rnmapbox/maps',
      {
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN ?? '',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Speedrun uses your location to start a task run near you.',
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: 'Speedrun needs your camera to photograph scavenger-hunt tasks.',
        photosPermission: 'Speedrun needs your photos to submit scavenger-hunt tasks.',
      },
    ],
    'expo-secure-store',
  ],
});
