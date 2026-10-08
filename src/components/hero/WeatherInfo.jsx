import React from 'react';
import {
  MapPin,
  Wind,
  Droplets,
  Sun,
  Star,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';
import { generateDailyBriefData } from './DailyBrief';
import { TemperatureDisplay } from './TemperatureDisplay';

export function WeatherInfo({ current, daily, location, timezone }) {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);
  const lastUpdated = useWeatherStore((s) => s.lastUpdated);
  const fetchData = useWeatherStore((s) => s.fetchData);
  const isFavorite = useWeatherStore((s) => s.isFavorite(location));
  const addFavorite = useWeatherStore((s) => s.addFavorite);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);
  const openDeepDive = useWeatherStore((s) => s.openDeepDive);

  const wmo = getWmoInfo(current.weather_code);
  const brief = generateDailyBriefData(weather, units);

  const feelsLike =
    units.temp === 'F'
      ? Math.round((current.apparent_temperature * 9) / 5 + 32)
      : Math.round(current.apparent_temperature);

  const windSpeedVal =
    units.wind === 'mph'
      ? Math.round(current.wind_speed_10m * 0.621371)
      : Math.round(current.wind_speed_10m);

  // High & Low of the day
  const highTemp = daily?.temperature_2m_max?.[0] ?? current.temperature_2m;
  const lowTemp = daily?.temperature_2m_min?.[0] ?? current.temperature_2m;
  const highDisplay =
    units.temp === 'F' ? Math.round((highTemp * 9) / 5 + 32) : Math.round(highTemp);
  const lowDisplay =
    units.temp === 'F' ? Math.round((lowTemp * 9) / 5 + 32) : Math.round(lowTemp);

  // Format local time using the location's timezone
  let localTimeStr = '';
  try {
    const d = new Date();
    localTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: units.clock === '12h',
    }).format(d);
  } catch {
    const d = new Date();
    localTimeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // Format last updated indicator
  let updatedStr = 'Updated just now';
  if (lastUpdated) {
    try {
      const diffSec = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      if (diffSec < 60) {
        updatedStr = 'Just now';
      } else if (diffSec < 3600) {
        updatedStr = `${Math.floor(diffSec / 60)}m ago`;
      } else {
        updatedStr = new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      updatedStr = 'Recently';
    }
  }

  const toggleFav = () => {
    if (isFavorite) {
      const id = `${location.name}-${location.lat}-${location.lon}`.toLowerCase().replace(/\s+/g, '-');
      removeFavorite(id);
    } else {
      addFavorite(location);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-end gap-5 lg:gap-8 w-full">
      {/* LEFT COLUMN (Desktop): Temperature + Condition & Feel */}
      <div className="lg:col-span-5 flex flex-col space-y-1.5 sm:space-y-2">
        {/* Mobile-only Location Row (Top of screen) */}
        <div className="flex lg:hidden items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0 opacity-90" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
              {location.name}
            </span>
            {location.country && (
              <span className="text-xs sm:text-sm text-slate-400 font-normal truncate">
                · {location.country}
              </span>
            )}
          </div>
          <button
            onClick={toggleFav}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="p-1 rounded-full text-slate-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
          >
            <Star
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isFavorite ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Primary Temperature Display (Single Instance) */}
        <div
          onClick={() => openDeepDive('temperature')}
          className="cursor-pointer group select-none inline-block"
          title="Tap to inspect temperature curve & thermal analysis"
        >
          <TemperatureDisplay tempCelsius={current.temperature_2m} />
        </div>

        {/* Condition & High/Low Range */}
        <div
          onClick={() => openDeepDive('temperature')}
          className="space-y-0.5 cursor-pointer group"
          title="Tap for detailed temperature analysis"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
            {wmo.label}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 text-xs sm:text-sm text-slate-300">
            <span className="font-semibold text-slate-100">
              Feels like {feelsLike}°{units.temp}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">H: {highDisplay}°</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">L: {lowDisplay}°</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (Desktop): Location Info + Daily Meaning + Essential Metrics */}
      <div className="lg:col-span-7 flex flex-col space-y-3 sm:space-y-4">
        {/* Desktop Location Header Row */}
        <div className="hidden lg:flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-5 h-5 text-sky-400 shrink-0 opacity-90" />
            <span className="text-2xl font-bold tracking-tight text-white truncate">
              {location.name}
            </span>
            {location.country && (
              <span className="text-base text-slate-400 font-normal truncate">
                · {location.country}
              </span>
            )}
            <button
              onClick={toggleFav}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <Star
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  isFavorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Updated {updatedStr}</span>
            <button
              onClick={() => fetchData(location.lat, location.lon)}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh weather data"
              aria-label="Refresh weather data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Meaning Narrative */}
        {brief?.narrative && (
          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal glass-panel rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3">
            &ldquo;{brief.narrative}&rdquo;
          </p>
        )}

        {/* Essential Metrics: 2x2 on mobile, 4-col on tablet/desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {/* Humidity */}
          <button
            onClick={() => openDeepDive('humidity')}
            className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left cursor-pointer hover:border-sky-400/40 hover:bg-white/[0.08] transition-all group"
            title="Tap for 24h humidity curve"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium group-hover:text-sky-300 transition-colors">
                Humidity
              </span>
              <span className="text-sm sm:text-base font-bold text-white block leading-tight">
                {current.relative_humidity_2m ?? '--'}%
              </span>
            </div>
          </button>

          {/* Wind Speed */}
          <button
            onClick={() => openDeepDive('wind')}
            className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left cursor-pointer hover:border-sky-400/40 hover:bg-white/[0.08] transition-all group"
            title="Tap for 24h wind velocity curve"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium group-hover:text-sky-300 transition-colors">
                Wind
              </span>
              <span className="text-sm sm:text-base font-bold text-white block leading-tight">
                {windSpeedVal} {units.wind}
              </span>
            </div>
          </button>

          {/* UV Index */}
          <button
            onClick={() => openDeepDive('uv')}
            className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left cursor-pointer hover:border-amber-400/40 hover:bg-white/[0.08] transition-all group"
            title="Tap for solar UV radiation curve"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium group-hover:text-amber-300 transition-colors">
                UV Index
              </span>
              <span className="text-sm sm:text-base font-bold text-white block leading-tight">
                {current.uv_index !== undefined && current.uv_index !== null
                  ? current.uv_index.toFixed(1)
                  : '0.0'}
              </span>
            </div>
          </button>

          {/* Local Time */}
          <div className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Local Time
              </span>
              <span className="text-sm sm:text-base font-bold text-white block leading-tight">
                {localTimeStr}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherInfo;
