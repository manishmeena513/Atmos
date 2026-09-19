import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useWeatherStore } from './store/weatherStore';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { SectionWrapper } from './components/layout/SectionWrapper';
import { HeroSection } from './components/hero/HeroSection';
import { TodayTimeline } from './components/timeline/TodayTimeline';
import { HourlyForecast } from './components/hourly/HourlyForecast';
import { TemperatureChart } from './components/charts/TemperatureChart';
import { SevenDayForecast } from './components/forecast/SevenDayForecast';
import { SunMoonArc } from './components/sunmoon/SunMoonArc';
import { AirQualitySection } from './components/airquality/AirQualitySection';
import { WeatherInsights } from './components/insights/WeatherInsights';
import { ActivityMode } from './components/activity/ActivityMode';
import { LocationMap } from './components/map/LocationMap';
import { CityComparison } from './components/compare/CityComparison';
import { FavoritesCities } from './components/favorites/FavoritesCities';
import { GlassOverlay } from './components/glass/GlassOverlay';
import { ImmersiveMode } from './components/immersive/ImmersiveMode';
import { SearchModal } from './components/search/SearchModal';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { LoadingAtmosphere } from './components/states/LoadingAtmosphere';
import { ErrorState } from './components/states/ErrorState';
import { Globe, Loader2 } from 'lucide-react';

// Lazy load 3D Weather Globe for high performance
const WeatherGlobe = lazy(() => import('./components/globe/WeatherGlobe'));

export function App() {
  const location = useWeatherStore((s) => s.location);
  const loading = useWeatherStore((s) => s.loading);
  const error = useWeatherStore((s) => s.error);
  const weather = useWeatherStore((s) => s.weather);
  const fetchData = useWeatherStore((s) => s.fetchData);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);

  // Initial weather fetch on mount
  useEffect(() => {
    fetchData(location.lat, location.lon);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#080B10] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Optional Frosted Glass Window Overlay Mode */}
      <GlassOverlay />

      {/* ENTER WEATHER Full-Screen Immersive Experience */}
      <ImmersiveMode
        isOpen={isImmersiveOpen}
        onClose={() => setIsImmersiveOpen(false)}
      />

      {/* Global Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onEnterImmersive={() => setIsImmersiveOpen(true)}
      />

      {/* Initial Loading Screen */}
      {loading && !weather && <LoadingAtmosphere city={location.name} />}

      {/* Error State or Main Content */}
      {error && !weather ? (
        <main className="pt-24">
          <ErrorState error={error} onOpenSearch={() => setIsSearchOpen(true)} />
        </main>
      ) : (
        <main className="relative">
          {/* 1. Hero Atmospheric Living Stage */}
          <div id="hero-section">
            <HeroSection onEnterImmersive={() => setIsImmersiveOpen(true)} />
          </div>

          {/* Sticky Navigation Bar */}
          <Navigation />

          {/* Favorites & Recent Cities Quick Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-2">
            <FavoritesCities />
          </div>

          {/* 2. Weather Time Machine / Today's Timeline */}
          <SectionWrapper id="timeline-section">
            <TodayTimeline />
          </SectionWrapper>

          {/* 3. Hourly Forecast Horizontal Cards */}
          <SectionWrapper id="hourly-section">
            <HourlyForecast />
          </SectionWrapper>

          {/* 4. 7-Day Forecast & 24-Hour Temperature Curve */}
          <SectionWrapper id="forecast-section">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <SevenDayForecast />
              </div>
              <div className="lg:col-span-5">
                <TemperatureChart />
              </div>
            </div>
          </SectionWrapper>

          {/* 5. Geographic Location Map */}
          <SectionWrapper id="map-section">
            <LocationMap />
          </SectionWrapper>

          {/* 6. Planet 3D Weather Globe (Lazy Loaded) */}
          <SectionWrapper id="globe-section">
            <Suspense
              fallback={
                <div className="glass-panel rounded-3xl h-80 flex items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                  <span>Loading Planet Atmos 3D Orbit...</span>
                </div>
              }
            >
              <WeatherGlobe />
            </Suspense>
          </SectionWrapper>

          {/* 7. City Comparison Matrix */}
          <SectionWrapper id="compare-section">
            <CityComparison />
          </SectionWrapper>

          {/* 8. Air Quality & Sun/Moon Cycle */}
          <SectionWrapper id="airquality-section">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AirQualitySection />
              </div>
              <div className="lg:col-span-5">
                <SunMoonArc />
              </div>
            </div>
          </SectionWrapper>

          {/* 9. Actionable Weather Insights */}
          <SectionWrapper id="insights-section">
            <WeatherInsights />
          </SectionWrapper>

          {/* 10. Activity Mode (Planning) */}
          <SectionWrapper id="activity-section">
            <ActivityMode />
          </SectionWrapper>

          {/* Atmospheric Footer */}
          <footer className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center text-xs text-slate-500 border-t border-white/5 mt-12 space-y-3">
            <div className="flex items-center justify-center gap-2 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
              <span>Atmos</span>
              <span>·</span>
              <span>Living Weather Experience</span>
            </div>
            <p>
              Telemetry delivered via Open-Meteo High-Resolution Atmospheric Models.
            </p>
            <div className="flex items-center justify-center gap-4 text-slate-500 pt-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Preferences
              </button>
              <span>·</span>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Change Location
              </button>
              <span>·</span>
              <button
                onClick={() => setIsImmersiveOpen(true)}
                className="hover:text-sky-400 transition-colors cursor-pointer"
              >
                Enter Weather
              </button>
            </div>
          </footer>
        </main>
      )}

      {/* Global Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
export default App;
