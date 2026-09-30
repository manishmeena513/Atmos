import React from 'react';
import { motion } from 'framer-motion';
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
  Sparkles,
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

function formatHourLabel(hour24, clockFormat = '12h') {
  if (clockFormat === '24h') {
    return `${String(hour24).padStart(2, '0')}:00`;
  }
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12} ${period}`;
}

export function generateDailyBriefData(weather, units) {
  if (!weather?.current || !weather?.hourly) return null;

  const { current, hourly, daily, timezone } = weather;

  // Determine local hour in city timezone
  let localHour = new Date().getHours();
  try {
    if (timezone) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      }).formatToParts(new Date());
      const hourPart = parts.find((p) => p.type === 'hour');
      if (hourPart) {
        localHour = parseInt(hourPart.value, 10) % 24;
      }
    }
  } catch {
    // Fallback to device hour
  }

  let greeting = 'GOOD MORNING';
  if (localHour >= 5 && localHour < 12) greeting = 'GOOD MORNING';
  else if (localHour >= 12 && localHour < 17) greeting = 'GOOD AFTERNOON';
  else if (localHour >= 17 && localHour < 21) greeting = 'GOOD EVENING';
  else greeting = 'GOOD NIGHT';

  const wmo = getWmoInfo(current.weather_code);
  const tempC = current.temperature_2m;

  // Clause 1: Current condition & thermal feel
  let feelWord = 'comfortable conditions';
  if (tempC >= 33) feelWord = 'hot conditions';
  else if (tempC >= 26) feelWord = 'warm conditions';
  else if (tempC >= 17) feelWord = 'comfortable conditions';
  else if (tempC >= 9) feelWord = 'cool conditions';
  else feelWord = 'cold conditions';

  const firstClause = `${wmo.label} with ${feelWord}.`;

  // Clause 2: Look ahead from localHour to 23
  let secondClause = 'Conditions remain steady through the rest of the day.';
  const precipProbs = hourly.precipitation_probability || [];
  const temps = hourly.temperature_2m || [];
  const winds = hourly.wind_speed_10m || [];

  // Check if rain probability spikes later today
  let rainSpikeHour = -1;
  let maxFuturePrecip = 0;
  for (let h = localHour + 1; h < 24; h++) {
    const p = precipProbs[h] ?? 0;
    if (p > maxFuturePrecip) {
      maxFuturePrecip = p;
      if (p >= 40 && rainSpikeHour === -1) {
        rainSpikeHour = h;
      }
    }
  }

  if ((current.precipitation || 0) > 0) {
    secondClause = 'Active precipitation is currently falling in your area.';
  } else if (rainSpikeHour !== -1) {
    secondClause = `Rain chances increase after ${formatHourLabel(rainSpikeHour, units?.clock || '12h')} (${maxFuturePrecip}% probability).`;
  } else {
    // Check meaningful temperature shift
    const maxTodayC = daily?.temperature_2m_max?.[0] ?? tempC;
    const eveningTempC = temps[21] ?? tempC;
    if (localHour < 14 && maxTodayC - tempC >= 3) {
      const highDisp = units?.temp === 'F' ? Math.round((maxTodayC * 9) / 5 + 32) : Math.round(maxTodayC);
      secondClause = `Temperatures rise toward ${highDisp}°${units?.temp || 'C'} this afternoon.`;
    } else if (tempC - eveningTempC >= 3.5) {
      const eveDisp = units?.temp === 'F' ? Math.round((eveningTempC * 9) / 5 + 32) : Math.round(eveningTempC);
      secondClause = `Expect skies to cool down to ${eveDisp}°${units?.temp || 'C'} by tonight.`;
    } else if (Math.max(...winds.slice(localHour, 24)) >= 28) {
      secondClause = 'Breezy winds will pick up later today.';
    }
  }

  // Build 4 Diurnal Periods from actual hourly slices
  const periodsConfig = [
    { id: 'morning', label: 'Morning', range: [6, 7, 8, 9, 10, 11], isNight: false },
    { id: 'afternoon', label: 'Afternoon', range: [12, 13, 14, 15, 16], isNight: false },
    { id: 'evening', label: 'Evening', range: [17, 18, 19, 20], isNight: false },
    { id: 'night', label: 'Night', range: [21, 22, 23], isNight: true },
  ];

  const periods = periodsConfig.map((p) => {
    const validHours = p.range.filter((h) => temps[h] !== undefined);
    const avgC =
      validHours.length > 0
        ? validHours.reduce((acc, h) => acc + temps[h], 0) / validHours.length
        : tempC;
    const maxP =
      validHours.length > 0
        ? Math.max(...validHours.map((h) => precipProbs[h] ?? 0))
        : 0;
    const midHour = validHours[Math.floor(validHours.length / 2)] ?? 12;
    const code = hourly.weather_code?.[midHour] ?? current.weather_code;
    const pWmo = getWmoInfo(code);

    const tempDisplay =
      units?.temp === 'F' ? Math.round((avgC * 9) / 5 + 32) : Math.round(avgC);

    let descriptor = 'Comfortable';
    if (maxP >= 55) descriptor = 'Rain likely';
    else if (maxP >= 30) descriptor = 'Rain possible';
    else if (avgC >= 33) descriptor = 'Hot';
    else if (avgC >= 26) descriptor = 'Warm';
    else if (avgC >= 18) descriptor = 'Comfortable';
    else if (avgC >= 12) descriptor = p.id === 'night' ? 'Cooler' : 'Mild';
    else descriptor = 'Chilly';

    const isActivePeriod = p.range.includes(localHour);

    return {
      id: p.id,
      label: p.label,
      tempDisplay,
      maxPrecip: maxP,
      descriptor,
      iconName: p.isNight && code <= 2 ? 'Moon' : pWmo.icon,
      conditionLabel: pWmo.label,
      isActivePeriod,
      representativeHour: midHour,
    };
  });

  return {
    greeting,
    narrative: `${firstClause} ${secondClause}`,
    firstClause,
    secondClause,
    periods,
    localHour,
  };
}

export function DailyBrief() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);
  const selectedHour = useWeatherStore((s) => s.selectedHour);
  const setSelectedHour = useWeatherStore((s) => s.setSelectedHour);

  const brief = generateDailyBriefData(weather, units);
  if (!brief) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-7xl mx-auto mt-4"
    >
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest text-sky-300">
              Atmos Daily Brief
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Tap any part of the day to inspect
          </span>
        </div>

        {/* 4-Part Diurnal Progression Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {brief.periods.map((period) => {
            const IconComp = period.iconName === 'Moon' ? Moon : ICON_MAP[period.iconName] || Sun;
            const isSelected = selectedHour === period.representativeHour;

            return (
              <button
                key={period.id}
                onClick={() =>
                  setSelectedHour(isSelected ? null : period.representativeHour)
                }
                className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400/50 shadow-lg shadow-sky-500/10'
                    : period.isActivePeriod
                    ? 'bg-white/[0.07] border-white/20 hover:bg-white/[0.1]'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-300">
                      {period.label}
                    </span>
                    {period.isActivePeriod && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300">
                        Now
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1 truncate">
                    {period.descriptor}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{period.conditionLabel}</span>
                    {period.maxPrecip >= 25 && (
                      <span className="text-sky-400 font-medium">
                        · {period.maxPrecip}% rain
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-white mt-1.5">
                    {period.tempDisplay}°{units.temp}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default DailyBrief;
