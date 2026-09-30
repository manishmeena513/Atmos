import React from 'react';
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
  Moon,
  Wind,
  Droplets,
  Clock,
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
  Moon,
};

function formatTimelineHour(hour24, clockFormat = '24h') {
  if (clockFormat === '12h') {
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${String(h12).padStart(2, '0')} ${period}`;
  }
  return `${String(hour24).padStart(2, '0')}:00`;
}

export function HourlyForecast() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);
  const selectedHour = useWeatherStore((s) => s.selectedHour);
  const setSelectedHour = useWeatherStore((s) => s.setSelectedHour);

  if (!weather?.hourly?.time) return null;

  const currentHour = new Date().getHours();
  const hoursData = [];

  for (let i = 0; i < 24; i++) {
    const timeStr = weather.hourly.time[i];
    const tempC = weather.hourly.temperature_2m[i];
    const apparentC = weather.hourly.apparent_temperature?.[i] ?? tempC;
    const precipProb = weather.hourly.precipitation_probability?.[i] ?? 0;
    const weatherCode = weather.hourly.weather_code?.[i] ?? 0;
    const windSpeed = weather.hourly.wind_speed_10m?.[i] ?? 0;
    const windGusts = weather.hourly.wind_gusts_10m?.[i] ?? null;
    const humidity = weather.hourly.relative_humidity_2m?.[i] ?? 0;
    const isDay = weather.hourly.is_day?.[i] ?? (i >= 6 && i < 19 ? 1 : 0);

    hoursData.push({
      index: i,
      timeStr,
      tempC,
      apparentC,
      precipProb,
      weatherCode,
      windSpeed,
      windGusts,
      humidity,
      isDay,
    });
  }

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              24-Hour Weather Timeline
            </h3>
            <p className="text-xs text-slate-400">
              Select any hour to inspect detailed conditions and preview the atmosphere
            </p>
          </div>
        </div>

        {selectedHour !== null && (
          <button
            onClick={() => setSelectedHour(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 transition-colors cursor-pointer"
          >
            Reset to Live
          </button>
        )}
      </div>

      {/* Horizontal Scroll Snap Track */}
      <div
        className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none no-scrollbar touch-pan-x overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {hoursData.map((h) => {
          const wmo = getWmoInfo(h.weatherCode);
          const iconKey = !h.isDay && h.weatherCode <= 2 ? 'Moon' : wmo.icon;
          const IconComp = ICON_MAP[iconKey] || Cloud;

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
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isSelected}
              className={`snap-start shrink-0 w-28 sm:w-32 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center transition-all duration-200 relative overflow-hidden select-none cursor-pointer border ${
                isSelected
                  ? 'bg-sky-500/20 border-sky-400/60 shadow-[0_0_24px_rgba(56,189,248,0.18)]'
                  : isCurrent
                  ? 'bg-white/[0.09] border-white/25'
                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
              }`}
            >
              {/* Header Label (Time) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200">
                  {isCurrent ? 'Now' : formatTimelineHour(h.index, units.clock)}
                </span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                )}
              </div>

              {/* Weather Icon */}
              <div className={`my-2.5 flex items-center justify-center ${!h.isDay && h.weatherCode <= 2 ? 'text-indigo-300' : 'text-sky-400'}`}>
                <IconComp className="w-7 h-7" />
              </div>

              {/* Temperature & Feels-Like */}
              <div>
                <div className="text-xl font-bold text-white leading-tight">
                  {temp}°
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Feels {apparent}°
                </div>
              </div>

              {/* Precipitation Probability & Wind */}
              <div className="mt-2.5 pt-2 border-t border-white/5 w-full flex items-center justify-between text-[10px]">
                {h.precipProb > 0 ? (
                  <span className="font-semibold text-sky-400 flex items-center gap-0.5">
                    <Droplets className="w-3 h-3 shrink-0" />
                    {h.precipProb}%
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Dry</span>
                )}

                <span className="text-slate-400 flex items-center gap-0.5">
                  <Wind className="w-2.5 h-2.5" />
                  {wind}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Interactive Detailed Hour Inspection Panel */}
      <AnimatePresence>
        {selectedHour !== null && weather.hourly?.temperature_2m && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-2xl p-4 sm:p-5 bg-white/[0.04] border border-sky-500/30 overflow-hidden"
          >
            {(() => {
              const hIdx = selectedHour;
              const wCode = weather.hourly.weather_code?.[hIdx] ?? 0;
              const wmo = getWmoInfo(wCode);
              const isDay = weather.hourly.is_day?.[hIdx] ?? (hIdx >= 6 && hIdx < 19 ? 1 : 0);
              const IconComp = !isDay && wCode <= 2 ? Moon : ICON_MAP[wmo.icon] || Cloud;

              const tempC = weather.hourly.temperature_2m[hIdx];
              const appC = weather.hourly.apparent_temperature?.[hIdx] ?? tempC;
              const tDisp = units.temp === 'F' ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC);
              const appDisp = units.temp === 'F' ? Math.round((appC * 9) / 5 + 32) : Math.round(appC);
              const pProb = weather.hourly.precipitation_probability?.[hIdx] ?? 0;
              const pSum = weather.hourly.precipitation?.[hIdx] ?? 0;
              const hum = weather.hourly.relative_humidity_2m?.[hIdx] ?? 0;
              const wSpeed = weather.hourly.wind_speed_10m?.[hIdx] ?? 0;
              const wSpeedDisp = units.wind === 'mph' ? Math.round(wSpeed * 0.621371) : Math.round(wSpeed);
              const wGusts = weather.hourly.wind_gusts_10m?.[hIdx] ?? null;
              const wGustsDisp =
                wGusts !== null && wGusts !== undefined
                  ? `${units.wind === 'mph' ? Math.round(wGusts * 0.621371) : Math.round(wGusts)} ${units.wind}`
                  : 'Unavailable';
              const wDir = weather.hourly.wind_direction_10m?.[hIdx];
              const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
              const dirName = wDir !== undefined ? dirs[Math.round(wDir / 22.5) % 16] : '';
              const uv = weather.hourly.uv_index?.[hIdx];

              return (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">
                            {formatTimelineHour(hIdx, units.clock)} Forecast Detail
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium">
                            {wmo.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          Temperature {tDisp}°{units.temp} · Feels like {appDisp}°{units.temp}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedHour(null)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      Close Detail
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Temperature</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {tDisp}°{units.temp} (Feels {appDisp}°)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Humidity</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {hum}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Precipitation</span>
                      <span className="font-semibold text-sky-300 mt-0.5 block">
                        {pProb}% ({pSum.toFixed(1)} mm)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Sustained Wind</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {wSpeedDisp} {units.wind} {dirName}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Wind Gusts</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {wGustsDisp}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">UV Index</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {uv !== undefined && uv !== null ? uv.toFixed(1) : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
