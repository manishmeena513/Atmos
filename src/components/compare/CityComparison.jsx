import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Plus,
  X,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  CloudRain,
  Sparkles,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { fetchWeather, fetchAirQuality } from '../../api/openmeteo';
import { getWmoInfo } from '../../utils/wmoCodeMap';

const PRESET_CITIES = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
];

export function CityComparison() {
  const currentCity = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);

  const [comparedCities, setComparedCities] = useState([
    PRESET_CITIES[1], // London
  ]);
  const [cityDataMap, setCityDataMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch weather and real AQI for all cities being compared
  useEffect(() => {
    const all = [currentCity, ...comparedCities];
    let isMounted = true;
    setLoading(true);

    Promise.all(
      all.map(async (c) => {
        try {
          const [wRes, aqRes] = await Promise.allSettled([
            fetchWeather(c.lat, c.lon),
            fetchAirQuality(c.lat, c.lon),
          ]);
          return {
            key: `${c.lat}-${c.lon}`,
            weather: wRes.status === 'fulfilled' ? wRes.value : null,
            aqi: aqRes.status === 'fulfilled' && aqRes.value?.current ? aqRes.value.current : null,
          };
        } catch {
          return { key: `${c.lat}-${c.lon}`, weather: null, aqi: null };
        }
      })
    ).then((results) => {
      if (!isMounted) return;
      const map = {};
      results.forEach((r) => {
        map[r.key] = { weather: r.weather, aqi: r.aqi };
      });
      setCityDataMap(map);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentCity, comparedCities]);

  const handleAddCity = (city) => {
    if (comparedCities.length >= 2) return;
    if (comparedCities.some((c) => c.name === city.name) || currentCity.name === city.name) return;
    setComparedCities([...comparedCities, city]);
  };

  const handleRemoveCity = (name) => {
    setComparedCities(comparedCities.filter((c) => c.name !== name));
  };

  const citiesToDisplay = [currentCity, ...comparedCities];

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              City Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Cross-compare atmospheric telemetry between global locations
            </p>
          </div>
        </div>

        {/* Quick Add Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Add:</span>
          {PRESET_CITIES.filter(
            (pc) => pc.name !== currentCity.name && !comparedCities.some((c) => c.name === pc.name)
          )
            .slice(0, 3)
            .map((pc) => (
              <button
                key={pc.name}
                onClick={() => handleAddCity(pc)}
                disabled={comparedCities.length >= 2}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 hover:text-white border border-white/5 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{pc.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Comparison Grid Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {citiesToDisplay.map((city, idx) => {
          const isPrimary = idx === 0;
          const key = `${city.lat}-${city.lon}`;
          const entry = cityDataMap[key];
          const weather = entry?.weather;
          const aqiData = entry?.aqi;
          const curr = weather?.current;
          const wmo = curr ? getWmoInfo(curr.weather_code) : null;

          const temp = curr
            ? units.temp === 'F'
              ? Math.round((curr.temperature_2m * 9) / 5 + 32)
              : Math.round(curr.temperature_2m)
            : '--';

          const feels = curr
            ? units.temp === 'F'
              ? Math.round((curr.apparent_temperature * 9) / 5 + 32)
              : Math.round(curr.apparent_temperature)
            : '--';

          const wind = curr
            ? units.wind === 'mph'
              ? Math.round(curr.wind_speed_10m * 0.621371)
              : Math.round(curr.wind_speed_10m)
            : '--';

          const precipProb = weather?.hourly?.precipitation_probability?.[0] ?? curr?.precipitation ?? 0;
          const aqiVal = aqiData?.european_aqi ?? aqiData?.us_aqi ?? null;

          return (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={`rounded-2xl p-5 border flex flex-col justify-between relative overflow-hidden ${
                isPrimary
                  ? 'bg-sky-500/10 border-sky-400/30 shadow-[0_0_30px_rgba(56,189,248,0.1)]'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {/* City Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white">
                      {city.name}
                    </span>
                    {isPrimary && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  {!isPrimary && (
                    <button
                      onClick={() => handleRemoveCity(city.name)}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-400 mb-4">
                  {city.country || 'Global Station'}
                </div>

                {/* Primary Temp & Condition Banner */}
                <div className="flex items-baseline justify-between mb-5">
                  <div className="text-4xl sm:text-5xl font-extrabold text-white">
                    {temp}°<span className="text-xl font-normal text-slate-400">{units.temp}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-200">
                      {wmo?.label || 'Calibrating'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Feels like {feels}°{units.temp}
                    </div>
                  </div>
                </div>

                {/* Comparison Metrics Stack */}
                <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
                  {/* Humidity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      <span>Humidity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-400 rounded-full"
                          style={{ width: `${curr?.relative_humidity_2m || 0}%` }}
                        />
                      </div>
                      <span className="font-semibold text-white">
                        {curr?.relative_humidity_2m ?? '--'}%
                      </span>
                    </div>
                  </div>

                  {/* Wind */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Wind className="w-3.5 h-3.5 text-sky-400" />
                      <span>Wind Speed</span>
                    </div>
                    <span className="font-semibold text-white">
                      {wind} {units.wind}
                    </span>
                  </div>

                  {/* Precipitation Probability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                      <span>Precipitation Risk</span>
                    </div>
                    <span className="font-semibold text-sky-400">
                      {precipProb}%
                    </span>
                  </div>

                  {/* UV Index */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>UV Index</span>
                    </div>
                    <span className="font-semibold text-white">
                      {curr?.uv_index !== undefined && curr?.uv_index !== null ? curr.uv_index.toFixed(1) : 'N/A'}
                    </span>
                  </div>

                  {/* Real Air Quality (AQI) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Air Quality (AQI)</span>
                    </div>
                    <span className={`font-semibold ${aqiVal !== null ? (aqiVal <= 50 ? 'text-emerald-400' : aqiVal <= 100 ? 'text-amber-400' : 'text-rose-400') : 'text-slate-400'}`}>
                      {aqiVal !== null ? `${Math.round(aqiVal)} AQI` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
