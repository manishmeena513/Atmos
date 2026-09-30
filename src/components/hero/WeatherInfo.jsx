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
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';
import { generateDailyBriefData } from './DailyBrief';

export function WeatherInfo({ current, daily, location, timezone, onOpenShare }) {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);
  const lastUpdated = useWeatherStore((s) => s.lastUpdated);
  const fetchData = useWeatherStore((s) => s.fetchData);
  const isFavorite = useWeatherStore((s) => s.isFavorite(location));
  const addFavorite = useWeatherStore((s) => s.addFavorite);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);

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
    <div className="flex flex-col space-y-3.5">
      {/* Greeting & Last Updated Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-sky-400">
          {brief?.greeting || 'ATMOS DAILY BRIEF'}
        </span>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
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
      </div>

      {/* City, Country, Star Favorite & Share Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-slate-100 text-xl sm:text-2xl font-semibold tracking-tight">
            <MapPin className="w-5 h-5 text-sky-400 mr-2 shrink-0 opacity-90" />
            <span>{location.name}</span>
            {location.country && (
              <span className="text-slate-400 font-normal ml-2 text-base sm:text-lg">
                · {location.country}
              </span>
            )}
          </div>

          <button
            onClick={toggleFav}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200 text-slate-400 hover:text-amber-400 cursor-pointer"
          >
            <Star
              className={`w-5 h-5 transition-transform active:scale-125 ${
                isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
            aria-label="Share weather card"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Share Weather</span>
          </button>
        )}
      </div>

      {/* Condition & Range - Editorial Hierarchy */}
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          {wmo.label}
        </h2>
        <span className="text-sm font-medium text-slate-200">
          Feels like {feelsLike}°{units.temp}
        </span>
        <span className="text-sm text-slate-400">
          H: {highDisplay}° · L: {lowDisplay}°
        </span>
      </div>

      {/* Short Weather Explanation (Daily Brief Narrative) */}
      {brief?.narrative && (
        <p className="text-sm sm:text-base text-slate-200/95 leading-relaxed font-normal bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 backdrop-blur-md">
          {brief.narrative}
        </p>
      )}

      {/* Editorial Metadata Strip */}
      <div className="pt-1 pb-1 grid grid-cols-2 sm:flex sm:items-center sm:divide-x divide-white/10 gap-3 sm:gap-0 text-xs sm:text-sm text-slate-300">
        {/* Humidity */}
        <div className="sm:pr-4 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[11px] block leading-none">Humidity</span>
            <span className="font-semibold text-white mt-0.5 block leading-tight">
              {current.relative_humidity_2m ?? '--'}%
            </span>
          </div>
        </div>

        {/* Wind */}
        <div className="sm:px-4 flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[11px] block leading-none">Wind Speed</span>
            <span className="font-semibold text-white mt-0.5 block leading-tight">
              {windSpeedVal} {units.wind}
            </span>
          </div>
        </div>

        {/* UV Index */}
        <div className="sm:px-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[11px] block leading-none">UV Index</span>
            <span className="font-semibold text-white mt-0.5 block leading-tight">
              {current.uv_index !== undefined && current.uv_index !== null
                ? current.uv_index.toFixed(1)
                : '0.0'}
            </span>
          </div>
        </div>

        {/* Local Time */}
        <div className="sm:pl-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[11px] block leading-none">Local Time</span>
            <span className="font-semibold text-white mt-0.5 block leading-tight">{localTimeStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
