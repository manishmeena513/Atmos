import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
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

export function SevenDayForecast() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);
  const [expandedIndex, setExpandedIndex] = useState(0); // Today expanded by default

  if (!weather?.daily?.time) return null;

  const daysCount = Math.min(7, weather.daily.time.length);
  const daysData = [];

  // Global min & max across the week for temperature bar scaling
  const allMax = weather.daily.temperature_2m_max.slice(0, daysCount);
  const allMin = weather.daily.temperature_2m_min.slice(0, daysCount);
  const weekMax = Math.max(...allMax);
  const weekMin = Math.min(...allMin);

  for (let i = 0; i < daysCount; i++) {
    const rawDate = new Date(weather.daily.time[i] + 'T00:00:00');
    let dayName = rawDate.toLocaleDateString('en-US', { weekday: 'short' });
    if (i === 0) dayName = 'Today';
    else if (i === 1) dayName = 'Tomorrow';

    const maxC = weather.daily.temperature_2m_max[i];
    const minC = weather.daily.temperature_2m_min[i];

    const maxTemp =
      units.temp === 'F' ? Math.round((maxC * 9) / 5 + 32) : Math.round(maxC);
    const minTemp =
      units.temp === 'F' ? Math.round((minC * 9) / 5 + 32) : Math.round(minC);

    const wmo = getWmoInfo(weather.daily.weather_code[i]);
    const precipProb = weather.daily.precipitation_probability_max?.[i] ?? 0;
    const precipSum = weather.daily.precipitation_sum?.[i] ?? 0;
    const windMax = weather.daily.wind_speed_10m_max?.[i] ?? 0;
    const uvMax = weather.daily.uv_index_max?.[i] ?? 0;

    const sunriseStr = weather.daily.sunrise?.[i]
      ? new Date(weather.daily.sunrise[i]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: units.clock === '12h' })
      : '--:--';
    const sunsetStr = weather.daily.sunset?.[i]
      ? new Date(weather.daily.sunset[i]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: units.clock === '12h' })
      : '--:--';

    daysData.push({
      index: i,
      dayName,
      dateFormatted: rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      maxTemp,
      minTemp,
      maxC,
      minC,
      wmo,
      precipProb,
      precipSum,
      windMax,
      uvMax,
      sunriseStr,
      sunsetStr,
    });
  }

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">
            7-Day Outlook
          </h3>
        </div>
        <span className="text-xs text-slate-400">Detailed forecast</span>
      </div>

      <div className="space-y-2">
        {daysData.map((d) => {
          const isExpanded = expandedIndex === d.index;
          const IconComp = ICON_MAP[d.wmo.icon] || Cloud;

          // Bar positioning
          const range = Math.max(1, weekMax - weekMin);
          const leftPercent = ((d.minC - weekMin) / range) * 100;
          const widthPercent = Math.max(12, ((d.maxC - d.minC) / range) * 100);

          return (
            <div
              key={d.index}
              className={`rounded-2xl transition-all duration-200 overflow-hidden border ${
                isExpanded
                  ? 'bg-white/[0.05] border-white/15'
                  : 'bg-transparent hover:bg-white/[0.02] border-transparent'
              }`}
            >
              {/* Row Header Button */}
              <button
                onClick={() => toggleExpand(d.index)}
                className="w-full min-h-[52px] px-3.5 sm:px-4 py-3 flex items-center justify-between gap-2.5 sm:gap-3 text-left cursor-pointer select-none"
                aria-expanded={isExpanded}
              >
                {/* Day name & Date */}
                <div className="w-20 sm:w-28 shrink-0">
                  <div className="text-sm font-semibold text-white">
                    {d.dayName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {d.dateFormatted}
                  </div>
                </div>

                {/* Condition Icon & Label */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="text-sky-400 shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-300 truncate hidden sm:inline">
                    {d.wmo.label}
                  </span>
                </div>

                {/* Precipitation % */}
                <div className="w-11 sm:w-14 text-right shrink-0">
                  {d.precipProb > 0 ? (
                    <span className="text-xs font-medium text-sky-400 flex items-center justify-end gap-0.5">
                      <Droplets className="w-3 h-3" />
                      {d.precipProb}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">0%</span>
                  )}
                </div>

                {/* Min / Max Temperature & Graphical Bar */}
                <div className="flex items-center gap-1.5 sm:gap-3 w-auto sm:w-56 shrink-0 justify-end">
                  <span className="text-xs sm:text-sm font-medium text-slate-400 w-6 sm:w-7 text-right">
                    {d.minTemp}°
                  </span>

                  {/* Relative temperature range bar */}
                  <div className="relative flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-white w-6 sm:w-7 text-right">
                    {d.maxTemp}°
                  </span>
                </div>

                {/* Chevron */}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Accordion Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/[0.02]">
                        <div className="text-slate-400 flex items-center gap-1 mb-1">
                          <Wind className="w-3.5 h-3.5 text-sky-400" />
                          <span>Wind Peak</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {units.wind === 'mph'
                            ? `${Math.round(d.windMax * 0.621371)} mph`
                            : `${Math.round(d.windMax)} km/h`}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/[0.02]">
                        <div className="text-slate-400 flex items-center gap-1 mb-1">
                          <Droplets className="w-3.5 h-3.5 text-blue-400" />
                          <span>Rainfall Sum</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {d.precipSum.toFixed(1)} mm
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/[0.02]">
                        <div className="text-slate-400 flex items-center gap-1 mb-1">
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>UV Index Max</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {d.uvMax ? d.uvMax.toFixed(1) : 'Low'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/[0.02]">
                        <div className="text-slate-400 flex items-center gap-1 mb-1">
                          <Sunrise className="w-3.5 h-3.5 text-amber-300" />
                          <span>Sunrise</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {d.sunriseStr}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/[0.02]">
                        <div className="text-slate-400 flex items-center gap-1 mb-1">
                          <Sunset className="w-3.5 h-3.5 text-orange-400" />
                          <span>Sunset</span>
                        </div>
                        <div className="font-semibold text-slate-200">
                          {d.sunsetStr}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
