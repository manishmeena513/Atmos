import React from 'react';
import {
  MapPin,
  Wind,
  Droplets,
  Sun,
  Star,
  Clock,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';

export function WeatherInfo({ current, daily, location, timezone }) {
  const units = useWeatherStore((s) => s.units);
  const isFavorite = useWeatherStore((s) => s.isFavorite(location));
  const addFavorite = useWeatherStore((s) => s.addFavorite);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);

  const wmo = getWmoInfo(current.weather_code);

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

  const toggleFav = () => {
    if (isFavorite) {
      const id = `${location.name}-${location.lat}-${location.lon}`.toLowerCase().replace(/\s+/g, '-');
      removeFavorite(id);
    } else {
      addFavorite(location);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* City, Country & Star Favorite */}
      <div className="flex items-center gap-3">
        <div className="flex items-center text-slate-100 text-xl sm:text-2xl font-medium tracking-tight">
          <MapPin className="w-5 h-5 text-sky-400 mr-2 shrink-0 opacity-85" />
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

      {/* Condition & Range - Editorial Hierarchy */}
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow-md">
          {wmo.label}
        </h2>
        <span className="text-sm font-medium text-slate-300">
          Feels like {feelsLike}°{units.temp}
        </span>
        <span className="text-sm text-slate-400">
          H: {highDisplay}° · L: {lowDisplay}°
        </span>
      </div>

      {/* Editorial Metadata Strip (2x2 grid on mobile, clean row with dividers on desktop) */}
      <div className="pt-2 pb-1 grid grid-cols-2 sm:flex sm:items-center sm:divide-x divide-white/10 gap-3 sm:gap-0 text-xs sm:text-sm text-slate-300">
        {/* Humidity */}
        <div className="sm:pr-4 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[11px] block leading-none">Humidity</span>
            <span className="font-semibold text-white mt-0.5 block leading-tight">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        {/* Wind */}
        <div className="sm:px-4 flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[11px] block leading-none">Wind Flow</span>
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
              {current.uv_index ? current.uv_index.toFixed(1) : '0.0'}
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
