import React from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  CloudRain,
  CloudDrizzle,
  Sun,
  Wind,
  ThermometerSnowflake,
  ThermometerSun,
  CloudFog,
  Activity,
  Sparkles,
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
  BellRing,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import {
  calculateWeatherInsights,
  calculateWeatherTrends,
  calculateWeatherChanges,
} from '../../utils/insightsEngine';

const INSIGHT_ICONS = {
  CloudRain,
  CloudDrizzle,
  Sun,
  Wind,
  ThermometerSnowflake,
  ThermometerSun,
  CloudFog,
  Activity,
  Sparkles,
  Compass,
};

export function WeatherInsights() {
  const weather = useWeatherStore((s) => s.weather);
  const airQuality = useWeatherStore((s) => s.airQuality);
  const units = useWeatherStore((s) => s.units);

  if (!weather?.current) return null;

  const insights = calculateWeatherInsights(weather, airQuality, units);
  const trends = calculateWeatherTrends(weather, units);
  const changes = calculateWeatherChanges(weather, units);

  return (
    <div className="space-y-6">
      {/* 1. LIGHTWEIGHT WEATHER CHANGES BAR (only shown when meaningful alerts exist) */}
      {changes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-2xl p-4 sm:px-6 border border-white/10 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 shrink-0">
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Weather Changes</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {changes.map((c) => {
              const IconComp = INSIGHT_ICONS[c.icon] || Sparkles;
              return (
                <div
                  key={c.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${c.color}`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 2. WHAT THIS WEATHER MEANS & WEATHER TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: WHAT THIS WEATHER MEANS */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                    What This Weather Means
                  </h3>
                  <p className="text-xs text-slate-400">
                    Plain-language explanations derived from today&apos;s forecast
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {insights.map((item, idx) => {
                const IconComp = INSIGHT_ICONS[item.icon] || Lightbulb;

                const borderClass =
                  item.type === 'danger'
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : item.type === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : item.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-sky-500/25 bg-sky-500/5';

                const badgeColor =
                  item.type === 'danger'
                    ? 'bg-rose-500/20 text-rose-300'
                    : item.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-300'
                    : item.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-sky-500/20 text-sky-300';

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className={`p-4 rounded-2xl border ${borderClass} flex items-start gap-3.5`}
                  >
                    <div className={`p-2.5 rounded-xl ${badgeColor} shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: WEATHER TREND */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                    Weather Trend
                  </h3>
                  <p className="text-xs text-slate-400">
                    Directional shifts across key atmospheric parameters
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {trends.map((t) => {
                const DirIcon =
                  t.direction === 'up'
                    ? TrendingUp
                    : t.direction === 'down'
                    ? TrendingDown
                    : Minus;
                const dirColor =
                  t.direction === 'up'
                    ? 'text-amber-400 bg-amber-500/10'
                    : t.direction === 'down'
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-400 bg-white/5';

                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${dirColor}`}>
                      <DirIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.category}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-white mt-0.5 leading-snug">
                        {t.statement}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500">
            Trends calculated from 24-hour Open-Meteo forecast progression.
          </div>
        </div>
      </div>
    </div>
  );
}
