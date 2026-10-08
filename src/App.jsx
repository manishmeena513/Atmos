import React, { useEffect, useState } from 'react';
import { useWeatherStore } from './store/weatherStore';
import { applyTheme } from './utils/themeEngine';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { SectionWrapper } from './components/layout/SectionWrapper';
import { HeroSection } from './components/hero/HeroSection';
import { TodayTimeline } from './components/timeline/TodayTimeline';
import { HourlyForecast } from './components/hourly/HourlyForecast';
import { DayIntelligenceGrid } from './components/intelligence/DayIntelligenceGrid';
import { WeatherDetails } from './components/metrics/WeatherDetails';
import { TemperatureChart } from './components/charts/TemperatureChart';
import { SevenDayForecast } from './components/forecast/SevenDayForecast';
import { SunMoonArc } from './components/sunmoon/SunMoonArc';
import { AirQualitySection } from './components/airquality/AirQualitySection';
import { WeatherInsights } from './components/insights/WeatherInsights';
import { ActivityMode } from './components/activity/ActivityMode';
import { CityComparison } from './components/compare/CityComparison';
import { FavoritesCities } from './components/favorites/FavoritesCities';
import { GlassOverlay } from './components/glass/GlassOverlay';
import { ImmersiveMode } from './components/immersive/ImmersiveMode';
import { SearchModal } from './components/search/SearchModal';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { ShareWeatherModal } from './components/share/ShareWeatherModal';
import { LoadingAtmosphere } from './components/states/LoadingAtmosphere';
import { ErrorState } from './components/states/ErrorState';

// V2.5 Living Weather & Personalization Modals
import { AtmosStudioModal } from './components/studio/AtmosStudioModal';
import { MetricDeepDiveModal } from './components/deepdive/MetricDeepDiveModal';
import { PlanYourDayModal } from './components/planning/PlanYourDayModal';
import { TravelModeModal } from './components/travel/TravelModeModal';
import { WeatherMemoriesModal } from './components/memories/WeatherMemoriesModal';
import { OfflineBanner } from './components/pwa/OfflineBanner';

