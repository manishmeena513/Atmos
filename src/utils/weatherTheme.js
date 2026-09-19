import { getWmoInfo } from './wmoCodeMap';

/**
 * Atmosphere Theme Engine
 * Calculates dynamic sky gradients, particle parameters, and lighting
 * based on live WMO weather code, day/night state, and solar progression.
 */

export function getAtmosphereTheme(weatherCode = 0, isDay = 1, currentHour = 12, sunriseStr = null, sunsetStr = null) {
  const wmo = getWmoInfo(weatherCode);
  const category = wmo.category; // clear, partly_cloudy, cloudy, fog, rain, heavy_rain, snow, thunderstorm

  // Parse sunrise / sunset hours if available
  let sunriseH = 6;
  let sunsetH = 18;
  if (sunriseStr) {
    const sDate = new Date(sunriseStr);
    if (!isNaN(sDate.getTime())) sunriseH = sDate.getHours() + sDate.getMinutes() / 60;
  }
  if (sunsetStr) {
    const sDate = new Date(sunsetStr);
    if (!isNaN(sDate.getTime())) sunsetH = sDate.getHours() + sDate.getMinutes() / 60;
  }

  // Determine time phase
  let phase = 'day';
  if (currentHour < sunriseH - 1 || currentHour > sunsetH + 1.5) {
    phase = 'night';
  } else if (currentHour >= sunriseH - 1 && currentHour <= sunriseH + 1) {
    phase = 'dawn';
  } else if (currentHour >= sunsetH - 1.2 && currentHour <= sunsetH + 0.8) {
    phase = 'sunset';
  } else if (currentHour > sunsetH + 0.8 && currentHour <= sunsetH + 1.8) {
    phase = 'dusk';
  } else if (currentHour >= sunriseH + 1 && currentHour < 11.5) {
    phase = 'morning';
  } else if (currentHour >= 11.5 && currentHour <= 15) {
    phase = 'midday';
  } else {
    phase = 'afternoon';
  }

  // Base sky palettes for time phases
  const skyPalettes = {
    night: {
      skyTop: '#04070D',
      skyMid: '#0A111F',
      skyBottom: '#0D1627',
      ambientLight: 0.25,
      cloudColor: 'rgba(20, 28, 45, 0.4)',
      accent: '#60A5FA',
      starsVisible: true,
      sunVisible: false,
      moonVisible: true,
    },
    dawn: {
      skyTop: '#141829',
      skyMid: '#2B2342',
      skyBottom: '#6B424A',
      ambientLight: 0.6,
      cloudColor: 'rgba(100, 75, 95, 0.45)',
      accent: '#F472B6',
      starsVisible: false,
      sunVisible: true,
      moonVisible: false,
    },
    morning: {
      skyTop: '#0C2340',
      skyMid: '#1E4976',
      skyBottom: '#3B82F6',
      ambientLight: 0.85,
      cloudColor: 'rgba(255, 255, 255, 0.35)',
      accent: '#38BDF8',
      starsVisible: false,
      sunVisible: true,
      moonVisible: false,
    },
    midday: {
      skyTop: '#0F2C59',
      skyMid: '#1D4ED8',
      skyBottom: '#38BDF8',
      ambientLight: 1.0,
      cloudColor: 'rgba(255, 255, 255, 0.4)',
      accent: '#38BDF8',
      starsVisible: false,
      sunVisible: true,
      moonVisible: false,
    },
    afternoon: {
      skyTop: '#112240',
      skyMid: '#1E3A8A',
      skyBottom: '#2563EB',
      ambientLight: 0.9,
      cloudColor: 'rgba(255, 255, 255, 0.35)',
      accent: '#60A5FA',
      starsVisible: false,
      sunVisible: true,
      moonVisible: false,
    },
    sunset: {
      skyTop: '#181528',
      skyMid: '#4C1D42',
      skyBottom: '#B45309',
      ambientLight: 0.7,
      cloudColor: 'rgba(180, 83, 9, 0.4)',
      accent: '#FB923C',
      starsVisible: false,
      sunVisible: true,
      moonVisible: false,
    },
    dusk: {
      skyTop: '#0A0E1A',
      skyMid: '#1E1B33',
      skyBottom: '#2A1F3D',
      ambientLight: 0.4,
      cloudColor: 'rgba(40, 30, 60, 0.4)',
      accent: '#A78BFA',
      starsVisible: true,
      sunVisible: false,
      moonVisible: true,
    },
  };

  // Select base palette
  const base = skyPalettes[phase] || skyPalettes.midday;
  const theme = { ...base, phase, category, label: wmo.label };

  // Weather condition modifications
  if (category === 'thunderstorm') {
    theme.skyTop = '#06080F';
    theme.skyMid = '#0F1322';
    theme.skyBottom = '#181F33';
    theme.ambientLight = Math.min(theme.ambientLight, 0.35);
    theme.cloudColor = 'rgba(15, 20, 35, 0.85)';
    theme.accent = '#818CF8';
    theme.sunVisible = false;
    theme.starsVisible = false;
    theme.particles = { type: 'rain', density: 1.0, speed: 1.3 };
    theme.clouds = { density: 1.0, speed: 1.6 };
    theme.hasLightning = true;
  } else if (category === 'heavy_rain') {
    theme.skyTop = '#070C16';
    theme.skyMid = '#111C2E';
    theme.skyBottom = '#1A2942';
    theme.ambientLight = Math.min(theme.ambientLight, 0.45);
    theme.cloudColor = 'rgba(22, 33, 50, 0.75)';
    theme.accent = '#38BDF8';
    theme.sunVisible = false;
    theme.starsVisible = false;
    theme.particles = { type: 'rain', density: 0.8, speed: 1.2 };
    theme.clouds = { density: 0.9, speed: 1.2 };
    theme.hasLightning = false;
  } else if (category === 'rain') {
    theme.skyTop = '#091120';
    theme.skyMid = '#16233B';
    theme.skyBottom = '#243754';
    theme.ambientLight = Math.min(theme.ambientLight, 0.6);
    theme.cloudColor = 'rgba(30, 45, 68, 0.65)';
    theme.accent = '#60A5FA';
    theme.sunVisible = false;
    theme.starsVisible = false;
    theme.particles = { type: 'rain', density: 0.5, speed: 0.9 };
    theme.clouds = { density: 0.8, speed: 0.9 };
    theme.hasLightning = false;
  } else if (category === 'snow') {
    theme.skyTop = '#0B1320';
    theme.skyMid = '#1C2D44';
    theme.skyBottom = '#2E4461';
    theme.ambientLight = Math.min(theme.ambientLight, 0.75);
    theme.cloudColor = 'rgba(200, 215, 235, 0.3)';
    theme.accent = '#BAE6FD';
    theme.particles = { type: 'snow', density: 0.6, speed: 0.7 };
    theme.clouds = { density: 0.7, speed: 0.6 };
    theme.hasLightning = false;
  } else if (category === 'fog') {
    theme.skyTop = '#111827';
    theme.skyMid = '#1F2937';
    theme.skyBottom = '#374151';
    theme.ambientLight = Math.min(theme.ambientLight, 0.5);
    theme.cloudColor = 'rgba(156, 163, 175, 0.4)';
    theme.accent = '#9CA3AF';
    theme.sunVisible = false;
    theme.starsVisible = false;
    theme.particles = { type: 'fog', density: 0.7, speed: 0.4 };
    theme.clouds = { density: 0.95, speed: 0.3 };
    theme.hasLightning = false;
  } else if (category === 'cloudy') {
    theme.skyTop = '#0C1626';
    theme.skyMid = '#1B2C46';
    theme.skyBottom = '#2C4263';
    theme.ambientLight = Math.min(theme.ambientLight, 0.7);
    theme.cloudColor = 'rgba(255, 255, 255, 0.25)';
    theme.accent = '#94A3B8';
    theme.sunVisible = false;
    theme.starsVisible = false;
    theme.particles = { type: 'none' };
    theme.clouds = { density: 0.85, speed: 0.7 };
    theme.hasLightning = false;
  } else if (category === 'partly_cloudy') {
    theme.particles = { type: 'none' };
    theme.clouds = { density: 0.45, speed: 0.6 };
    theme.hasLightning = false;
  } else {
    // Clear
    theme.particles = { type: 'none' };
    theme.clouds = { density: 0.15, speed: 0.4 };
    theme.hasLightning = false;
  }

  // Calculate sun altitude angle (0 to 180 degrees)
  let solarProgress = 0.5;
  if (currentHour >= sunriseH && currentHour <= sunsetH) {
    solarProgress = (currentHour - sunriseH) / (sunsetH - sunriseH);
  }
  theme.solarProgress = solarProgress;

  return theme;
}
