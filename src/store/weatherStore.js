import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchWeather, fetchAirQuality } from '../api/openmeteo';
import { getAtmosphereTheme } from '../utils/weatherTheme';
import { applyThemeToDOM } from '../utils/themeEngine';

const DEFAULT_LOCATION = {
  name: 'Meerut',
  country: 'India',
  countryCode: 'IN',
  lat: 28.9845,
  lon: 77.7064,
  timezone: 'Asia/Kolkata',
};

const DEFAULT_DASHBOARD_SECTIONS = [
  { id: 'hero', name: 'Current Weather & Brief', visible: true },
  { id: 'hourly', name: 'Hourly Forecast', visible: true },
  { id: 'intelligence', name: 'Day Guide (Rain, Wear, Comfort)', visible: true },
  { id: 'forecast', name: '7-Day Forecast & Curve', visible: true },
  { id: 'details', name: 'Atmospheric Telemetry', visible: true },
  { id: 'airquality', name: 'Air Quality & Sunlight Cycle', visible: true },
  { id: 'timeline', name: 'Weather Time Machine', visible: false },
  { id: 'insights', name: 'Weather Insights & Trends', visible: false },
  { id: 'activity', name: 'Should I Go Out? Activities', visible: false },
  { id: 'compare', name: 'City Comparison Matrix', visible: false },
];

let latestRequestId = 0;

