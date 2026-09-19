/**
 * Centralized Mapbox Configuration Utility
 * Reads VITE_MAPBOX_TOKEN strictly from environment variables without hardcoding.
 */

export function getMapboxToken() {
  return import.meta.env.VITE_MAPBOX_TOKEN || null;
}

export const MAPBOX_DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

export function getMapTileConfig(style = 'dark-v11') {
  const token = getMapboxToken();

  if (token && token.startsWith('pk.')) {
    return {
      isMapbox: true,
      url: `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 256,
      zoomOffset: -1,
    };
  }

  // Graceful fallback if token is missing
  return {
    isMapbox: false,
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileSize: 256,
    zoomOffset: 0,
  };
}
