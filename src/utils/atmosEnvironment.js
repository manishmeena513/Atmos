import { getWmoInfo } from './wmoCodeMap.js';

/**
 * Atmos V3.1 Centralized Atmospheric Environment Engine
 *
 * Single Source of Truth for:
 * - Live Diurnal Solar Atmosphere (Dawn, Morning, Midday, Afternoon, Sunset, Dusk, Night)
 * - Condition-Driven Weather Physics (Clear, Cloudy, Rain, Snow, Fog, Thunderstorm)
 * - Stylistic Theme Presets (Reactive, Classic, Midnight, AMOLED, Sunset, Ocean, etc.)
 * - Multi-Strength Physical Liquid Glass (Hero, Card, Pill, Navigation, Modal)
 * - Real-Time CSS Custom Properties for immediate DOM reactivity
 */

export const THEME_PRESETS = [
  {
    id: 'reactive',
    name: 'Weather Reactive',
    description: 'Dynamically adapts sky, light, and atmosphere to live local weather',
    accent: '#38BDF8',
    glow: '#0284C7',
    bg: '#080E1A',
    skyTop: '#0B3B60',
    skyMid: '#1D6FA5',
    skyBottom: '#4FACFE',
  },
  {
    id: 'classic',
    name: 'Classic Atmos',
    description: 'Deep twilight with electric cyan & sky blue accents',
    accent: '#38BDF8',
    glow: '#0284C7',
    bg: '#080E1A',
    skyTop: '#070D18',
    skyMid: '#0D182B',
    skyBottom: '#162842',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Inky sapphire obsidian with starfield blue highlights',
    accent: '#818CF8',
    glow: '#4F46E5',
    bg: '#040612',
    skyTop: '#030511',
    skyMid: '#070C22',
    skyBottom: '#11183C',
  },
  {
    id: 'amoled',
    name: 'AMOLED',
    description: 'True deep black #000000 surfaces for maximum OLED contrast',
    accent: '#38BDF8',
    glow: '#0EA5E9',
    bg: '#000000',
    skyTop: '#000000',
    skyMid: '#000000',
    skyBottom: '#020202',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Golden hour amber, twilight violet, and coral reflections',
    accent: '#F97316',
    glow: '#EA580C',
    bg: '#140C1A',
    skyTop: '#161022',
    skyMid: '#421634',
    skyBottom: '#9A3412',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep marine cyan, turquoise, and aquamarine depths',
    accent: '#2DD4BF',
    glow: '#0D9488',
    bg: '#031319',
    skyTop: '#021117',
    skyMid: '#05232C',
    skyBottom: '#0C4856',
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    description: 'Forest emerald, boreal spruce, and fresh mountain mist',
    accent: '#34D399',
    glow: '#059669',
    bg: '#04130C',
    skyTop: '#03120B',
    skyMid: '#082619',
    skyBottom: '#0E3F2C',
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Crisp ice blue, frosted silver, and glacial highlights',
    accent: '#A5F3FC',
    glow: '#0891B2',
    bg: '#06121C',
    skyTop: '#05101A',
    skyMid: '#0A2032',
    skyBottom: '#14354C',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Ethereal northern borealis with magenta, violet, and jade glow',
    accent: '#C084FC',
    glow: '#9333EA',
    bg: '#08061C',
    skyTop: '#07051A',
    skyMid: '#1A0C32',
    skyBottom: '#093029',
  },
  {
    id: 'minimal_mono',
    name: 'Minimal Mono',
    description: 'Architectural charcoal, stark monochromatic contrast',
    accent: '#FFFFFF',
    glow: '#71717A',
    bg: '#08090A',
    skyTop: '#07080A',
    skyMid: '#101215',
    skyBottom: '#1A1C20',
  },
];