export const useWeatherStore = create(
  persist(
    (set, get) => ({
      // Current Weather Data
      weather: null,
      airQuality: null,
      location: DEFAULT_LOCATION,
      loading: true,
      isTransitioning: false,
      lastUpdated: null,
      error: null,

      // Time Machine & Timeline Scrubbing
      selectedHour: null, // null means use current live hour

      // User Units (Persisted)
      units: {
        temp: 'C', // 'C' | 'F'
        wind: 'kmh', // 'kmh' | 'mph'
        clock: '24h', // '24h' | '12h'
      },

      // Atmos Studio: Appearance & Theming
      themePreset: 'classic', // 10 built-in presets: classic, reactive, midnight, amoled, sunset, ocean, evergreen, arctic, aurora, minimal_mono
      themeMode: 'dark', // 'dark' | 'light' | 'amoled' | 'reactive'
      customColors: {
        accent: '',
        bg: '',
        glow: '',
        glassTint: '',
      },

      // Glass Studio
      glassSettings: {
        level: 'medium', // 'off' | 'soft' | 'medium' | 'strong'
        blur: 20, // 8, 16, 24, 32
        opacity: 12, // 10, 20, 30
        border: 'subtle', // 'off' | 'subtle' | 'bright'
        shadow: 'soft', // 'off' | 'soft' | 'deep'
        tint: 'none', // 'none' | 'cool' | 'warm' | 'custom'
      },
      glassMode: false, // legacy flag; preserved for window overlay mode

      // Typography Studio
      typography: {
        font: 'atmos', // 'atmos' | 'modern' | 'rounded' | 'compact' | 'mono'
        scale: 'medium', // 'small' | 'medium' | 'large'
        tempFormat: 'clean', // 'clean' (26°) | 'spaced' (26 °C) | 'unit' (26°C)
      },

      // Dashboard Builder
      dashboard: {
        sections: DEFAULT_DASHBOARD_SECTIONS,
        density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
      },

      // Weather Effects & Performance
      effects: {
        intensity: 'subtle', // 'off' | 'subtle' | 'normal' | 'cinematic'
        performanceMode: 'balanced', // 'battery' | 'balanced' | 'cinematic'
      },
      animationIntensity: 'full', // legacy compatibility
      reducedMotion: false,

      // Personalization Profiles
      profiles: [
        {
          id: 'preset-night',
          name: 'Night AMOLED',
          themePreset: 'midnight',
          themeMode: 'amoled',
          glassSettings: { level: 'strong', blur: 24, opacity: 15, border: 'subtle', shadow: 'deep', tint: 'cool' },
          typography: { font: 'mono', scale: 'medium', tempFormat: 'clean' },
          dashboardDensity: 'compact',
          effectsIntensity: 'subtle',
        },
        {
          id: 'preset-day',
          name: 'Day Atmospheric',
          themePreset: 'classic',
          themeMode: 'dark',
          glassSettings: { level: 'medium', blur: 20, opacity: 12, border: 'subtle', shadow: 'soft', tint: 'none' },
          typography: { font: 'atmos', scale: 'medium', tempFormat: 'clean' },
          dashboardDensity: 'comfortable',
          effectsIntensity: 'normal',
        },
      ],
      autoAdapt: false,

      // Weather Memories (Local Journal)
      memories: [],

      // Active Deep-Dive & Modal States
      activeDeepDiveMetric: null, // 'temperature' | 'wind' | 'humidity' | 'uv' | 'rain' | 'aqi' | null
      isStudioOpen: false,
      isPlanOpen: false,
      isTravelOpen: false,
      isMemoriesOpen: false,

      // History & Favorites (Persisted)
      recentSearches: [
        { name: 'Meerut', country: 'India', lat: 28.9845, lon: 77.7064 },
        { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.209 },
        { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
        { name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
        { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 },
      ],
      favorites: [
        { id: 'meerut', name: 'Meerut', country: 'India', lat: 28.9845, lon: 77.7064 },
        { id: 'new-delhi', name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.209 },
        { id: 'mumbai', name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
        { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
        { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
      ],

      // ==================== Actions ====================

      setLocation: (loc) => {
        const hasExistingWeather = Boolean(get().weather);
        set({
          location: loc,
          selectedHour: null,
          isTransitioning: hasExistingWeather,
        });
        get().fetchData(loc.lat, loc.lon);
        get().addRecentSearch(loc);
      },

      setSelectedHour: (hour) => {
        set({ selectedHour: hour });
      },

      setUnits: (key, val) => {
        set((state) => ({
          units: { ...state.units, [key]: val },
        }));
      },

      toggleTempUnit: () => {
        const current = get().units.temp;
        get().setUnits('temp', current === 'C' ? 'F' : 'C');
      },

      // Theme Actions
      setThemePreset: (presetId) => {
        set({ themePreset: presetId });
        get().applyCurrentTheme();
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode });
        get().applyCurrentTheme();
      },

      setCustomColors: (colors) => {
        set((state) => ({
          customColors: { ...state.customColors, ...colors },
        }));
        get().applyCurrentTheme();
      },

      // Glass Actions
      setGlassSetting: (key, val) => {
        set((state) => ({
          glassSettings: { ...state.glassSettings, [key]: val },
        }));
        get().applyCurrentTheme();
      },

      toggleGlassMode: () => {
        set((state) => ({ glassMode: !state.glassMode }));
      },

      // Typography Actions
      setTypographySetting: (key, val) => {
        set((state) => ({
          typography: { ...state.typography, [key]: val },
        }));
        get().applyCurrentTheme();
      },

      // Dashboard Builder Actions
      toggleSectionVisibility: (id) => {
        set((state) => ({
          dashboard: {
            ...state.dashboard,
            sections: state.dashboard.sections.map((s) =>
              s.id === id ? { ...s, visible: !s.visible } : s
            ),
          },
        }));
      },

      moveSection: (id, direction) => {
        const sections = [...get().dashboard.sections];
        const idx = sections.findIndex((s) => s.id === id);
        if (idx === -1) return;

        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sections.length) return;

        const temp = sections[idx];
        sections[idx] = sections[targetIdx];
        sections[targetIdx] = temp;

        set((state) => ({
          dashboard: { ...state.dashboard, sections },
        }));
      },

      setDashboardDensity: (density) => {
        set((state) => ({
          dashboard: { ...state.dashboard, density },
        }));
      },

      resetDashboard: () => {
        set((state) => ({
          dashboard: {
            ...state.dashboard,
            sections: DEFAULT_DASHBOARD_SECTIONS,
            density: 'comfortable',
          },
        }));
      },

      // Weather Effects Actions
      setEffectSetting: (key, val) => {
        set((state) => ({
          effects: { ...state.effects, [key]: val },
        }));
      },

      setAnimationIntensity: (intensity) => {
        set({ animationIntensity: intensity });
      },

      setReducedMotion: (reduced) => {
        set({ reducedMotion: reduced });
      },

      // Personalization Profiles Actions
      saveProfile: (name) => {
        const s = get();
        const newProfile = {
          id: `profile-${Date.now()}`,
          name: name.trim() || 'My Setup',
          themePreset: s.themePreset,
          themeMode: s.themeMode,
          customColors: { ...s.customColors },
          glassSettings: { ...s.glassSettings },
          typography: { ...s.typography },
          dashboardDensity: s.dashboard.density,
          effects: { ...s.effects },
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
        }));
      },

      applyProfile: (profileId) => {
        const p = get().profiles.find((prof) => prof.id === profileId);
        if (!p) return;

        set((state) => ({
          themePreset: p.themePreset || state.themePreset,
          themeMode: p.themeMode || state.themeMode,
          customColors: p.customColors || state.customColors,
          glassSettings: p.glassSettings || state.glassSettings,
          typography: p.typography || state.typography,
          dashboard: {
            ...state.dashboard,
            density: p.dashboardDensity || state.dashboard.density,
          },
          effects: p.effects || state.effects,
        }));
        get().applyCurrentTheme();
      },

      deleteProfile: (profileId) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== profileId),
        }));
      },

      toggleAutoAdapt: () => {
        set((state) => ({ autoAdapt: !state.autoAdapt }));
      },

      // Weather Memories Actions
      addMemory: (snapshot) => {
        const memory = {
          id: `mem-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...snapshot,
        };
        set((state) => ({
          memories: [memory, ...state.memories].slice(0, 50),
        }));
      },

      deleteMemory: (id) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        }));
      },

      // Deep Dive Actions
      openDeepDive: (metricKey) => {
        set({ activeDeepDiveMetric: metricKey });
      },

      closeDeepDive: () => {
        set({ activeDeepDiveMetric: null });
      },

      // Modals
      openStudio: () => set({ isStudioOpen: true }),
      closeStudio: () => set({ isStudioOpen: false }),
      openPlan: () => set({ isPlanOpen: true }),
      closePlan: () => set({ isPlanOpen: false }),
      openTravel: () => set({ isTravelOpen: true }),
      closeTravel: () => set({ isTravelOpen: false }),
      openMemories: () => set({ isMemoriesOpen: true }),
      closeMemories: () => set({ isMemoriesOpen: false }),

      // Reset System
      resetAppearance: () => {
        set({
          themePreset: 'classic',
          themeMode: 'dark',
          customColors: { accent: '', bg: '', glow: '', glassTint: '' },
          glassSettings: { level: 'medium', blur: 20, opacity: 12, border: 'subtle', shadow: 'soft', tint: 'none' },
          typography: { font: 'atmos', scale: 'medium', tempFormat: 'clean' },
          effects: { intensity: 'subtle', performanceMode: 'balanced' },
        });
        get().applyCurrentTheme();
      },

      resetAllSettings: () => {
        get().resetAppearance();
        get().resetDashboard();
        set({
          units: { temp: 'C', wind: 'kmh', clock: '24h' },
          autoAdapt: false,
          glassMode: false,
        });
      },

      // Search History & Favorites Actions
      addRecentSearch: (loc) => {
        set((state) => {
          const filtered = state.recentSearches.filter(
            (s) => !(s.name === loc.name && s.country === loc.country)
          );
          return {
            recentSearches: [loc, ...filtered].slice(0, 10),
          };
        });
      },

      addFavorite: (loc) => {
        const id = `${loc.name}-${loc.lat}-${loc.lon}`.toLowerCase().replace(/\s+/g, '-');
        set((state) => {
          if (state.favorites.some((f) => f.id === id || (f.name === loc.name && f.country === loc.country))) {
            return state;
          }
          return {
            favorites: [...state.favorites, { ...loc, id }],
          };
        });
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id && `${f.name}-${f.lat}-${f.lon}` !== id),
        }));
      },

      isFavorite: (loc) => {
        const favs = get().favorites;
        return favs.some(
          (f) => f.name === loc.name && f.country === loc.country
        );
      },

      // Theme Application Helper
      applyCurrentTheme: () => {
        const s = get();
        applyThemeToDOM({
          presetId: s.themePreset,
          mode: s.themeMode,
          customColors: s.customColors,
          glassSettings: s.glassSettings,
          typography: s.typography,
          liveWeather: s.weather,
        });
      },

      // Fetch Weather Telemetry
      fetchData: async (lat, lon) => {
        const requestId = ++latestRequestId;
        set({ loading: true, error: null });

        try {
          const [weatherData, aqData] = await Promise.allSettled([
            fetchWeather(lat, lon),
            fetchAirQuality(lat, lon),
          ]);

          if (requestId !== latestRequestId) return;

          if (weatherData.status === 'rejected') {
            throw new Error(weatherData.reason?.message || 'Failed to fetch weather');
          }

          set({
            weather: weatherData.value,
            airQuality: aqData.status === 'fulfilled' && aqData.value ? aqData.value : { current: null, error: 'AQI_UNAVAILABLE' },
            loading: false,
            isTransitioning: false,
            lastUpdated: new Date().toISOString(),
            error: null,
          });

          // Re-apply theme in case Weather Reactive mode is active
          get().applyCurrentTheme();
        } catch (err) {
          if (requestId !== latestRequestId) return;
          set({
            loading: false,
            isTransitioning: false,
            error: err.message || 'Weather data couldn\'t be loaded. Check your connection and try again.',
          });
        }
      },

      getCurrentTheme: () => {
        const { weather, selectedHour } = get();
        if (!weather?.current) {
          return getAtmosphereTheme(0, 1, 12);
        }

        const now = new Date();
        const currentHour = selectedHour !== null ? selectedHour : now.getHours();
        const sunrise = weather.daily?.sunrise?.[0] || null;
        const sunset = weather.daily?.sunset?.[0] || null;

        let code = weather.current.weather_code;
        if (selectedHour !== null && weather.hourly?.weather_code) {
          code = weather.hourly.weather_code[selectedHour] ?? code;
        }

        const isDay = selectedHour !== null
          ? (selectedHour >= 6 && selectedHour < 19 ? 1 : 0)
          : weather.current.is_day;

        return getAtmosphereTheme(code, isDay, currentHour, sunrise, sunset);
      },
    }),
    {
      name: 'atmos-settings-storage-v2',
      version: 2,
      partialize: (state) => ({
        units: state.units,
        themePreset: state.themePreset,
        themeMode: state.themeMode,
        customColors: state.customColors,
        glassSettings: state.glassSettings,
        typography: state.typography,
        dashboard: state.dashboard,
        effects: state.effects,
        profiles: state.profiles,
        autoAdapt: state.autoAdapt,
        memories: state.memories,
        glassMode: state.glassMode,
        animationIntensity: state.animationIntensity,
        reducedMotion: state.reducedMotion,
        recentSearches: state.recentSearches,
        favorites: state.favorites,
      }),
    }
  )
);
