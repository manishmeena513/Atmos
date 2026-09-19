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
  CheckCircle2,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { calculateWeatherInsights } from '../../utils/insightsEngine';

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

  if (!weather?.current) return null;

  const insights = calculateWeatherInsights(weather, airQuality);

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Actionable Weather Insights
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Derived from live telemetry
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">Calm & Balanced Conditions</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              No extreme weather anomalies detected. Temperature, air quality, and wind are within optimal comfort thresholds.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {insights.map((item, idx) => {
            const IconComp = INSIGHT_ICONS[item.icon] || Lightbulb;

            const borderClass =
              item.type === 'danger'
                ? 'border-rose-500/30 bg-rose-500/5'
                : item.type === 'warning'
                ? 'border-amber-500/30 bg-amber-500/5'
                : item.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-sky-500/30 bg-sky-500/5';

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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className={`p-4 rounded-2xl border ${borderClass} flex items-start gap-3.5 transition-all hover:translate-y-[-1px]`}
              >
                <div className={`p-2.5 rounded-xl ${badgeColor} shrink-0`}>
                  <IconComp className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </h4>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
