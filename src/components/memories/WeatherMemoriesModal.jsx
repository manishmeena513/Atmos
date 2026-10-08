import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bookmark,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  CloudSun,
  ShieldCheck,
  History,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';

export function WeatherMemoriesModal() {
  const isOpen = useWeatherStore((s) => s.isMemoriesOpen);
  const closeMemories = useWeatherStore((s) => s.closeMemories);
  const memories = useWeatherStore((s) => s.memories);
  const addMemory = useWeatherStore((s) => s.addMemory);
  const deleteMemory = useWeatherStore((s) => s.deleteMemory);

  const weather = useWeatherStore((s) => s.weather);
  const airQuality = useWeatherStore((s) => s.airQuality);
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);

  if (!isOpen) return null;

  const handleCaptureCurrent = () => {
    if (!weather?.current) return;
    const curr = weather.current;
    const wmo = getWmoInfo(curr.weather_code);
    const tempVal = units.temp === 'F' ? Math.round((curr.temperature_2m * 9) / 5 + 32) : Math.round(curr.temperature_2m);
    const rawAqi = airQuality?.current?.european_aqi ?? airQuality?.current?.us_aqi ?? null;

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    addMemory({
      locationName: location.name,
      country: location.country,
      dateLabel: dateStr,
      tempDisplay: `${tempVal}°${units.temp}`,
      condition: wmo.label,
      aqiDisplay: rawAqi !== null ? `${Math.round(rawAqi)} EAQI` : 'AQI Unavailable',
      summary: `${wmo.label} with a thermal feel of ${tempVal}°${units.temp} in ${location.name}.`,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMemories}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto glass-surface-modal border-t sm:border border-white/15 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
        >
          {/* Mobile Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Weather Memories
                  </h3>
                  <p className="text-xs text-slate-400">
                    Saved atmospheric snapshots &amp; local climate journal
                  </p>
                </div>
              </div>

              <button
                onClick={closeMemories}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close memories"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Capture Button */}
            <div className="my-4">
              <button
                onClick={handleCaptureCurrent}
                disabled={!weather?.current}
                className="w-full py-3 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Save Current Weather Snapshot ({location.name})</span>
              </button>
            </div>

            {/* Memories List */}
            <div className="space-y-3 my-2">
              {memories.length > 0 ? (
                memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 relative group"
                  >
                    {/* Historical Warning Tag */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        <History className="w-3 h-3" />
                        <span>Historical Snapshot · Not Live</span>
                      </span>

                      <button
                        onClick={() => deleteMemory(mem.id)}
                        className="opacity-70 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-base font-bold text-white">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>{mem.locationName}</span>
                        {mem.country && (
                          <span className="text-xs text-slate-400 font-normal">
                            · {mem.country}
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-extrabold text-white">
                        {mem.tempDisplay}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 my-1">
                      <span className="text-sky-300 font-medium">{mem.condition}</span>
                      <span>·</span>
                      <span>{mem.aqiDisplay}</span>
                      <span>·</span>
                      <span className="text-[11px] text-slate-500">{mem.dateLabel}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-black/20 p-2 rounded-xl">
                      &ldquo;{mem.summary}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 mx-auto flex items-center justify-center text-slate-500 mb-2">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <p>No weather memories saved yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tap above to save current meteorological conditions to your journal.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Persisted locally in browser storage</span>
            <button
              onClick={closeMemories}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
