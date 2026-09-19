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
            </motion.button>
          );
        })}
      </div>

      {/* Interactive Detailed Hour Inspection Drawer */}
      <AnimatePresence>
        {selectedHour !== null && weather.hourly?.temperature_2m && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 glass-panel rounded-2xl p-4 sm:p-5 border border-sky-500/30 overflow-hidden"
          >
            {(() => {
              const hIdx = selectedHour;
              const wCode = weather.hourly.weather_code?.[hIdx] ?? 0;
              const wmo = getWmoInfo(wCode);
              const IconComp = ICON_MAP[wmo.icon] || Cloud;
              const tempC = weather.hourly.temperature_2m[hIdx];
              const appC = weather.hourly.apparent_temperature?.[hIdx] ?? tempC;
              const tDisp = units.temp === 'F' ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC);
              const appDisp = units.temp === 'F' ? Math.round((appC * 9) / 5 + 32) : Math.round(appC);
              const pProb = weather.hourly.precipitation_probability?.[hIdx] ?? 0;
              const pSum = weather.hourly.precipitation?.[hIdx] ?? 0;
              const hum = weather.hourly.relative_humidity_2m?.[hIdx] ?? 0;
              const dewC = weather.hourly.dew_point_2m?.[hIdx] ?? null;
              const dewDisp = dewC !== null ? `${units.temp === 'F' ? Math.round((dewC * 9) / 5 + 32) : Math.round(dewC)}°${units.temp}` : 'N/A';
              const wSpeed = weather.hourly.wind_speed_10m?.[hIdx] ?? 0;
              const wSpeedDisp = units.wind === 'mph' ? Math.round(wSpeed * 0.621371) : Math.round(wSpeed);
              const wDir = weather.hourly.wind_direction_10m?.[hIdx];
              const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
              const dirName = wDir !== undefined ? dirs[Math.round(wDir / 22.5) % 16] : '';
              const uv = weather.hourly.uv_index?.[hIdx];
              const visM = weather.hourly.visibility?.[hIdx];
              const visDisp = visM ? (units.wind === 'mph' ? `${(visM / 1609.34).toFixed(1)} mi` : `${(visM / 1000).toFixed(1)} km`) : 'N/A';
              const press = weather.hourly.surface_pressure?.[hIdx];

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
                            {String(hIdx).padStart(2, '0')}:00 Inspection
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium">
                            Scrubbing Active
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          {wmo.label} · Ambient {tDisp}°{units.temp} (Feels like {appDisp}°{units.temp})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedHour(null)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      Reset to Live
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-[11px] text-slate-400 block">Precipitation</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {pProb}% ({pSum.toFixed(1)} mm)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-[11px] text-slate-400 block">Humidity & Dew</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {hum}% · {dewDisp}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-[11px] text-slate-400 block">Wind Flow</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {wSpeedDisp} {units.wind} {dirName}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-[11px] text-slate-400 block">UV Index</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {uv !== undefined && uv !== null ? uv.toFixed(1) : '0.0'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-[11px] text-slate-400 block">Visibility</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {visDisp}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-[11px] text-slate-400 block">Surface Pressure</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {press ? `${Math.round(press)} hPa` : 'N/A'}
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
