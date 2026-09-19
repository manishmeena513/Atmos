import React from 'react';
import { Star, X } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

export function FavoritesCities() {
  const favorites = useWeatherStore((s) => s.favorites);
  const location = useWeatherStore((s) => s.location);
  const setLocation = useWeatherStore((s) => s.setLocation);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);

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

          return (
            <div
              key={fav.id || fav.name}
              className={`group shrink-0 inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium transition-all duration-200 select-none ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <button
                onClick={() => setLocation(fav)}
                className="cursor-pointer hover:text-white"
                aria-label={`Switch to ${fav.name}`}
              >
                {fav.name}
                {fav.country && (
                  <span className="text-slate-500 text-[10px] ml-1">
                    {fav.country.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav.id || `${fav.name}-${fav.lat}-${fav.lon}`);
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
