/**
 * WMO Weather Code to Condition Mapping
 * Standard WMO 4677 code specifications used by Open-Meteo
 */

export const WMO_CONDITIONS = {
  0: { label: 'Clear Sky', category: 'clear', icon: 'Sun' },
  1: { label: 'Mainly Clear', category: 'clear', icon: 'Sun' },
  2: { label: 'Partly Cloudy', category: 'partly_cloudy', icon: 'CloudSun' },
  3: { label: 'Overcast', category: 'cloudy', icon: 'Cloud' },
  45: { label: 'Fog', category: 'fog', icon: 'CloudFog' },
  48: { label: 'Depositing Rime Fog', category: 'fog', icon: 'CloudFog' },
  51: { label: 'Light Drizzle', category: 'rain', icon: 'CloudDrizzle' },
  53: { label: 'Moderate Drizzle', category: 'rain', icon: 'CloudDrizzle' },
  55: { label: 'Dense Drizzle', category: 'rain', icon: 'CloudDrizzle' },
  56: { label: 'Light Freezing Drizzle', category: 'rain', icon: 'CloudDrizzle' },
  57: { label: 'Dense Freezing Drizzle', category: 'rain', icon: 'CloudDrizzle' },
  61: { label: 'Slight Rain', category: 'rain', icon: 'CloudRain' },
  63: { label: 'Moderate Rain', category: 'rain', icon: 'CloudRain' },
  65: { label: 'Heavy Rain', category: 'heavy_rain', icon: 'CloudRainWind' },
  66: { label: 'Light Freezing Rain', category: 'rain', icon: 'CloudRain' },
  67: { label: 'Heavy Freezing Rain', category: 'heavy_rain', icon: 'CloudRainWind' },
  71: { label: 'Slight Snow', category: 'snow', icon: 'CloudSnow' },
  73: { label: 'Moderate Snow', category: 'snow', icon: 'CloudSnow' },
  75: { label: 'Heavy Snow', category: 'snow', icon: 'Snowflake' },
  77: { label: 'Snow Grains', category: 'snow', icon: 'Snowflake' },
  80: { label: 'Slight Showers', category: 'rain', icon: 'CloudDrizzle' },
  81: { label: 'Moderate Showers', category: 'rain', icon: 'CloudRain' },
  82: { label: 'Violent Showers', category: 'heavy_rain', icon: 'CloudRainWind' },
  85: { label: 'Slight Snow Showers', category: 'snow', icon: 'CloudSnow' },
  86: { label: 'Heavy Snow Showers', category: 'snow', icon: 'Snowflake' },
  95: { label: 'Thunderstorm', category: 'thunderstorm', icon: 'CloudLightning' },
  96: { label: 'Thunderstorm with Hail', category: 'thunderstorm', icon: 'CloudLightning' },
  99: { label: 'Heavy Thunderstorm', category: 'thunderstorm', icon: 'CloudLightning' },
};

export function getWmoInfo(code) {
  return WMO_CONDITIONS[code] || {
    label: 'Atmospheric Conditions',
    category: 'partly_cloudy',
    icon: 'Cloud'
  };
}
