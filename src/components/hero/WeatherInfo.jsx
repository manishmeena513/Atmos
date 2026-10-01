import React from 'react';
import {
  MapPin,
  Wind,
  Droplets,
  Sun,
  Star,
  Clock,
  Share2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';
import { generateDailyBriefData } from './DailyBrief';
import { TemperatureDisplay } from './TemperatureDisplay';

export function WeatherInfo({ current, daily, location, timezone, onOpenShare }) {
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
        updatedStr = 'Updated just now';
      } else if (diffSec < 3600) {
        updatedStr = `Updated ${Math.floor(diffSec / 60)}m ago`;
      } else {
        updatedStr = `Updated at ${new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    } catch {
      updatedStr = 'Updated recently';
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
    <div className="flex flex-col space-y-3 sm:space-y-4">
      {/* 1. Location Header Row: City, Country, Star Favorite & compact Share button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0 opacity-90" />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
            {location.name}
          </span>
          {location.country && (
            <span className="text-sm sm:text-base text-slate-400 font-normal truncate">
              · {location.country}
            </span>
          )}
          <button
            onClick={toggleFav}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
          >
            <Star
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isFavorite ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Secondary Actions: Last Updated & Compact Share Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{updatedStr}</span>
            <button
              onClick={() => fetchData(location.lat, location.lon)}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh weather data"
              aria-label="Refresh weather data"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Share Weather Card"
              aria-label="Share Weather Card"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Temperature Display: Responsive typography & tap to open deep-dive */}
      <div
        onClick={() => openDeepDive('temperature')}
        className="py-0.5 inline-block cursor-pointer group"
        title="Tap to view 24h temperature curve & thermal analysis"
      >
        <TemperatureDisplay tempCelsius={current.temperature_2m} />
      </div>

      {/* 3. Weather Condition & Range */}
      <div
        onClick={() => openDeepDive('temperature')}
        className="space-y-1 cursor-pointer group"
        title="Tap for detailed temperature analysis"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md group-hover:text-sky-300 transition-colors">
          {wmo.label}
        </h2>
        <div className="flex flex-wrap items-center gap-x-2 text-xs sm:text-sm text-slate-300">
          <span className="font-semibold text-slate-100">
            Feels like {feelsLike}°{units.temp}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">
            H: {highDisplay}°
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">
            L: {lowDisplay}°
          </span>
          <span className="text-[10px] text-sky-400/80 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            • Tap for deep-dive
          </span>
        </div>
      </div>

      {/* 4. Short Daily Explanation */}
      {brief?.narrative && (
        <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal glass-panel rounded-2xl px-4 py-3 max-w-2xl">
          &ldquo;{brief.narrative}&rdquo;
        </p>
      )}

      {/* 5. Essential Metrics: Clickable deep-dive cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        {/* Humidity */}
        <button
          onClick={() => openDeepDive('humidity')}
          className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left cursor-pointer hover:border-sky-400/40 hover:bg-white/[0.08] transition-all group"
          title="Tap for 24h humidity curve and moisture intelligence"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium group-hover:text-sky-300 transition-colors">Humidity</span>
            <span className="text-sm sm:text-base font-bold text-white block leading-tight">
              {current.relative_humidity_2m ?? '--'}%
            </span>
          </div>
        </button>

        {/* Wind Speed */}
        <button
          onClick={() => openDeepDive('wind')}
          className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left cursor-pointer hover:border-sky-400/40 hover:bg-white/[0.08] transition-all group"
          title="Tap for 24h wind velocity curve and gust analysis"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium group-hover:text-sky-300 transition-colors">Wind</span>
            <span className="text-sm sm:text-base font-bold text-white block leading-tight">
              {windSpeedVal} {units.wind}
            </span>
          </div>
        </button>

        {/* UV Index */}
        <button
          onClick={() => openDeepDive('uv')}
          className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left cursor-pointer hover:border-amber-400/40 hover:bg-white/[0.08] transition-all group"
          title="Tap for solar UV radiation curve and peak hours"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium group-hover:text-amber-300 transition-colors">UV Index</span>
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
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Local Time</span>
            <span className="text-sm sm:text-base font-bold text-white block leading-tight">
              {localTimeStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
