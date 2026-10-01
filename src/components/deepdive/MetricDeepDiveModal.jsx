import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HelpCircle,
  TrendingUp,
  Activity,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Thermometer,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useWeatherStore } from '../../store/weatherStore';
import { getMetricDeepDiveData } from '../../utils/deepDiveEngine';

const ICON_MAP = {
  temperature: Thermometer,
  wind: Wind,
  humidity: Droplets,
  uv: Sun,
  rain: CloudRain,
  aqi: Activity,
};

export function MetricDeepDiveModal() {
  const activeMetric = useWeatherStore((s) => s.activeDeepDiveMetric);
  const closeDeepDive = useWeatherStore((s) => s.closeDeepDive);
  const weather = useWeatherStore((s) => s.weather);
  const airQuality = useWeatherStore((s) => s.airQuality);
  const units = useWeatherStore((s) => s.units);

  if (!activeMetric) return null;

  const data = getMetricDeepDiveData(activeMetric, weather, airQuality, units);
  if (!data) return null;

  const IconComp = ICON_MAP[activeMetric] || Activity;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDeepDive}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
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

          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {data.title}
                  </h3>
                  <p className="text-xs text-slate-400">{data.subtitle}</p>
                </div>
              </div>

              <button
                onClick={closeDeepDive}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close deep dive"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Value Hero */}
            <div className="my-4 flex items-baseline justify-between">
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {data.currentValue}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
                Live Telemetry
              </span>
            </div>

            {/* 'WHY?' Explanation Highlight Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 my-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Why this reading?</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {data.why}
              </p>
            </div>

            {/* 24-Hour Trend Chart (if hourly data available) */}
            {data.hourlyData?.length > 0 && (
              <div className="my-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                    <span>24-Hour Hourly Curve</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {data.chartLabel}
                  </span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="deepDiveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#F8FAFC',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={data.dataKey}
                        stroke="#38BDF8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#deepDiveGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Granular Breakdown Details */}
            {data.details?.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 my-3">
                {data.details.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between"
                  >
                    <span className="text-[11px] text-slate-400 font-medium">
                      {d.label}
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Derived from Open-Meteo High-Resolution Telemetry</span>
            <button
              onClick={closeDeepDive}
              className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