export function App() {
  const location = useWeatherStore((s) => s.location);
  const loading = useWeatherStore((s) => s.loading);
  const error = useWeatherStore((s) => s.error);
  const weather = useWeatherStore((s) => s.weather);
  const fetchData = useWeatherStore((s) => s.fetchData);

  // V2.5 Personalization State
  const theme = useWeatherStore((s) => s.theme);
  const glass = useWeatherStore((s) => s.glass);
  const typography = useWeatherStore((s) => s.typography);
  const performance = useWeatherStore((s) => s.performance);
  const dashboard = useWeatherStore((s) => s.dashboard);

  // Deep-dive state
  const isDeepDiveOpen = useWeatherStore((s) => s.isDeepDiveOpen);
  const closeDeepDive = useWeatherStore((s) => s.closeDeepDive);

  // Modal Open States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isTravelOpen, setIsTravelOpen] = useState(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);

  // Initial weather fetch on mount
  useEffect(() => {
    fetchData(location.lat, location.lon);
  }, []);

  // Synchronize CSS custom properties & theme engine
  useEffect(() => {
    let activePreset = theme?.preset || 'classic';

    // Auto Adapt based on celestial hour & conditions
    if (theme?.autoAdapt && weather?.current) {
      const isDay = weather.current.is_day;
      const hour = new Date().getHours();
      if (!isDay && (hour < 5 || hour >= 21)) {
        activePreset = 'midnight';
      } else if ((hour >= 5 && hour < 8) || (hour >= 18 && hour < 21)) {
        activePreset = 'sunset';
      } else {
        activePreset = 'weather-reactive';
      }
    }

    applyTheme(
      { ...(theme || {}), preset: activePreset },
      glass || {},
      typography || {},
      performance || {},
      weather?.current?.weather_code,
      weather?.current?.is_day
    );
  }, [theme, glass, typography, performance, weather]);

  // Section Component Registry
  const renderSection = (id) => {
    switch (id) {
      case 'timeline':
        return (
          <SectionWrapper key="timeline" id="timeline-section">
            <TodayTimeline />
          </SectionWrapper>
        );
      case 'hourly':
        return (
          <SectionWrapper key="hourly" id="hourly-section">
            <HourlyForecast />
          </SectionWrapper>
        );
      case 'intelligence':
        return (
          <SectionWrapper key="intelligence" id="intelligence-section">
            <DayIntelligenceGrid />
          </SectionWrapper>
        );
      case 'insights':
        return (
          <SectionWrapper key="insights" id="insights-section">
            <WeatherInsights />
          </SectionWrapper>
        );
      case 'activity':
        return (
          <SectionWrapper key="activity" id="activity-section">
            <ActivityMode />
          </SectionWrapper>
        );
      case 'forecast':
        return (
          <SectionWrapper key="forecast" id="forecast-section">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <SevenDayForecast />
              </div>
              <div className="lg:col-span-5">
                <TemperatureChart />
              </div>
            </div>
          </SectionWrapper>
        );
      case 'details':
        return (
          <SectionWrapper key="details" id="details-section">
            <WeatherDetails />
          </SectionWrapper>
        );
      case 'airquality':
        return (
          <SectionWrapper key="airquality" id="airquality-section">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AirQualitySection />
              </div>
              <div className="lg:col-span-5">
                <SunMoonArc />
              </div>
            </div>
          </SectionWrapper>
        );
      case 'compare':
        return (
          <SectionWrapper key="compare" id="compare-section">
            <CityComparison />
          </SectionWrapper>
        );
      default:
        return null;
    }
  };

  // Section density spacing class
  const densityClass =
    dashboard?.density === 'compact'
      ? 'space-y-4 my-3'
      : dashboard?.density === 'spacious'
      ? 'space-y-12 my-8'
      : 'space-y-8 my-4';

  const orderedSections = dashboard?.sections || [
    { id: 'hourly', visible: true },
    { id: 'intelligence', visible: true },
    { id: 'forecast', visible: true },
    { id: 'details', visible: true },
    { id: 'airquality', visible: true },
    { id: 'timeline', visible: false },
    { id: 'insights', visible: false },
    { id: 'activity', visible: false },
    { id: 'compare', visible: false },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary,#080B10)] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* PWA & Offline Status Banner */}
      <OfflineBanner />

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
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenTravel={() => setIsTravelOpen(true)}
        onOpenPlan={() => setIsPlanOpen(true)}
        onOpenMemories={() => setIsMemoriesOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
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
          {/* 1. Hero Atmospheric Living Stage + Atmos Daily Brief */}
          <div id="hero-section">
            <HeroSection
              onEnterImmersive={() => setIsImmersiveOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
            />
          </div>

          {/* Sticky Navigation Bar */}
          <Navigation />

          {/* Favorites & Saved Cities Quick Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-2">
            <FavoritesCities onOpenSearch={() => setIsSearchOpen(true)} />
          </div>

          {/* Dynamic Reorderable Dashboard Sections */}
          <div className={densityClass}>
            {orderedSections
              .filter((s) => s.visible !== false)
              .map((s) => renderSection(s.id))}
          </div>

          {/* Atmospheric Footer */}
          <footer className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center text-xs text-slate-500 border-t border-white/5 mt-12 space-y-3">
            <div className="flex items-center justify-center gap-2 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
              <span>Atmos</span>
              <span>·</span>
              <span>Living Weather Experience V2.5</span>
            </div>
            <p className="text-slate-400 italic">
              &ldquo;Don&apos;t just show the weather. Explain the day.&rdquo;
            </p>
            <p>
              Telemetry delivered via Open-Meteo High-Resolution Atmospheric Models.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-500 pt-2 text-xs">
              <button
                onClick={() => setIsStudioOpen(true)}
                className="hover:text-sky-400 font-medium transition-colors cursor-pointer"
              >
                Atmos Studio
              </button>
              <span>·</span>
              <button
                onClick={() => setIsPlanOpen(true)}
                className="hover:text-emerald-400 font-medium transition-colors cursor-pointer"
              >
                Plan Day
              </button>
              <span>·</span>
              <button
                onClick={() => setIsTravelOpen(true)}
                className="hover:text-sky-400 font-medium transition-colors cursor-pointer"
              >
                Travel Mode
              </button>
              <span>·</span>
              <button
                onClick={() => setIsMemoriesOpen(true)}
                className="hover:text-amber-400 font-medium transition-colors cursor-pointer"
              >
                Weather Memories
              </button>
              <span>·</span>
              <button
                onClick={() => setIsShareOpen(true)}
                className="hover:text-sky-400 font-medium transition-colors cursor-pointer"
              >
                Share Card
              </button>
              <span>·</span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Preferences
              </button>
            </div>
            <div className="pt-6 border-t border-white/5 space-y-1 text-slate-500 text-[11px]">
              <div>&copy; 2026 Atmos. All rights reserved.</div>
              <div className="text-slate-400 font-medium">Developed by Manish Meena.</div>
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
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      <ShareWeatherModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* V2.5 Atmos Studio Master Customization Drawer */}
      <AtmosStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />

      {/* V2.5 Metric Deep-Dive Modal */}
      <MetricDeepDiveModal
        isOpen={isDeepDiveOpen}
        onClose={closeDeepDive}
      />

      {/* V2.5 Plan Your Day Window Evaluator */}
      <PlanYourDayModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
      />

      {/* V2.5 Travel Mode Destination Preview */}
      <TravelModeModal
        isOpen={isTravelOpen}
        onClose={() => setIsTravelOpen(false)}
      />

      {/* V2.5 Weather Memories Local Journal */}
      <WeatherMemoriesModal
        isOpen={isMemoriesOpen}
        onClose={() => setIsMemoriesOpen(false)}
      />
    </div>
  );
}

export default App;
