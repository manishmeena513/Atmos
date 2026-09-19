import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';

const ICON_MAP = {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
};

export function HourlyForecast() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);
  const selectedHour = useWeatherStore((s) => s.selectedHour);
  const setSelectedHour = useWeatherStore((s) => s.setSelectedHour);

  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!weather?.hourly?.time) return null;

  const currentHour = new Date().getHours();
  // Display next 24 hours starting from current hour or full day
  const hoursData = [];
  for (let i = 0; i < 24; i++) {
    const timeStr = weather.hourly.time[i];
    const tempC = weather.hourly.temperature_2m[i];
    const apparentC = weather.hourly.apparent_temperature?.[i] ?? tempC;
    const precipProb = weather.hourly.precipitation_probability?.[i] ?? 0;
    const weatherCode = weather.hourly.weather_code?.[i] ?? 0;
    const windSpeed = weather.hourly.wind_speed_10m?.[i] ?? 0;
    const humidity = weather.hourly.relative_humidity_2m?.[i] ?? 0;

    hoursData.push({
      index: i,
      timeStr,
      tempC,
      apparentC,
      precipProb,
      weatherCode,
      windSpeed,
      humidity,
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-semibold text-white tracking-tight">
          Hourly Forecast
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Tap any hour to test atmosphere
        </span>
      </div>

      {/* Horizontal Scroll Snap Track */}
      <div
        className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none no-scrollbar touch-pan-x overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {hoursData.map((h) => {
          const wmo = getWmoInfo(h.weatherCode);
          const IconComp = ICON_MAP[wmo.icon] || Cloud;

          const isCurrent = h.index === currentHour;
          const isSelected = selectedHour === h.index;

          const temp =
            units.temp === 'F'
              ? Math.round((h.tempC * 9) / 5 + 32)
              : Math.round(h.tempC);

          const apparent =
            units.temp === 'F'
              ? Math.round((h.apparentC * 9) / 5 + 32)
              : Math.round(h.apparentC);

          const wind =
            units.wind === 'mph'
              ? Math.round(h.windSpeed * 0.621371)
              : Math.round(h.windSpeed);

          return (
            <motion.button
              key={h.index}
              onClick={() => setSelectedHour(isSelected ? null : h.index)}
              onMouseEnter={() => setHoveredIdx(h.index)}
              onMouseLeave={() => setHoveredIdx(null)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`snap-start shrink-0 w-28 sm:w-32 min-h-[148px] rounded-2xl p-3.5 flex flex-col items-center justify-between text-center transition-all duration-300 relative overflow-hidden select-none cursor-pointer ${
                isSelected
                  ? 'bg-sky-500/20 border-sky-400/50 shadow-[0_0_24px_rgba(56,189,248,0.2)]'
                  : isCurrent
                  ? 'bg-white/10 border-white/20'
                  : 'glass-panel hover:border-white/20'
              }`}
            >
              {/* Header Label (Time) */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-200">
                  {String(h.index).padStart(2, '0')}:00
                </span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                )}
              </div>

              {/* Weather Icon */}
              <div className="my-3 text-sky-400 flex items-center justify-center">
                <IconComp className="w-7 h-7" />
              </div>

              {/* Temperature */}
              <div className="text-xl font-bold text-white mb-1">
                {temp}°
              </div>

              {/* Precipitation Probability Pill */}
              <div className="min-h-[20px] flex items-center">
                {h.precipProb > 0 ? (
                  <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-0.5">
                    <Droplets className="w-3 h-3 shrink-0" />
                    {h.precipProb}%
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Dry
                  </span>
                )}
              </div>

              {/* Expanded Hover/Selected Detail Tray */}
              <AnimatePresence>
                {(isSelected || hoveredIdx === h.index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 pt-2 border-t border-white/10 w-full text-[10px] text-slate-300 space-y-1"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-400">Feels</span>
                      <span>{apparent}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wind</span>
                      <span>{wind} {units.wind}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
