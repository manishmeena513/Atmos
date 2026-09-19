import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchWeather, fetchAirQuality } from '../api/openmeteo';
import { getAtmosphereTheme } from '../utils/weatherTheme';

const DEFAULT_LOCATION = {
  name: 'Meerut',
  country: 'India',
  countryCode: 'IN',
  lat: 28.9845,
  lon: 77.7064,
  timezone: 'Asia/Kolkata',
};

let latestRequestId = 0;

export const useWeatherStore = create(
  persist(
    (set, get) => ({
      // Current Weather Data
      weather: null,
      airQuality: null,
      location: DEFAULT_LOCATION,
      loading: true,
      error: null,

      // Time Machine & Timeline Scrubbing
      selectedHour: null, // null means use current live hour

      // User Preferences (Persisted)
      units: {
        temp: 'C', // 'C' | 'F'
        wind: 'kmh', // 'kmh' | 'mph'
        clock: '24h', // '24h' | '12h'
      },
      animationIntensity: 'full', // 'full' | 'reduced' | 'minimal'
      reducedMotion: false,
      glassMode: false,

      // History & Favorites (Persisted)
      recentSearches: [
        { name: 'Meerut', country: 'India', lat: 28.9845, lon: 77.7064 },
        { name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
        { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 },
      ],
      favorites: [
        { id: 'meerut', name: 'Meerut', country: 'India', lat: 28.9845, lon: 77.7064 },
        { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
        { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
        { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 },
      ],

      // Actions
      setLocation: (loc) => {
        set({ location: loc, selectedHour: null });
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
        set((state) => ({
          units: {
            ...state.units,
            temp: state.units.temp === 'C' ? 'F' : 'C',
          },
        }));
      },

      toggleGlassMode: () => {
        set((state) => ({ glassMode: !state.glassMode }));
      },

      setAnimationIntensity: (val) => {
        set({ animationIntensity: val });
      },

      setReducedMotion: (val) => {
        set({ reducedMotion: val });
      },

      addRecentSearch: (loc) => {
        set((state) => {
          const filtered = state.recentSearches.filter(
            (item) => !(item.lat === loc.lat && item.lon === loc.lon)
          );
          return {
            recentSearches: [loc, ...filtered].slice(0, 8),
          };
        });
      },

      addFavorite: (loc) => {
        set((state) => {
          const id = `${loc.name}-${loc.lat}-${loc.lon}`.toLowerCase().replace(/\s+/g, '-');
          if (state.favorites.some((f) => f.id === id)) return state;
          return {
            favorites: [...state.favorites, { ...loc, id }].slice(0, 12),
          };
        });
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      isFavorite: (loc) => {
        const { favorites } = get();
        return favorites.some(
          (f) =>
            (f.name === loc.name && f.country === loc.country) ||
            (Math.abs(f.lat - loc.lat) < 0.05 && Math.abs(f.lon - loc.lon) < 0.05)
        );
      },

      fetchData: async (lat, lon) => {
        const requestId = ++latestRequestId;
        set({ loading: true, error: null });
        try {
          const [weatherData, aqData] = await Promise.allSettled([
            fetchWeather(lat, lon),
            fetchAirQuality(lat, lon),
          ]);

          // Prevent race conditions: if another request was initiated after this one, discard results
          if (requestId !== latestRequestId) {
            return;
          }

          if (weatherData.status === 'rejected') {
            throw new Error(weatherData.reason?.message || 'Failed to fetch weather');
          }

          set({
            weather: weatherData.value,
            airQuality: aqData.status === 'fulfilled' && aqData.value ? aqData.value : { current: null, error: 'AQI_UNAVAILABLE' },
            loading: false,
            error: null,
          });
        } catch (err) {
          if (requestId !== latestRequestId) return;
          console.error('Weather load error:', err);
          set({
            loading: false,
            error: err.message || 'Unable to load atmospheric data. Check your connection.',
          });
        }
      },

      // Helper to compute active theme dynamically
      getCurrentTheme: () => {
        const { weather, selectedHour } = get();
        if (!weather?.current) {
          return getAtmosphereTheme(0, 1, 12);
        }

        const now = new Date();
        const currentHour = selectedHour !== null ? selectedHour : now.getHours();
        const sunrise = weather.daily?.sunrise?.[0] || null;
        const sunset = weather.daily?.sunset?.[0] || null;

        // If scrubbing, select hourly weather code if available
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
      name: 'atmos-settings-storage',
      partialize: (state) => ({
        units: state.units,
        animationIntensity: state.animationIntensity,
        reducedMotion: state.reducedMotion,
        glassMode: state.glassMode,
        recentSearches: state.recentSearches,
        favorites: state.favorites,
      }),
    }
  )
);
