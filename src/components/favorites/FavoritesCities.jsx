import React, { useEffect, useState } from 'react';
import { Star, X, Sun, Cloud, CloudRain, CloudSun, CloudFog, CloudSnow, CloudLightning, Snowflake } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { fetchWeather } from '../../api/openmeteo';
import { getWmoInfo } from '../../utils/wmoCodeMap';

const ICON_MAP = {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
};

export function FavoritesCities() {
  const favorites = useWeatherStore((s) => s.favorites);
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);
  const setLocation = useWeatherStore((s) => s.setLocation);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);

  const [telemetry, setTelemetry] = useState({});

  useEffect(() => {
    let isMounted = true;
    if (favorites.length === 0) return;

    const loadWeatherForFavorites = async () => {
      const results = {};
      await Promise.allSettled(
        favorites.map(async (fav) => {
          try {
            const data = await fetchWeather(fav.lat, fav.lon);
            if (data?.current) {
              const favKey = fav.id || `${fav.name}-${fav.lat}-${fav.lon}`;
              results[favKey] = {
                tempC: data.current.temperature_2m,
                weatherCode: data.current.weather_code,
              };
            }
          } catch {
            // Silently fallback without breaking UI
          }
        })
      );

      if (isMounted) {
        setTelemetry(results);
      }
    };

    loadWeatherForFavorites();

    return () => {
      isMounted = false;
    };
  }, [favorites]);

  if (favorites.length === 0) return null;

  return (
    <div className="w-full py-1.5 overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x overscroll-x-contain">
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider shrink-0 mr-1 select-none">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="hidden sm:inline">Pinned Locations</span>
          <span className="sm:hidden">Pinned</span>
        </div>

        {favorites.map((fav) => {
          const isActive =
            fav.name === location.name && fav.country === location.country;
          const favKey = fav.id || `${fav.name}-${fav.lat}-${fav.lon}`;
          const live = telemetry[favKey];

          let tempDisplay = null;
          let IconComp = null;

          if (live && live.tempC !== undefined) {
            const tempVal = units.temp === 'F' ? Math.round((live.tempC * 9) / 5 + 32) : Math.round(live.tempC);
            tempDisplay = `${tempVal}°`;
            const wmo = getWmoInfo(live.weatherCode);
            IconComp = ICON_MAP[wmo.icon] || Cloud;
          }

          return (
            <div
              key={favKey}
              className={`group shrink-0 inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
                isActive
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 shadow-sm'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <button
                onClick={() => setLocation(fav)}
                className="cursor-pointer hover:text-white flex items-center gap-1.5"
                aria-label={`Switch to ${fav.name}`}
              >
                {IconComp && (
                  <IconComp className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
                <span>{fav.name}</span>
                {tempDisplay && (
                  <span className="font-bold text-white bg-white/10 px-1.5 py-0.2 rounded-md text-[11px]">
                    {tempDisplay}
                  </span>
                )}
                {fav.country && !tempDisplay && (
                  <span className="text-slate-500 text-[10px]">
                    {fav.country.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(favKey);
                }}
                className="opacity-70 sm:opacity-0 sm:group-hover:opacity-70 hover:opacity-100 p-1 -mr-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer min-w-[22px] min-h-[22px] flex items-center justify-center"
                title={`Remove ${fav.name} from favorites`}
                aria-label={`Remove ${fav.name} from favorites`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FavoritesCities;
