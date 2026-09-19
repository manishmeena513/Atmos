import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  RotateCcw,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  CloudRain,
  Wind,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';

export function TodayTimeline() {
  const weather = useWeatherStore((s) => s.weather);
  const selectedHour = useWeatherStore((s) => s.selectedHour);
  const setSelectedHour = useWeatherStore((s) => s.setSelectedHour);
  const units = useWeatherStore((s) => s.units);

  if (!weather?.hourly) return null;

  const currentLiveHour = new Date().getHours();
  const activeHour = selectedHour !== null ? selectedHour : currentLiveHour;

  // Key metrics for the active hour
  const tempC = weather.hourly.temperature_2m?.[activeHour] ?? 0;
  const tempVal =
    units.temp === 'F' ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC);

  const weatherCode = weather.hourly.weather_code?.[activeHour] ?? 0;
  const condition = getWmoInfo(weatherCode);

  const precipProb = weather.hourly.precipitation_probability?.[activeHour] ?? 0;
  const windRaw = weather.hourly.wind_speed_10m?.[activeHour] ?? 0;
  const windVal =
    units.wind === 'mph' ? Math.round(windRaw * 0.621371) : Math.round(windRaw);

  // Sunrise / Sunset hours
  let sunriseHour = 6;
  let sunsetHour = 18;
  if (weather.daily?.sunrise?.[0]) {
    sunriseHour = new Date(weather.daily.sunrise[0]).getHours();
  }
  if (weather.daily?.sunset?.[0]) {
    sunsetHour = new Date(weather.daily.sunset[0]).getHours();
  }

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Weather Time Machine
            </h3>
            <p className="text-xs text-slate-400">
              Scrub through today's 24-hour cycle to witness connected atmospheric transitions
            </p>
          </div>
        </div>

        {selectedHour !== null && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSelectedHour(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Live Now</span>
          </motion.button>
        )}
      </div>

      {/* Scrubbed Hour Spotlight Banner - Editorial Layout */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-4 mb-6 sm:divide-x divide-white/10">
        <div className="flex-1 min-w-[100px]">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Time Slot
          </div>
          <div className="text-xl sm:text-2xl font-bold text-sky-300 flex items-baseline gap-1.5 mt-0.5">
            <span>{String(activeHour).padStart(2, '0')}:00</span>
            {activeHour === currentLiveHour && selectedHour === null && (
              <span className="text-xs text-sky-400 font-medium">(Live)</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-[100px] sm:pl-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Temperature
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            {tempVal}°{units.temp}
          </div>
        </div>

        <div className="flex-1 min-w-[120px] sm:pl-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Atmosphere
          </div>
          <div className="text-sm sm:text-base font-semibold text-white truncate mt-0.5">
            {condition.label}
          </div>
        </div>

        <div className="flex-1 min-w-[140px] sm:pl-4 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Rain Risk
            </div>
            <div className="text-sm sm:text-base font-semibold text-sky-400 flex items-center gap-1 mt-0.5">
              <CloudRain className="w-3.5 h-3.5" />
              <span>{precipProb}%</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Wind Speed
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
              <Wind className="w-3.5 h-3.5" />
              <span>{windVal} {units.wind}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Draggable Scrubber with Diurnal Sky Bar */}
      <div className="relative pt-4 pb-2">
        {/* Milestone Pin Indicators */}
        <div className="relative w-full h-4 mb-2.5 flex justify-between text-[11px] font-medium text-slate-400 select-none">
          <div className="flex items-center gap-1">
            <Moon className="w-3 h-3 text-indigo-400" />
            <span>00:00</span>
          </div>

          <div
            className="absolute -translate-x-1/2 flex items-center gap-1 text-amber-400"
            style={{ left: `${(sunriseHour / 24) * 100}%` }}
          >
            <Sunrise className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sunrise</span>
          </div>

          <div
            className="absolute -translate-x-1/2 flex items-center gap-1 text-sky-300"
            style={{ left: '50%' }}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Midday</span>
          </div>

          <div
            className="absolute -translate-x-1/2 flex items-center gap-1 text-orange-400"
            style={{ left: `${(sunsetHour / 24) * 100}%` }}
          >
            <Sunset className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sunset</span>
          </div>

          <div className="flex items-center gap-1">
            <Moon className="w-3 h-3 text-indigo-400" />
            <span>23:00</span>
          </div>
        </div>

        {/* Range Slider Track with Diurnal Sky Gradient */}
        <div className="relative flex items-center p-1.5 rounded-xl bg-black/40 border border-white/10 touch-none">
          <div
            className="absolute inset-x-2 h-2.5 rounded-full opacity-60 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, #091224 0%, #311c38 20%, #d97706 28%, #38bdf8 50%, #ea580c 72%, #221430 82%, #091224 100%)',
            }}
          />
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={activeHour}
            onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
            className="w-full h-8 appearance-none cursor-ew-resize relative z-10 focus:outline-none touch-none"
            style={{ touchAction: 'none' }}
            aria-label="Select hour of the day"
          />
        </div>
      </div>
    </div>
  );
}
