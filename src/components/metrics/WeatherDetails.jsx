import React from 'react';
import { motion } from 'framer-motion';
import {
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Sun,
  Wind,
  CloudRain,
  Sunrise,
  Sunset,
  Sparkles,
  Info,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

function getCompassDirection(deg) {
  if (deg === undefined || deg === null) return 'N/A';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return dirs[index];
}

function getUvRisk(uv) {
  if (uv === undefined || uv === null) return { tier: 'Unavailable', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', advice: 'No UV telemetry available.' };
  if (uv < 3) return { tier: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', advice: 'Minimal risk. No special sun protection required.' };
  if (uv < 6) return { tier: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', advice: 'Moderate risk. Wear sunglasses and seek shade near midday.' };
  if (uv < 8) return { tier: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', advice: 'High risk of harm. Apply SPF 30+ sunscreen and wear a wide hat.' };
  if (uv < 11) return { tier: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', advice: 'Very high risk. Minimize direct sun exposure between 10am and 4pm.' };
  return { tier: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', advice: 'Extreme risk. Take all precautions; unprotected skin burns rapidly.' };
}

function getDewPointComfort(dewC) {
  if (dewC === undefined || dewC === null) return 'Telemetry unavailable.';
  if (dewC < 10) return 'Crisp, dry air with zero mugginess.';
  if (dewC <= 15) return 'Very comfortable, refreshing moisture level.';
  if (dewC <= 18) return 'Comfortable for most, slightly humid.';
  if (dewC <= 21) return 'Somewhat sticky and noticeably humid.';
  if (dewC <= 24) return 'Oppressive, muggy atmosphere.';
  return 'Severely humid; tropical moisture saturation.';
}

export function WeatherDetails() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);

  if (!weather?.current) return null;

  const { current, hourly, daily } = weather;

  // Temperature conversions
  const toDisplayTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return 'N/A';
    return units.temp === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
  };

  const tempVal = toDisplayTemp(current.temperature_2m);
  const apparentVal = toDisplayTemp(current.apparent_temperature);
  const tempDiff = current.apparent_temperature - current.temperature_2m;

  // Thermal explanation
  let thermalExplanation = 'Perceived temperature aligns closely with ambient air.';
  if (tempDiff <= -2) {
    thermalExplanation = `Feels cooler by ${Math.abs(Math.round(tempDiff))}° due to sustained airflow and convective heat loss.`;
  } else if (tempDiff >= 2) {
    thermalExplanation = `Feels warmer by ${Math.round(tempDiff)}° due to high atmospheric humidity trapping body heat.`;
  }

  // Dew point
  const dewPointC = current.dew_point_2m ?? (hourly?.dew_point_2m ? hourly.dew_point_2m[new Date().getHours()] : null);
  const dewPointDisplay = dewPointC !== null ? `${toDisplayTemp(dewPointC)}°${units.temp}` : 'N/A';
  const dewPointNote = getDewPointComfort(dewPointC);

  // Pressure & Trend
  const currentPressure = current.surface_pressure ?? current.pressure_msl ?? null;
  const mslPressure = current.pressure_msl ?? null;
  
  // Calculate 3-hour pressure trend from hourly data if present
  let pressureTrend = 'steady';
  let pressureDelta = 0;
  if (hourly?.surface_pressure && hourly.surface_pressure.length > 3) {
    const currentHourIdx = new Date().getHours();
    const pastIdx = Math.max(0, currentHourIdx - 3);
    const pastP = hourly.surface_pressure[pastIdx];
    const currP = hourly.surface_pressure[currentHourIdx] ?? currentPressure;
    if (currP && pastP) {
      pressureDelta = Math.round((currP - pastP) * 10) / 10;
      if (pressureDelta > 1.5) pressureTrend = 'rising';
      else if (pressureDelta < -1.5) pressureTrend = 'falling';
    }
  }

  // Visibility
  const currentHourIdx = new Date().getHours();
  const rawVisibilityM = hourly?.visibility ? hourly.visibility[currentHourIdx] : null;
  let visibilityDisplay = 'N/A';
  let visibilityNote = 'Optical visibility within normal range.';
  if (rawVisibilityM !== null && rawVisibilityM !== undefined) {
    const km = rawVisibilityM / 1000;
    if (units.wind === 'mph') {
      const miles = (km * 0.621371).toFixed(1);
      visibilityDisplay = `${miles} mi`;
    } else {
      visibilityDisplay = `${km.toFixed(1)} km`;
    }

    if (km >= 10) {
      visibilityNote = 'Crystal clear horizon. Maximum optical distance.';
    } else if (km >= 5) {
      visibilityNote = 'Moderate atmospheric haze; distant objects slightly softened.';
    } else if (km >= 1) {
      visibilityNote = 'Reduced visibility from mist, smoke, or light precipitation.';
    } else {
      visibilityNote = 'Dense fog or heavy precipitation causing significant optical restriction.';
    }
  }

  // UV Index
  const uvVal = current.uv_index ?? (hourly?.uv_index ? hourly.uv_index[currentHourIdx] : (daily?.uv_index_max?.[0] ?? null));
  const uvRisk = getUvRisk(uvVal);

  // Wind & Gusts
  const toDisplayWind = (speedKmh) => {
    if (speedKmh === undefined || speedKmh === null) return 'N/A';
    return units.wind === 'mph' ? Math.round(speedKmh * 0.621371) : Math.round(speedKmh);
  };
  const sustainedWind = toDisplayWind(current.wind_speed_10m);
  const windGusts = toDisplayWind(current.wind_gusts_10m);
  const windDir = getCompassDirection(current.wind_direction_10m);
  const isGusty = current.wind_gusts_10m && current.wind_gusts_10m > current.wind_speed_10m * 1.4 && current.wind_gusts_10m > 25;

  // Cloud Cover & Precipitation
  const cloudPercent = current.cloud_cover ?? 0;
  const precipRate = current.precipitation ?? 0;

  // Sunrise / Sunset
  const sunriseStr = daily?.sunrise?.[0] ? daily.sunrise[0].split('T')[1]?.substring(0, 5) : null;
  const sunsetStr = daily?.sunset?.[0] ? daily.sunset[0].split('T')[1]?.substring(0, 5) : null;

  const cards = [
    {
      id: 'feels-like',
      title: 'Feels Like',
      value: `${apparentVal}°${units.temp}`,
      subtitle: `Ambient: ${tempVal}°${units.temp}`,
      badge: tempDiff === 0 ? 'Equal' : `${tempDiff > 0 ? '+' : ''}${Math.round(tempDiff)}°`,
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      icon: Thermometer,
      description: thermalExplanation,
    },
    {
      id: 'humidity-dew',
      title: 'Humidity & Dew Point',
      value: `${current.relative_humidity_2m}%`,
      subtitle: `Dew Point: ${dewPointDisplay}`,
      badge: current.relative_humidity_2m > 70 ? 'Humid' : current.relative_humidity_2m < 30 ? 'Dry' : 'Balanced',
      badgeColor: current.relative_humidity_2m > 70 ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Droplets,
      description: dewPointNote,
    },
    {
      id: 'pressure',
      title: 'Barometric Pressure',
      value: currentPressure ? `${Math.round(currentPressure)} hPa` : 'N/A',
      subtitle: mslPressure ? `MSL: ${Math.round(mslPressure)} hPa` : 'Atmospheric baseline',
      badge: pressureTrend === 'rising' ? 'Rising' : pressureTrend === 'falling' ? 'Falling' : 'Steady',
      badgeColor: pressureTrend === 'rising' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : pressureTrend === 'falling' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      icon: Gauge,
      description: pressureTrend === 'rising'
        ? `Barometer is rising (+${pressureDelta} hPa in 3h) — stable, clearing conditions favored.`
        : pressureTrend === 'falling'
        ? `Barometer is falling (${pressureDelta} hPa in 3h) — approaching front or precipitation likelihood.`
        : 'Pressure is stable within the standard atmospheric range (1013 hPa baseline).',
    },
    {
      id: 'visibility',
      title: 'Atmospheric Visibility',
      value: visibilityDisplay,
      subtitle: 'Surface optical distance',
      badge: rawVisibilityM >= 10000 ? 'Clear' : rawVisibilityM >= 5000 ? 'Moderate' : 'Low',
      badgeColor: rawVisibilityM >= 10000 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: Eye,
      description: visibilityNote,
    },
    {
      id: 'uv-index',
      title: 'UV Solar Index',
      value: uvVal !== null && uvVal !== undefined ? uvVal.toFixed(1) : 'N/A',
      subtitle: `WHO Exposure: ${uvRisk.tier}`,
      badge: uvRisk.tier,
      badgeColor: `${uvRisk.color} ${uvRisk.bg} ${uvRisk.border}`,
      icon: Sun,
      description: uvRisk.advice,
    },
    {
      id: 'wind-gusts',
      title: 'Wind & Peak Gusts',
      value: `${sustainedWind} ${units.wind}`,
      subtitle: `From ${windDir} (${Math.round(current.wind_direction_10m || 0)}°)`,
      badge: isGusty ? `Gusts ${windGusts}` : 'Steady',
      badgeColor: isGusty ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      icon: Wind,
      description: isGusty
        ? `Gusty breeze with gusts reaching up to ${windGusts} ${units.wind}.`
        : `Consistent sustained airflow of ${sustainedWind} ${units.wind} with low atmospheric turbulence.`,
    },
    {
      id: 'precipitation',
      title: 'Precipitation & Clouds',
      value: precipRate > 0 ? `${precipRate.toFixed(1)} mm/h` : '0.0 mm/h',
      subtitle: `Cloud Ceiling: ${cloudPercent}%`,
      badge: precipRate > 0 ? 'Active Rain' : cloudPercent > 70 ? 'Overcast' : cloudPercent > 30 ? 'Partly Cloudy' : 'Clear Sky',
      badgeColor: precipRate > 0 ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      icon: CloudRain,
      description: precipRate > 0
        ? `Precipitation is actively falling at ${precipRate.toFixed(1)} mm per hour.`
        : cloudPercent > 70
        ? `Dense cloud deck covering ${cloudPercent}% of the sky; low direct solar irradiance.`
        : cloudPercent > 20
        ? `Scattered cloud layers covering ${cloudPercent}% with intermittent sunlight.`
        : 'Clear, unobstructed sky dome with direct sunlight transmission.',
    },
    {
      id: 'solar-cycle',
      title: 'Daylight & Celestial',
      value: sunriseStr && sunsetStr ? `${sunriseStr} / ${sunsetStr}` : 'N/A',
      subtitle: daily?.daylight_duration?.[0] ? `${(daily.daylight_duration[0] / 3600).toFixed(1)} hrs daylight` : '24-hour diurnal cycle',
      badge: current.is_day ? 'Daylight' : 'Night',
      badgeColor: current.is_day ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      icon: current.is_day ? Sunrise : Sunset,
      description: current.is_day
        ? `Daylight actively progressing toward sunset at ${sunsetStr || 'dusk'}.`
        : `Nighttime cooling cycle under way. Next sunrise scheduled at ${sunriseStr || 'dawn'}.`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Advanced Atmospheric Telemetry
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Deterministic meteorological analysis
        </span>
      </div>

      {/* Responsive 8-card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-white/5 hover:border-white/15 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:bg-sky-500/10 transition-colors">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-400">
                  {card.title}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                  {card.value}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {card.subtitle}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{card.description}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherDetails;
