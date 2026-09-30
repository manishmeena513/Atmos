import React from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  Shirt,
  Gauge,
  Umbrella,
  Wind,
  Sun,
  Thermometer,
  Droplets,
  Info,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

function formatHourShort(hour24, clock = '12h') {
  if (clock === '24h') return `${String(hour24).padStart(2, '0')}:00`;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12} ${period}`;
}

export function DayIntelligenceGrid() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);

  if (!weather?.current) return null;

  const { current, hourly } = weather;
  const currentHour = new Date().getHours();

  const toDispTemp = (c) =>
    units.temp === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c);
  const toDispWind = (kmh) =>
    units.wind === 'mph' ? Math.round(kmh * 0.621371) : Math.round(kmh);

  // ============================================================================
  // 1. RAIN INTELLIGENCE
  // ============================================================================
  const precipArray = hourly?.precipitation_probability
    ? hourly.precipitation_probability.slice(0, 24)
    : null;

  let rainHeadline = 'Rain forecast unavailable.';
  let rainSubtext = 'Hourly precipitation probability data is currently unavailable.';
  let peakRainProb = 0;

  if (precipArray && precipArray.length > 0) {
    peakRainProb = Math.max(...precipArray);
    const futureSlice = precipArray.slice(currentHour, 24);
    const futureMax = futureSlice.length > 0 ? Math.max(...futureSlice) : 0;

    // Find start and end of elevated rain window (>= 35%)
    let windowStart = -1;
    let windowEnd = -1;
    for (let h = currentHour; h < 24; h++) {
      if (precipArray[h] >= 35) {
        if (windowStart === -1) windowStart = h;
        windowEnd = h;
      } else if (windowStart !== -1) {
        break;
      }
    }

    if ((current.precipitation || 0) > 0) {
      rainHeadline = `Active precipitation detected (${current.precipitation.toFixed(1)} mm/h).`;
      rainSubtext =
        windowEnd > currentHour
          ? `Rain probability remains elevated through ${formatHourShort(windowEnd, units.clock)}.`
          : 'Showers are passing through your location right now.';
    } else if (windowStart !== -1) {
      if (windowStart === windowEnd) {
        rainHeadline = `Rain probability rises around ${formatHourShort(windowStart, units.clock)} (${precipArray[windowStart]}%).`;
      } else {
        rainHeadline = `Rain probability increases between ${formatHourShort(windowStart, units.clock)} and ${formatHourShort(windowEnd + 1, units.clock)}.`;
      }
      rainSubtext = `Peak precipitation probability reaches ${futureMax}% during this window.`;
    } else if (futureMax >= 15) {
      const peakH = precipArray.indexOf(futureMax);
      rainHeadline = `Slight rain chance (${futureMax}%) around ${formatHourShort(peakH, units.clock)}.`;
      rainSubtext = 'Most of the day remains dry with low shower potential.';
    } else {
      rainHeadline = 'No significant rain expected across the next 24 hours.';
      rainSubtext = `Maximum precipitation probability stays low at ${peakRainProb}%.`;
    }
  }

  // ============================================================================
  // 2. WHAT SHOULD I WEAR? (Clothing Suggestions)
  // ============================================================================
  const tempC = current.temperature_2m;
  const feelsC = current.apparent_temperature;
  const eveningC = hourly?.temperature_2m?.[20] ?? tempC;
  const windKmh = current.wind_speed_10m || 0;
  const humidity = current.relative_humidity_2m || 0;
  const currentPrecipProb = precipArray ? Math.max(...precipArray.slice(currentHour, Math.min(24, currentHour + 8))) : 0;
  const uvPeak = hourly?.uv_index
    ? Math.max(current.uv_index || 0, ...hourly.uv_index.slice(currentHour, 18))
    : current.uv_index || 0;

  let primaryClothing = 'Wear comfortable everyday clothing.';
  if (feelsC >= 30) {
    primaryClothing = 'Wear light, breathable clothing such as cotton or linen.';
  } else if (feelsC >= 23) {
    primaryClothing = 'Wear light clothing suited for warm conditions.';
  } else if (feelsC >= 16) {
    primaryClothing = 'Wear comfortable mild-weather layers or a light shirt.';
  } else if (feelsC >= 9) {
    primaryClothing = 'Wear a warm jacket, sweater, or layered outerwear.';
  } else {
    primaryClothing = 'Wear a heavy insulated coat and warm thermal layers.';
  }

  const clothingTips = [];
  if (tempC - eveningC >= 3.5 && eveningC < 19) {
    clothingTips.push(
      `Consider carrying a light jacket this evening as temperatures cool to ${toDispTemp(eveningC)}°${units.temp}.`
    );
  }
  if ((current.precipitation || 0) > 0 || currentPrecipProb >= 35) {
    clothingTips.push(
      `An umbrella may be useful because rain probability is elevated (${currentPrecipProb}%).`
    );
  }
  if (windKmh >= 24) {
    clothingTips.push(
      `A windbreaker is helpful with sustained winds at ${toDispWind(windKmh)} ${units.wind}.`
    );
  }
  if (uvPeak >= 6 && current.is_day) {
    clothingTips.push(
      `Sunglasses or a hat are advisable as UV reaches ${uvPeak.toFixed(1)}.`
    );
  }
  if (humidity >= 75 && tempC >= 24) {
    clothingTips.push(
      `Loose, moisture-wicking fabrics will feel best in ${humidity}% humidity.`
    );
  }
  if (clothingTips.length === 0) {
    clothingTips.push(
      `Conditions are stable around ${toDispTemp(feelsC)}°${units.temp} with no special rain or wind gear required.`
    );
  }

  // ============================================================================
  // 3. ATMOS COMFORT INDICATOR
  // ============================================================================
  // Rule-based subscores (0 - 100)
  // Temperature: ideal 18C - 24C
  let tempScore = 100;
  if (feelsC < 18) tempScore = Math.max(15, Math.round(100 - (18 - feelsC) * 4.5));
  else if (feelsC > 24) tempScore = Math.max(15, Math.round(100 - (feelsC - 24) * 5.5));

  // Humidity: ideal 35% - 55%
  let humScore = 100;
  if (humidity > 55) humScore = Math.max(20, Math.round(100 - (humidity - 55) * 1.6));
  else if (humidity < 30) humScore = Math.max(40, Math.round(100 - (30 - humidity) * 1.5));

  // Wind: ideal <= 15 km/h
  let windScore = 100;
  if (windKmh > 15) windScore = Math.max(15, Math.round(100 - (windKmh - 15) * 2.2));

  // Rain: 0% is 100
  const activeRainProb = precipArray?.[currentHour] ?? 0;
  const rainScore = (current.precipitation || 0) > 0
    ? Math.max(15, 50 - Math.round(current.precipitation * 10))
    : Math.max(20, 100 - activeRainProb);

  // UV: 0-3 is 100
  const uvVal = current.uv_index || 0;
  const uvScore = uvVal <= 3 ? 100 : Math.max(20, Math.round(100 - (uvVal - 3) * 9));

  const comfortScore = Math.round(
    tempScore * 0.35 +
      humScore * 0.2 +
      windScore * 0.15 +
      rainScore * 0.2 +
      uvScore * 0.1
  );

  let comfortLabel = 'High Comfort';
  let comfortColor = 'text-emerald-400';
  if (comfortScore >= 82) {
    comfortLabel = 'Optimal Comfort';
    comfortColor = 'text-emerald-400';
  } else if (comfortScore >= 65) {
    comfortLabel = 'Comfortable';
    comfortColor = 'text-sky-400';
  } else if (comfortScore >= 45) {
    comfortLabel = 'Moderate';
    comfortColor = 'text-amber-400';
  } else {
    comfortLabel = 'Challenging';
    comfortColor = 'text-rose-400';
  }

  const comfortFactors = [
    { label: 'Temperature', value: `${toDispTemp(feelsC)}°${units.temp}`, score: tempScore, icon: Thermometer },
    { label: 'Humidity', value: `${humidity}%`, score: humScore, icon: Droplets },
    { label: 'Wind', value: `${toDispWind(windKmh)} ${units.wind}`, score: windScore, icon: Wind },
    { label: 'Rain', value: `${activeRainProb}%`, score: rainScore, icon: Umbrella },
    { label: 'UV', value: uvVal.toFixed(1), score: uvScore, icon: Sun },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CARD 1: RAIN INTELLIGENCE */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between border border-white/10"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                <CloudRain className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                Rain Intelligence
              </h3>
            </div>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              {precipArray ? `Peak ${peakRainProb}%` : 'Unavailable'}
            </span>
          </div>

          <p className="text-base sm:text-lg font-semibold text-white leading-snug">
            {rainHeadline}
          </p>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {rainSubtext}
          </p>

          {/* 24-Hour Visual Precipitation Timeline */}
          {precipArray ? (
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="flex items-end justify-between gap-1 h-20 px-1">
                {precipArray.map((prob, idx) => {
                  const isNow = idx === currentHour;
                  const heightPct = Math.max(8, prob);
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      title={`${formatHourShort(idx, units.clock)}: ${prob}% rain probability`}
                    >
                      <div
                        className={`w-full rounded-t-sm transition-all ${
                          prob >= 50
                            ? 'bg-sky-400'
                            : prob >= 25
                            ? 'bg-sky-400/60'
                            : 'bg-white/15'
                        } ${isNow ? 'ring-1 ring-amber-400' : ''}`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                <span>{formatHourShort(0, units.clock)}</span>
                <span>{formatHourShort(6, units.clock)}</span>
                <span>{formatHourShort(12, units.clock)}</span>
                <span>{formatHourShort(18, units.clock)}</span>
                <span>{formatHourShort(23, units.clock)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 text-center">
              Rain forecast unavailable.
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
          <span>24-Hour Precipitation Probability</span>
          <span>Live Open-Meteo Model</span>
        </div>
      </motion.div>

      {/* CARD 2: WHAT SHOULD I WEAR? */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.06 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between border border-white/10"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Shirt className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                What Should I Wear?
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Feels {toDispTemp(feelsC)}°{units.temp}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-4">
            <p className="text-sm sm:text-base font-semibold text-white leading-snug">
              {primaryClothing}
            </p>
          </div>

          <div className="space-y-2.5">
            {clothingTips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Based strictly on temperature, wind, and rain conditions.</span>
        </div>
      </motion.div>

      {/* CARD 3: ATMOS COMFORT */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between border border-white/10"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Gauge className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                Atmos Comfort
              </h3>
            </div>
            <span className={`text-xs font-bold ${comfortColor}`}>
              {comfortLabel}
            </span>
          </div>

          {/* Score Readout */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {comfortScore}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>

          {/* 5-Factor Breakdown */}
          <div className="space-y-2.5">
            {comfortFactors.map((f) => {
              const IconComp = f.icon;
              return (
                <div key={f.label} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-sky-400" />
                      {f.label}
                    </span>
                    <span className="text-slate-400 font-medium">{f.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        f.score >= 75
                          ? 'bg-emerald-400'
                          : f.score >= 50
                          ? 'bg-sky-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 leading-normal">
          Atmos-generated indicator calculated from weather thresholds — not a scientific or medical score.
        </div>
      </motion.div>
    </div>
  );
}

export default DayIntelligenceGrid;
