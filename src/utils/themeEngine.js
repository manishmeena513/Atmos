import { getAtmosphereTheme } from './weatherTheme';

/**
 * Atmos V2.5 Centralized Theme Engine
 * Controls colors, surfaces, glass, typography, effects, and weather-reactivity.
 */

export const THEME_PRESETS = [
  {
    id: 'classic',
    name: 'Classic Atmos',
    description: 'Deep twilight with electric cyan & sky blue accents',
    accent: '#38BDF8',
    glow: '#0284C7',
    bg: '#080B10',
    surface: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.16)',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    blobs: ['#0284C7', '#1E1B4B', '#0F172A'],
  },
  {
    id: 'reactive',
    name: 'Weather Reactive',
    description: 'Dynamically adapts lighting, tints, and atmosphere to live weather',
    accent: '#38BDF8',
    glow: '#0284C7',
    bg: '#080B10',
    surface: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.16)',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    blobs: ['#0284C7', '#1E1B4B', '#0F172A'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Inky sapphire obsidian with starfield blue highlights',
    accent: '#818CF8',
    glow: '#4F46E5',
    bg: '#050714',
    surface: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(129, 140, 248, 0.18)',
    text: '#EEF2FF',
    textMuted: '#A5B4FC',
    blobs: ['#4338CA', '#1E1B4B', '#312E81'],
  },
  {
    id: 'amoled',
    name: 'AMOLED',
    description: 'True deep black #000000 surfaces for maximum OLED contrast',
    accent: '#38BDF8',
    glow: '#0EA5E9',
    bg: '#000000',
    surface: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.14)',
    text: '#FFFFFF',
    textMuted: '#A1A1AA',
    blobs: ['#0369A1', '#09090B', '#000000'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Golden hour amber, twilight violet, and coral reflections',
    accent: '#F97316',
    glow: '#EA580C',
    bg: '#100B14',
    surface: 'rgba(251, 146, 60, 0.08)',
    border: 'rgba(249, 115, 22, 0.20)',
    text: '#FFF7ED',
    textMuted: '#FDBA74',
    blobs: ['#EA580C', '#701A75', '#431407'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep marine cyan, turquoise, and aquamarine depths',
    accent: '#2DD4BF',
    glow: '#0D9488',
    bg: '#041217',
    surface: 'rgba(45, 212, 191, 0.08)',
    border: 'rgba(45, 212, 191, 0.18)',
    text: '#F0FDFA',
    textMuted: '#99F6E4',
    blobs: ['#0F766E', '#134E4A', '#042F2E'],
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    description: 'Forest emerald, boreal spruce, and fresh mountain mist',
    accent: '#34D399',
    glow: '#059669',
    bg: '#06130D',
    surface: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.18)',
    text: '#ECFDF5',
    textMuted: '#A7F3D0',
    blobs: ['#047857', '#064E3B', '#022C22'],
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Crisp ice blue, frosted silver, and glacial highlights',
    accent: '#A5F3FC',
    glow: '#0891B2',
    bg: '#081119',
    surface: 'rgba(165, 243, 252, 0.08)',
    border: 'rgba(165, 243, 252, 0.22)',
    text: '#F0FDFE',
    textMuted: '#BAE6FD',
    blobs: ['#0E7490', '#164E63', '#083344'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Ethereal northern borealis with magenta, violet, and jade glow',
    accent: '#C084FC',
    glow: '#9333EA',
    bg: '#08081A',
    surface: 'rgba(192, 132, 252, 0.08)',
    border: 'rgba(192, 132, 252, 0.22)',
    text: '#FAF5FF',
    textMuted: '#E9D5FF',
    blobs: ['#9333EA', '#059669', '#4C1D95'],
  },
  {
    id: 'minimal_mono',
    name: 'Minimal Mono',
    description: 'Architectural charcoal, stark monochromatic contrast',
    accent: '#FFFFFF',
    glow: '#71717A',
    bg: '#090A0C',
    surface: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.18)',
    text: '#FFFFFF',
    textMuted: '#A1A1AA',
    blobs: ['#27272A', '#18181B', '#09090B'],
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
 * Calculates relative luminance of an RGB/hex color.
 */
function getLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Ensures text remains accessible on chosen background / surface.
 */
export function ensureAccessibleContrast(accentHex, bgHex) {
  try {
    const bgLum = getLuminance(bgHex || '#080B10');
    const isDarkBg = bgLum < 0.2;

    return {
      text: isDarkBg ? '#F8FAFC' : '#0F172A',
      textMuted: isDarkBg ? '#94A3B8' : '#475569',
      border: isDarkBg ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.14)',
      surface: isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.75)',
    };
  } catch {
    return {
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      border: 'rgba(255, 255, 255, 0.16)',
      surface: 'rgba(255, 255, 255, 0.08)',
    };
  }
}

