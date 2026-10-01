import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plane,
  Search,
  MapPin,
  Loader2,
  Sun,
  Sunset,
  Sunrise,
  CloudRain,
  Activity,
  Shirt,
  Compass,
} from 'lucide-react';
import { searchGeocode, fetchWeather, fetchAirQuality } from '../../api/openmeteo';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';

export function TravelModeModal() {
  const isOpen = useWeatherStore((s) => s.isTravelOpen);
  const closeTravel = useWeatherStore((s) => s.closeTravel);
  const setLocation = useWeatherStore((s) => s.setLocation);
  const units = useWeatherStore((s) => s.units);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [destWeather, setDestWeather] = useState(null);
  const [destAqi, setDestAqi] = useState(null);
  const [loadingDest, setLoadingDest] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;
    setSearching(true);
    try {
      const list = await searchGeocode(query, 6);
      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = async (loc) => {
    setSelectedDest(loc);
    setResults([]);
    setLoadingDest(true);
    try {
      const [w, a] = await Promise.allSettled([
        fetchWeather(loc.lat, loc.lon),
        fetchAirQuality(loc.lat, loc.lon),
      ]);
      if (w.status === 'fulfilled') setDestWeather(w.value);
      if (a.status === 'fulfilled') setDestAqi(a.value);
    } catch {
      //
    } finally {
      setLoadingDest(false);
    }
  };

  const handleSwitchToDestination = () => {
    if (selectedDest) {
      setLocation(selectedDest);
      closeTravel();
    }
  };

  const wmo = destWeather?.current ? getWmoInfo(destWeather.current.weather_code) : null;
  const tempVal = destWeather?.current
    ? units.temp === 'F'
      ? Math.round((destWeather.current.temperature_2m * 9) / 5 + 32)
      : Math.round(destWeather.current.temperature_2m)
    : '--';

  const precipProb = destWeather?.hourly?.precipitation_probability?.[new Date().getHours()] ?? 0;
  const rawAqi = destAqi?.current?.european_aqi ?? destAqi?.current?.us_aqi ?? null;

  // Clothing advice for destination
  let clothingTip = 'Pack light, breathable layers for comfortable travel.';
  if (destWeather?.current?.temperature_2m <= 10) {
    clothingTip = 'Pack a warm thermal jacket, scarf, and insulated layers for cold conditions.';
  } else if (destWeather?.current?.temperature_2m >= 28) {
    clothingTip = 'Pack breathable summer cottons, sunglasses, and UV protection.';
  } else if ((destWeather?.current?.precipitation || 0) > 0 || precipProb >= 40) {
    clothingTip = 'Pack a compact umbrella or waterproof shell jacket for expected showers.';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTravel}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0b1220] border-t sm:border border-white/15 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
        >
          {/* Mobile Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Travel Mode
                  </h3>
                  <p className="text-xs text-slate-400">
                    Destination weather preview &amp; travel advisory
                  </p>
                </div>
              </div>

              <button
                onClick={closeTravel}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close travel mode"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destination Search Input */}
            <form onSubmit={handleSearch} className="relative my-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destination city (e.g. Dubai, Tokyo, Paris)..."
                className="w-full bg-white/[0.05] border border-white/10 focus:border-sky-400/60 rounded-2xl pl-10 pr-24 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* City Results List */}
            {results.length > 0 && (
              <div className="space-y-1 mb-4 p-2 rounded-2xl bg-white/[0.03] border border-white/5 max-h-48 overflow-y-auto">
                {results.map((loc) => (
                  <div
                    key={loc.id || `${loc.name}-${loc.lat}-${loc.lon}`}
                    onClick={() => handleSelectCity(loc)}
                    className="p-2.5 rounded-xl hover:bg-white/[0.06] text-xs text-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-semibold">{loc.name}</span>
                      {loc.country && <span className="text-slate-400">· {loc.country}</span>}
                    </div>
                    <span className="text-[11px] text-sky-400 font-mono">Inspect</span>
                  </div>
                ))}
              </div>
            )}

            {/* Loading Indicator */}
            {loadingDest && (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Fetching destination weather intelligence...</span>
              </div>
            )}

            {/* Destination Preview Card */}
            {selectedDest && destWeather && !loadingDest && (
              <div className="space-y-3.5">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-white/[0.02] to-transparent border border-sky-500/25">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Destination
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>{selectedDest.name}</span>
                        {selectedDest.country && (
                          <span className="text-xs font-normal text-slate-400 ml-1">
                            {selectedDest.country}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl sm:text-4xl font-extrabold text-white">
                        {tempVal}°{units.temp}
                      </div>
                      <div className="text-xs font-semibold text-sky-300">
                        {wmo?.label || 'Clear'}
                      </div>
                    </div>
                  </div>

                  {/* Travel Telemetry Row */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <CloudRain className="w-3 h-3 text-sky-400" />
                        <span>Rain Risk</span>
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        {precipProb}%
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>Air Quality</span>
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        {rawAqi !== null ? `${Math.round(rawAqi)} EAQI` : 'Unavailable'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Sunset className="w-3 h-3 text-amber-400" />
                        <span>Sunset</span>
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        {destWeather.daily?.sunset?.[0]
                          ? new Date(destWeather.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clothing & Gear Recommendation */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Packing &amp; Clothing Advisory
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {clothingTip}
                    </p>
                  </div>
                </div>

                {/* Set as Active Location Action */}
                <button
                  onClick={handleSwitchToDestination}
                  className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  Set as Active Weather Location
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Open-Meteo Global Forecasting Network</span>
            <button
              onClick={closeTravel}
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
