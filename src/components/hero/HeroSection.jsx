import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Maximize2 } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { TemperatureDisplay } from './TemperatureDisplay';
import { WeatherInfo } from './WeatherInfo';
import { WeatherEnvironment } from '../environment/WeatherEnvironment';

export function HeroSection({ onEnterImmersive }) {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const selectedHour = useWeatherStore((s) => s.selectedHour);

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
    <section className="relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden px-4 sm:px-8 lg:px-14 pt-20 sm:pt-24 pb-6 sm:pb-8">
      {/* 1. Living Atmospheric Environment (Canvas + Sky + Celestial + Particles) */}
      <div className="absolute inset-0 z-0">
        <WeatherEnvironment />
      </div>

      {/* 2. Floating Atmospheric Status Pill & Enter Weather Action */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 self-start flex flex-wrap items-center gap-3"
      >
        {selectedHour !== null ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Time Travel Mode: {String(selectedHour).padStart(2, '0')}:00 Forecast</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-medium backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Live Atmosphere · Real-Time Physics</span>
          </div>
        )}

        <button
          onClick={onEnterImmersive}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-sky-500 hover:text-white border border-white/15 text-slate-300 text-xs font-semibold backdrop-blur-md transition-all shadow-md cursor-pointer group"
          title="Experience full-screen atmospheric immersion"
        >
          <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Enter Weather</span>
        </button>
      </motion.div>

      {/* 3. Hero Main Stage: Huge Temperature + Metadata */}
      <div className="relative z-10 my-auto py-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 max-w-7xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <TemperatureDisplay tempCelsius={activeTemp} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 max-w-xl"
        >
          <WeatherInfo
            current={currentDisplayData}
            daily={weather.daily}
            location={location}
            timezone={weather.timezone}
          />
        </motion.div>
      </div>

      {/* 4. Bottom Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="relative z-10 flex justify-center mt-2"
      >
        <button
          onClick={scrollToTimeline}
          className="flex flex-col items-center gap-1 text-slate-400/80 hover:text-white transition-colors duration-200 cursor-pointer group"
          aria-label="Scroll to hourly forecast"
        >
          <span className="text-[11px] uppercase tracking-widest font-medium opacity-60 group-hover:opacity-100 transition-opacity">
            Explore Day & Atmosphere
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce opacity-70 group-hover:opacity-100" />
        </button>
      </motion.div>
    </section>
  );
}
