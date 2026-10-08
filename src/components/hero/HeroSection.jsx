import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { WeatherInfo } from './WeatherInfo';
import { DailyBrief } from './DailyBrief';
import { WeatherEnvironment } from '../environment/WeatherEnvironment';

export function HeroSection({ onEnterImmersive, onOpenShare }) {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const selectedHour = useWeatherStore((s) => s.selectedHour);
  const isTransitioning = useWeatherStore((s) => s.isTransitioning);

  if (!weather?.current) return null;

  // If user is scrubbing the timeline, show the selected hour's metrics
  let activeTemp = weather.current.temperature_2m;
  let activeWeatherCode = weather.current.weather_code;
  let activeApparent = weather.current.apparent_temperature;
  let activeHumidity = weather.current.relative_humidity_2m;
  let activeWind = weather.current.wind_speed_10m;

  if (selectedHour !== null && weather.hourly) {
    activeTemp = weather.hourly.temperature_2m?.[selectedHour] ?? activeTemp;
    activeWeatherCode = weather.hourly.weather_code?.[selectedHour] ?? activeWeatherCode;
    activeApparent = weather.hourly.apparent_temperature?.[selectedHour] ?? activeApparent;
    activeHumidity = weather.hourly.relative_humidity_2m?.[selectedHour] ?? activeHumidity;
    activeWind = weather.hourly.wind_speed_10m?.[selectedHour] ?? activeWind;
  }

  const currentDisplayData = {
    ...weather.current,
    temperature_2m: activeTemp,
    weather_code: activeWeatherCode,
    apparent_temperature: activeApparent,
    relative_humidity_2m: activeHumidity,
    wind_speed_10m: activeWind,
  };

  const scrollToTimeline = () => {
    const el = document.getElementById('hourly-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-[92svh] sm:min-h-[96svh] flex flex-col justify-between overflow-hidden px-3.5 sm:px-8 lg:px-14 pt-16 sm:pt-24 pb-4 sm:pb-8">
      {/* 1. Living Atmospheric Environment (Canvas + Sky + Celestial + Particles) */}
      <div className="absolute inset-0 z-0">
        <WeatherEnvironment />
      </div>

      {/* Subtle indicator ONLY when time-travel scrubbing or transitioning */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between min-h-[24px]">
        {selectedHour !== null ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-medium backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Time Travel: {String(selectedHour).padStart(2, '0')}:00 Forecast</span>
          </div>
        ) : <div />}

        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-medium backdrop-blur-md"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Syncing {location.name}...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Hero Main Stage: Current Weather, Meaning, Metrics & Daily Brief */}
      <motion.div
        key={`${location.lat}-${location.lon}`}
        initial={{ opacity: 0.65, y: 8 }}
        animate={{ opacity: isTransitioning ? 0.65 : 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 my-auto py-2 sm:py-4 flex flex-col gap-4 sm:gap-6 max-w-7xl w-full mx-auto"
      >
        <WeatherInfo
          current={currentDisplayData}
          daily={weather.daily}
          location={location}
          timezone={weather.timezone}
          onOpenShare={onOpenShare}
        />

        {/* 4-Part Atmos Daily Brief Strip */}
        <DailyBrief />
      </motion.div>

      {/* 3. Bottom Minimal Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 flex justify-center mt-1"
      >
        <button
          onClick={scrollToTimeline}
          className="flex flex-col items-center gap-0.5 text-slate-400/70 hover:text-white transition-colors cursor-pointer group"
          aria-label="Scroll to hourly forecast"
        >
          <span className="text-[10px] uppercase tracking-widest font-medium opacity-60 group-hover:opacity-100 transition-opacity">
            Hourly Forecast & Telemetry
          </span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce opacity-60 group-hover:opacity-100" />
        </button>
      </motion.div>
    </section>
  );
}

export default HeroSection;
