import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  MapPin,
  Clock,
  Star,
  Loader2,
  Navigation,
} from 'lucide-react';
import { searchGeocode } from '../../api/openmeteo';
import { useWeatherStore } from '../../store/weatherStore';
import { useGeolocation } from '../../hooks/useGeolocation';

export function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const setLocation = useWeatherStore((s) => s.setLocation);
  const recentSearches = useWeatherStore((s) => s.recentSearches);
  const isFavorite = useWeatherStore((s) => s.isFavorite);
  const addFavorite = useWeatherStore((s) => s.addFavorite);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);

  const { requestLocation, loading: geoLoading } = useGeolocation();

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced geocode search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const list = await searchGeocode(query, 8);
        setResults(list);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Geocode search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const listLength = results.length > 0 ? results.length : recentSearches.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (listLength || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + listLength) % (listLength || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectCity(results[selectedIndex]);
      } else if (recentSearches.length > 0 && recentSearches[selectedIndex]) {
        handleSelectCity(recentSearches[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectCity = (loc) => {
    setLocation({
      name: loc.name,
      country: loc.country || '',
      countryCode: loc.countryCode || '',
      lat: loc.lat,
      lon: loc.lon,
      timezone: loc.timezone,
    });
    onClose();
  };

  const handleUseCurrentLocation = () => {
    requestLocation();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-20 sm:px-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal / Mobile Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-xl bg-[#0d1422] border border-white/15 shadow-2xl rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 z-10 max-h-[88vh] flex flex-col overflow-hidden"
          >
            {/* Mobile Drag Handle Bar */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header Title with Close */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Search Location
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex items-center mb-3">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search global cities (e.g. Paris, Tokyo, New York)..."
                className="w-full bg-white/[0.05] border border-white/10 focus:border-sky-400/60 rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />

              {loading ? (
                <Loader2 className="w-5 h-5 text-sky-400 absolute right-4 animate-spin" />
              ) : query ? (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-white absolute right-4"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Geolocation Quick Trigger (Large Touch Target) */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs sm:text-sm font-medium transition-colors mb-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Navigation className={`w-4 h-4 text-sky-400 ${geoLoading ? 'animate-spin' : ''}`} />
                <span>Use Current Geolocation</span>
              </div>
              <span className="text-[11px] text-sky-400 font-mono">GPS</span>
            </button>

            {/* Results or Recent Searches */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {results.length > 0 ? (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                    Matching Locations
                  </div>
                  {results.map((loc, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isFav = isFavorite(loc);

                    return (
                      <div
                        key={loc.id || `${loc.name}-${loc.lat}-${loc.lon}`}
                        onClick={() => handleSelectCity(loc)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`min-h-[48px] flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-500/20 border border-sky-400/40 text-white'
                            : 'hover:bg-white/[0.04] text-slate-200 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold">{loc.name}</span>
                            {loc.admin1 && (
                              <span className="text-slate-400 text-xs ml-1.5">
                                {loc.admin1},
                              </span>
                            )}
                            {loc.country && (
                              <span className="text-slate-400 text-xs ml-1">
                                {loc.country}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isFav) {
                              removeFavorite(`${loc.name}-${loc.lat}-${loc.lon}`);
                            } else {
                              addFavorite(loc);
                            }
                          }}
                          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-amber-400 ml-2 cursor-pointer"
                          aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : query.length >= 2 && !loading ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No cities found for "{query}". Check spelling or try a major metro city.
                </div>
              ) : (
                /* Recent Searches */
                <div>
                  {recentSearches.length > 0 && (
                    <>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Recent Searches</span>
                      </div>
                      {recentSearches.map((loc, idx) => {
                        const isSelected = selectedIndex === idx;

                        return (
                          <div
                            key={idx}
                            onClick={() => handleSelectCity(loc)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`min-h-[44px] flex items-center justify-between px-3.5 py-2 rounded-xl cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-white/[0.08] text-white'
                                : 'hover:bg-white/[0.04] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{loc.name}</span>
                              {loc.country && (
                                <span className="text-xs text-slate-500">
                                  {loc.country}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Switch
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="hidden sm:inline">Use ↑ ↓ to navigate, Enter to select</span>
              <span>ESC to dismiss</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
