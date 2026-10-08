import { calculateAtmosEnvironment, THEME_PRESETS, FONTS } from './atmosEnvironment.js';

export { THEME_PRESETS, FONTS, calculateAtmosEnvironment };

/**
 * Ensures text remains accessible on chosen background / surface.
 */
export function ensureAccessibleContrast(accentHex, bgHex) {
  const env = calculateAtmosEnvironment({
    customColors: { accent: accentHex, bg: bgHex },
    themePreset: 'classic',
  });
  return {
    text: env.cssVariables['--atmos-text'],
    textMuted: env.cssVariables['--atmos-text-muted'],
    border: env.cssVariables['--atmos-border'],
    surface: env.cssVariables['--atmos-surface'],
  };
}

/**
 * Applies the complete active atmospheric theme to CSS custom properties on :root
 */
export function applyThemeToDOM({
  presetId = 'reactive',
  mode = 'dark',
  customColors = {},
  glassSettings = {},
  typography = {},
  effects = {},
  liveWeather = null,
  selectedHour = null,
}) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Compute master environment state
  const env = calculateAtmosEnvironment({
    weather: liveWeather,
    selectedHour,
    themePreset: presetId,
    themeMode: mode,
    customColors,
    glassSettings,
    typography,
    effects,
  });

  // Inject all computed CSS Custom Properties onto :root
  Object.entries(env.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Dynamic document meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', env.bg);
  }

  // Set dark/light class on html element
  if (mode === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }

  return env;
}

/**
 * Universal wrapper supporting positional and object calls
 */
export function applyTheme(
  themeConfig = {},
  glassConfig = {},
  typographyConfig = {},
  performanceConfig = {},
  weatherCode = null,
  isDay = 1
) {
  return applyThemeToDOM({
    presetId: themeConfig?.preset || 'reactive',
    mode: themeConfig?.mode || 'dark',
    customColors: themeConfig?.customColors || {},
    glassSettings: glassConfig || {},
    typography: typographyConfig || {},
    effects: performanceConfig || {},
    liveWeather: {
      current: {
        weather_code: weatherCode,
        is_day: isDay,
      },
    },
  });
}