/**
 * Applies the complete active theme to CSS custom properties on :root
 */
export function applyThemeToDOM({
  presetId = 'classic',
  mode = 'dark',
  customColors = {},
  glassSettings = {},
  typography = {},
  liveWeather = null,
}) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Resolve base theme
  let theme = THEME_PRESETS.find((p) => p.id === presetId) || THEME_PRESETS[0];

  // If Weather Reactive, derive dynamically from live atmospheric data
  if ((presetId === 'reactive' || presetId === 'weather-reactive') && liveWeather?.current) {
    const code = liveWeather.current.weather_code || 0;
    const isDay = liveWeather.current.is_day ?? 1;
    const sunrise = liveWeather.daily?.sunrise?.[0] || null;
    const sunset = liveWeather.daily?.sunset?.[0] || null;
    const hour = new Date().getHours();

    const atmosTheme = getAtmosphereTheme(code, isDay, hour, sunrise, sunset);
    theme = {
      ...theme,
      accent: atmosTheme.accent || '#38BDF8',
      bg: atmosTheme.skyTop || '#080B10',
      glow: atmosTheme.accent || '#0284C7',
      blobs: [
        atmosTheme.skyMid || '#0F172A',
        atmosTheme.skyBottom || '#1E1B4B',
        atmosTheme.accent || '#0284C7',
      ],
    };
  }

  // 2. Override with custom colors if user specified
  const accent = customColors.accent || theme.accent;
  let bg = customColors.bg || theme.bg;
  const glow = customColors.glow || theme.glow;

  // Handle Mode
  if (mode === 'amoled') {
    bg = '#000000';
  } else if (mode === 'light') {
    bg = '#F8FAFC';
  }

  const contrast = ensureAccessibleContrast(accent, bg);

  // 3. Resolve Glass Settings
  let glassBlur = '20px';
  if (glassSettings.level === 'off') glassBlur = '0px';
  else if (glassSettings.level === 'soft') glassBlur = '12px';
  else if (glassSettings.level === 'strong') glassBlur = '32px';
  else if (glassSettings.blur) glassBlur = `${glassSettings.blur}px`;

  let glassOpacity = '0.08';
  if (glassSettings.level === 'off') glassOpacity = '0.94';
  else if (glassSettings.level === 'soft') glassOpacity = '0.06';
  else if (glassSettings.level === 'strong') glassOpacity = '0.14';
  else if (glassSettings.opacity) glassOpacity = `${glassSettings.opacity / 100}`;

  let glassBorder = contrast.border;
  if (glassSettings.border === 'off') glassBorder = 'transparent';
  else if (glassSettings.border === 'bright') glassBorder = 'rgba(255, 255, 255, 0.28)';

  let glassTint = 'transparent';
  if (glassSettings.tint === 'cool') glassTint = 'rgba(56, 189, 248, 0.04)';
  else if (glassSettings.tint === 'warm') glassTint = 'rgba(251, 146, 60, 0.04)';
  else if (glassSettings.tint === 'custom' && customColors.glassTint) glassTint = customColors.glassTint;

  // 4. Resolve Typography
  const fontObj = FONTS.find((f) => f.id === typography.font) || FONTS[0];
  let textScale = 1.0;
  if (typography.scale === 'small') textScale = 0.92;
  else if (typography.scale === 'large') textScale = 1.08;

  // 5. Inject CSS variables
  root.style.setProperty('--atmos-accent', accent);
  root.style.setProperty('--atmos-glow', glow);
  root.style.setProperty('--atmos-bg', bg);
  root.style.setProperty('--atmos-surface', contrast.surface);
  root.style.setProperty('--atmos-border', glassBorder);
  root.style.setProperty('--atmos-text', contrast.text);
  root.style.setProperty('--atmos-text-muted', contrast.textMuted);
  root.style.setProperty('--atmos-glass-blur', glassBlur);
  root.style.setProperty('--atmos-glass-opacity', glassOpacity);
  root.style.setProperty('--atmos-glass-tint', glassTint);
  root.style.setProperty('--atmos-font-family', fontObj.family);
  root.style.setProperty('--atmos-text-scale', `${textScale}`);

  // Dynamic document meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', bg);

  // Set dark/light class on html element
  if (mode === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}

/**
 * Universal wrapper supporting positional and object calls
 */
export function applyTheme(themeConfig = {}, glassConfig = {}, typographyConfig = {}, performanceConfig = {}, weatherCode = null, isDay = 1) {
  return applyThemeToDOM({
    presetId: themeConfig?.preset || 'classic',
    mode: themeConfig?.mode || 'dark',
    customColors: themeConfig?.customColors || {},
    glassSettings: glassConfig || {},
    typography: typographyConfig || {},
    liveWeather: {
      current: {
        weather_code: weatherCode,
        is_day: isDay,
      }
    }
  });
}