export const FONTS = [
  { id: 'atmos', name: 'Atmos (Jakarta)', family: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { id: 'modern', name: 'Modern (Outfit)', family: "'Outfit', 'Plus Jakarta Sans', sans-serif" },
  { id: 'rounded', name: 'Rounded (Nunito)', family: "'Nunito', sans-serif" },
  { id: 'compact', name: 'Compact (Space)', family: "'Space Grotesk', sans-serif" },
  { id: 'mono', name: 'Mono (JetBrains)', family: "'JetBrains Mono', monospace" },
];

/**
 * Parses local solar hours directly from Open-Meteo local ISO string e.g. "2026-10-08T06:14"
 */
function parseSolarHour(str, defaultHour) {
  if (typeof str === 'string' && str.includes('T')) {
    const timePart = str.split('T')[1];
    const [h, m] = timePart.split(':').map(Number);
    if (!isNaN(h)) return h + (isNaN(m) ? 0 : m / 60);
  }
  return defaultHour;
}

/**
 * Calculates relative luminance for accessible text contrast.
 */
function getLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0.1;
  const clean = hex.replace('#', '');
  if (clean.length < 6) return 0.1;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Master Environment Engine
 */
export function calculateAtmosEnvironment({
  weather = null,
  selectedHour = null,
  themePreset = 'reactive',
  themeMode = 'dark',
  customColors = {},
  glassSettings = {},
  typography = {},
  effects = {},
}) {
  const current = weather?.current || null;
  const daily = weather?.daily || null;

  // 1. Time & Solar Position Calculation
  const now = new Date();
  const currentHour = selectedHour !== null ? selectedHour : now.getHours();
  const sunriseH = parseSolarHour(daily?.sunrise?.[0], 6);
  const sunsetH = parseSolarHour(daily?.sunset?.[0], 18);

  // Weather code resolution (supporting timeline scrubbing)
  let weatherCode = current?.weather_code ?? 0;
  if (selectedHour !== null && weather?.hourly?.weather_code) {
    weatherCode = weather.hourly.weather_code[selectedHour] ?? weatherCode;
  }
  const wmo = getWmoInfo(weatherCode);
  const category = wmo.category; // clear, partly_cloudy, cloudy, fog, rain, heavy_rain, snow, thunderstorm

  // Solar phase classification
  let phase = 'midday';
  if (currentHour < sunriseH - 1 || currentHour > sunsetH + 1.8) {
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

  // Solar progress across the sky (0 to 1)
  let solarProgress = 0.5;
  if (currentHour >= sunriseH && currentHour <= sunsetH) {
    solarProgress = (currentHour - sunriseH) / (sunsetH - sunriseH);
  }

  // 2. Base Diurnal Atmospheric Palettes
  const diurnalPalettes = {
    dawn: {
      skyTop: '#13182B',
      skyMid: '#3B2345',
      skyBottom: '#B85D68',
      ambientLight: 0.65,
      solarAura: 'rgba(244, 114, 182, 0.45)',
      sunColor: '#FB7185',
      sunGlow: 'rgba(251, 113, 133, 0.4)',
      sunVisible: true,
      moonVisible: false,
      starsVisible: false,
      cloudColor: 'rgba(160, 110, 140, 0.4)',
      accent: '#F472B6',
      specularTone: 'rgba(244, 114, 182, 0.22)',
    },
    morning: {
      skyTop: '#0E2A47',
      skyMid: '#1E537D',
      skyBottom: '#60A5FA',
      ambientLight: 0.88,
      solarAura: 'rgba(254, 240, 138, 0.35)',
      sunColor: '#FDE047',
      sunGlow: 'rgba(253, 224, 71, 0.35)',
      sunVisible: true,
      moonVisible: false,
      starsVisible: false,
      cloudColor: 'rgba(255, 255, 255, 0.35)',
      accent: '#38BDF8',
      specularTone: 'rgba(255, 255, 255, 0.22)',
    },
    midday: {
      skyTop: '#0B3B60',
      skyMid: '#1D6FA5',
      skyBottom: '#4FACFE',
      ambientLight: 1.0,
      solarAura: 'rgba(255, 255, 255, 0.4)',
      sunColor: '#FEF08A',
      sunGlow: 'rgba(254, 240, 138, 0.45)',
      sunVisible: true,
      moonVisible: false,
      starsVisible: false,
      cloudColor: 'rgba(255, 255, 255, 0.45)',
      accent: '#38BDF8',
      specularTone: 'rgba(255, 255, 255, 0.25)',
    },
    afternoon: {
      skyTop: '#112E4F',
      skyMid: '#1D5786',
      skyBottom: '#3B82F6',
      ambientLight: 0.92,
      solarAura: 'rgba(254, 240, 138, 0.35)',
      sunColor: '#FDE047',
      sunGlow: 'rgba(253, 224, 71, 0.3)',
      sunVisible: true,
      moonVisible: false,
      starsVisible: false,
      cloudColor: 'rgba(255, 255, 255, 0.35)',
      accent: '#60A5FA',
      specularTone: 'rgba(255, 255, 255, 0.22)',
    },
    sunset: {
      skyTop: '#17142A',
      skyMid: '#4A1D43',
      skyBottom: '#C2410C',
      ambientLight: 0.72,
      solarAura: 'rgba(251, 146, 60, 0.55)',
      sunColor: '#EA580C',
      sunGlow: 'rgba(234, 88, 12, 0.5)',
      sunVisible: true,
      moonVisible: false,
      starsVisible: false,
      cloudColor: 'rgba(194, 65, 12, 0.45)',
      accent: '#FB923C',
      specularTone: 'rgba(251, 146, 60, 0.28)',
    },
    dusk: {
      skyTop: '#0B0E1B',
      skyMid: '#1B1834',
      skyBottom: '#312044',
      ambientLight: 0.45,
      solarAura: 'rgba(167, 139, 250, 0.25)',
      sunColor: '#C084FC',
      sunGlow: 'rgba(192, 132, 252, 0.25)',
      sunVisible: false,
      moonVisible: true,
      starsVisible: true,
      cloudColor: 'rgba(49, 32, 68, 0.45)',
      accent: '#A78BFA',
      specularTone: 'rgba(192, 132, 252, 0.20)',
    },
    night: {
      skyTop: '#03060D',
      skyMid: '#070E1C',
      skyBottom: '#0D172A',
      ambientLight: 0.25,
      solarAura: 'rgba(96, 165, 250, 0.1)',
      sunColor: '#FFFFFF',
      sunGlow: 'rgba(255, 255, 255, 0.15)',
      sunVisible: false,
      moonVisible: true,
      starsVisible: true,
      cloudColor: 'rgba(15, 25, 45, 0.4)',
      accent: '#60A5FA',
      specularTone: 'rgba(224, 231, 255, 0.16)',
    },
  };

  const baseAtmosphere = diurnalPalettes[phase] || diurnalPalettes.midday;
  let atmosphere = { ...baseAtmosphere, phase, category, label: wmo.label, solarProgress };

  // 3. Condition-driven atmospheric dynamics (Rain, Snow, Fog, Thunderstorm)
  atmosphere.hasLightning = false;
  atmosphere.particles = { type: 'none', density: 0, speed: 1 };
  atmosphere.clouds = { density: 0.2, speed: 0.5 };

  if (category === 'thunderstorm') {
    atmosphere.skyTop = '#05080E';
    atmosphere.skyMid = '#0C1220';
    atmosphere.skyBottom = '#141D2E';
    atmosphere.ambientLight = Math.min(atmosphere.ambientLight, 0.35);
    atmosphere.cloudColor = 'rgba(14, 20, 34, 0.85)';
    atmosphere.accent = '#818CF8';
    atmosphere.specularTone = 'rgba(129, 140, 248, 0.24)';
    atmosphere.sunVisible = false;
    atmosphere.starsVisible = false;
    atmosphere.particles = { type: 'rain', density: 1.0, speed: 1.4 };
    atmosphere.clouds = { density: 1.0, speed: 1.5 };
    atmosphere.hasLightning = true;
  } else if (category === 'heavy_rain') {
    atmosphere.skyTop = '#060B14';
    atmosphere.skyMid = '#0F1A2A';
    atmosphere.skyBottom = '#1A2A3C';
    atmosphere.ambientLight = Math.min(atmosphere.ambientLight, 0.45);
    atmosphere.cloudColor = 'rgba(20, 32, 48, 0.78)';
    atmosphere.accent = '#38BDF8';
    atmosphere.specularTone = 'rgba(56, 189, 248, 0.20)';
    atmosphere.sunVisible = false;
    atmosphere.starsVisible = false;
    atmosphere.particles = { type: 'rain', density: 0.85, speed: 1.2 };
    atmosphere.clouds = { density: 0.9, speed: 1.2 };
  } else if (category === 'rain') {
    atmosphere.skyTop = '#08101A';
    atmosphere.skyMid = '#122030';
    atmosphere.skyBottom = '#1F3448';
    atmosphere.ambientLight = Math.min(atmosphere.ambientLight, 0.55);
    atmosphere.cloudColor = 'rgba(28, 42, 60, 0.65)';
    atmosphere.accent = '#60A5FA';
    atmosphere.specularTone = 'rgba(186, 230, 253, 0.20)';
    atmosphere.sunVisible = false;
    atmosphere.starsVisible = false;
    atmosphere.particles = { type: 'rain', density: 0.55, speed: 1.0 };
    atmosphere.clouds = { density: 0.8, speed: 0.9 };
  } else if (category === 'snow') {
    atmosphere.skyTop = '#0A1420';
    atmosphere.skyMid = '#16283D';
    atmosphere.skyBottom = '#2C4664';
    atmosphere.ambientLight = Math.min(atmosphere.ambientLight, 0.75);
    atmosphere.cloudColor = 'rgba(200, 220, 240, 0.35)';
    atmosphere.accent = '#BAE6FD';
    atmosphere.specularTone = 'rgba(240, 249, 255, 0.28)';
    atmosphere.particles = { type: 'snow', density: 0.65, speed: 0.7 };
    atmosphere.clouds = { density: 0.75, speed: 0.6 };
  } else if (category === 'fog') {
    atmosphere.skyTop = '#101722';
    atmosphere.skyMid = '#1C2836';
    atmosphere.skyBottom = '#2E3D4D';
    atmosphere.ambientLight = Math.min(atmosphere.ambientLight, 0.55);
    atmosphere.cloudColor = 'rgba(156, 163, 175, 0.45)';
    atmosphere.accent = '#9CA3AF';
    atmosphere.specularTone = 'rgba(209, 213, 219, 0.18)';
    atmosphere.sunVisible = false;
    atmosphere.starsVisible = false;
    atmosphere.particles = { type: 'fog', density: 0.7, speed: 0.4 };
    atmosphere.clouds = { density: 0.95, speed: 0.3 };
  } else if (category === 'cloudy') {
    atmosphere.skyTop = '#0B1524';
    atmosphere.skyMid = '#19283D';
    atmosphere.skyBottom = '#293D56';
    atmosphere.ambientLight = Math.min(atmosphere.ambientLight, 0.7);
    atmosphere.cloudColor = 'rgba(255, 255, 255, 0.3)';
    atmosphere.accent = '#94A3B8';
    atmosphere.sunVisible = false;
    atmosphere.starsVisible = false;
    atmosphere.clouds = { density: 0.85, speed: 0.7 };
  } else if (category === 'partly_cloudy') {
    atmosphere.clouds = { density: 0.45, speed: 0.6 };
  } else {
    // Clear
    atmosphere.clouds = { density: 0.15, speed: 0.4 };
  }

  // 4. Stylistic Theme Preset & Mode Overrides
  const preset = THEME_PRESETS.find((p) => p.id === themePreset) || THEME_PRESETS[0];

  let effectiveSkyTop = atmosphere.skyTop;
  let effectiveSkyMid = atmosphere.skyMid;
  let effectiveSkyBottom = atmosphere.skyBottom;
  let effectiveBg = atmosphere.skyTop;
  let effectiveAccent = customColors?.accent || atmosphere.accent;
  let effectiveGlow = customColors?.glow || atmosphere.accent;

  // When user picks a specific aesthetic preset other than reactive, adapt the sky palette while keeping weather particles
  if (themePreset !== 'reactive') {
    effectiveSkyTop = preset.skyTop;
    effectiveSkyMid = preset.skyMid;
    effectiveSkyBottom = preset.skyBottom;
    effectiveBg = preset.bg;
    effectiveAccent = customColors?.accent || preset.accent;
    effectiveGlow = customColors?.glow || preset.glow;
  }

  // Mode overrides
  if (themeMode === 'amoled' || themePreset === 'amoled') {
    effectiveBg = '#000000';
    effectiveSkyTop = '#000000';
    effectiveSkyMid = '#000000';
    effectiveSkyBottom = '#020202';
  } else if (themeMode === 'light') {
    effectiveBg = '#F8FAFC';
    effectiveSkyTop = '#CBD5E1';
    effectiveSkyMid = '#93C5FD';
    effectiveSkyBottom = '#60A5FA';
  }

  // 5. Accessible Contrast Resolution
  const bgLuminance = getLuminance(effectiveBg);
  const isDark = bgLuminance < 0.25;
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#475569';

  // 6. Liquid Glass Multi-Strength Material System
  // Resolution of user sliders
  let blurPx = 20;
  if (glassSettings.level === 'off') blurPx = 0;
  else if (typeof glassSettings.blur === 'number') blurPx = glassSettings.blur;
  else if (glassSettings.level === 'soft') blurPx = 12;
  else if (glassSettings.level === 'strong') blurPx = 28;

  let baseAlpha = 0.10;
  if (glassSettings.level === 'off') baseAlpha = 0.94;
  else if (typeof glassSettings.opacity === 'number') baseAlpha = Math.max(0.04, Math.min(0.40, glassSettings.opacity / 100));
  else if (glassSettings.level === 'soft') baseAlpha = 0.06;
  else if (glassSettings.level === 'strong') baseAlpha = 0.16;

  if (themeMode === 'amoled' || themePreset === 'amoled') {
    baseAlpha = Math.min(baseAlpha, 0.05);
  }

  // Environmental Tint composite
  let tintColor = 'transparent';
  if (glassSettings.tint === 'cool') tintColor = 'rgba(56, 189, 248, 0.07)';
  else if (glassSettings.tint === 'warm') tintColor = 'rgba(251, 146, 60, 0.07)';
  else if (glassSettings.tint === 'custom' && customColors.glassTint) tintColor = customColors.glassTint;

  // Specular rim reflection (environmentally influenced)
  let specularColor = atmosphere.specularTone || 'rgba(255, 255, 255, 0.16)';
  if (glassSettings.border === 'off') specularColor = 'rgba(255, 255, 255, 0.04)';
  else if (glassSettings.border === 'bright') specularColor = 'rgba(255, 255, 255, 0.32)';

  // Border
  let borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
  if (glassSettings.border === 'off') borderColor = 'transparent';
  else if (glassSettings.border === 'bright') borderColor = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.28)';

  // Shadow
  let shadowVal = '0 8px 32px 0 rgba(0, 0, 0, 0.32)';
  if (glassSettings.shadow === 'off') shadowVal = 'none';
  else if (glassSettings.shadow === 'soft') shadowVal = '0 4px 20px 0 rgba(0, 0, 0, 0.22)';
  else if (glassSettings.shadow === 'deep') shadowVal = '0 16px 48px 0 rgba(0, 0, 0, 0.52)';

  // Multi-Strength Surface Alpha Variants
  const makeSurface = (alpha) => {
    const whiteSurface = isDark
      ? `rgba(255, 255, 255, ${alpha})`
      : `rgba(255, 255, 255, ${Math.max(0.65, 1 - alpha * 1.5)})`;
    return tintColor !== 'transparent'
      ? `linear-gradient(0deg, ${tintColor}, ${tintColor}), ${whiteSurface}`
      : whiteSurface;
  };

  const glassSurfaces = {
    hero: makeSurface(Math.max(0.04, baseAlpha * 0.75)),
    card: makeSurface(baseAlpha),
    pill: makeSurface(Math.min(0.24, baseAlpha * 1.25)),
    nav: makeSurface(Math.min(0.28, baseAlpha * 1.4)),
    modal: makeSurface(Math.min(0.35, baseAlpha * 1.6)),
  };

  // 7. Typography
  const fontObj = FONTS.find((f) => f.id === typography.font) || FONTS[0];
  let textScale = 1.0;
  if (typography.scale === 'small') textScale = 0.92;
  else if (typography.scale === 'large') textScale = 1.08;

  // 8. Performance & Effects
  let effectsFactor = 1.0;
  if (effects.intensity === 'off' || effects.performanceMode === 'battery') effectsFactor = 0.0;
  else if (effects.intensity === 'subtle') effectsFactor = 0.6;
  else if (effects.intensity === 'cinematic') effectsFactor = 1.3;

  // 9. Prepare CSS Variables Dictionary
  const cssVariables = {
    '--atmos-bg': effectiveBg,
    '--atmos-sky-top': effectiveSkyTop,
    '--atmos-sky-mid': effectiveSkyMid,
    '--atmos-sky-bottom': effectiveSkyBottom,
    '--atmos-solar-aura': atmosphere.solarAura,
    '--atmos-ambient-light': String(atmosphere.ambientLight),
    '--atmos-surface': glassSurfaces.card,
    '--atmos-surface-hero': glassSurfaces.hero,
    '--atmos-surface-pill': glassSurfaces.pill,
    '--atmos-surface-nav': glassSurfaces.nav,
    '--atmos-surface-modal': glassSurfaces.modal,
    '--atmos-glass-blur': `${blurPx}px`,
    '--atmos-glass-opacity': String(baseAlpha),
    '--atmos-glass-tint': tintColor,
    '--atmos-glass-specular': specularColor,
    '--atmos-glass-shadow': shadowVal,
    '--atmos-border': borderColor,
    '--atmos-accent': effectiveAccent,
    '--atmos-glow': effectiveGlow,
    '--atmos-text': textColor,
    '--atmos-text-muted': textMuted,
    '--atmos-font-family': fontObj.family,
    '--atmos-text-scale': String(textScale),
    // Backward compatibility
    '--bg-primary': effectiveBg,
    '--accent-primary': effectiveAccent,
    '--text-primary': textColor,
  };

  return {
    phase,
    category,
    label: wmo.label,
    solarProgress,
    skyTop: effectiveSkyTop,
    skyMid: effectiveSkyMid,
    skyBottom: effectiveSkyBottom,
    bg: effectiveBg,
    accent: effectiveAccent,
    glow: effectiveGlow,
    ambientLight: atmosphere.ambientLight,
    solarAura: atmosphere.solarAura,
    sunColor: atmosphere.sunColor,
    sunGlow: atmosphere.sunGlow,
    sunVisible: atmosphere.sunVisible,
    moonVisible: atmosphere.moonVisible,
    starsVisible: atmosphere.starsVisible,
    cloudColor: atmosphere.cloudColor,
    clouds: atmosphere.clouds,
    particles: atmosphere.particles,
    hasLightning: atmosphere.hasLightning,
    specularTone: atmosphere.specularTone,
    glassSurfaces,
    blurPx,
    baseAlpha,
    tintColor,
    borderColor,
    specularColor,
    shadowVal,
    fontObj,
    textScale,
    effectsFactor,
    isDark,
    cssVariables,
  };
}
