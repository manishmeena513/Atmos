import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints,
  Flame,
  Bike,
  Camera,
  Trophy,
  Plane,
  BookOpen,
  Sun,
  Clock,
  Compass,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { ACTIVITIES, analyzeActivity } from '../../utils/activityEngine';

const ICON_MAP = {
  Footprints,
  Flame,
  Bike,
  Camera,
  Trophy,
  Plane,
  BookOpen,
  Sun,
};

export function ActivityMode() {
  const weather = useWeatherStore((s) => s.weather);
  const [selectedActivity, setSelectedActivity] = useState('walking');

  if (!weather?.hourly) return null;

  const analysis = analyzeActivity(selectedActivity, weather);

  const statusBadgeClass =
    analysis.status === 'GOOD CONDITIONS'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : analysis.status === 'MODERATE CONDITIONS'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-sky-400 font-bold">
              Should I Go Out?
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              What are you planning today?
            </h3>
          </div>
        </div>
        <span className="text-xs text-slate-400">
          Real-time weather suitability &amp; best time windows
        </span>
      </div>

      {/* Activity Pills Selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none no-scrollbar touch-pan-x overscroll-x-contain">
        {ACTIVITIES.map((act) => {
          const IconComp = ICON_MAP[act.icon] || Footprints;
          const isSelected = selectedActivity === act.id;

          return (
            <button
              key={act.id}
              onClick={() => setSelectedActivity(act.id)}
              className={`shrink-0 min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border border-sky-400'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{act.name}</span>
            </button>
          );
        })}
      </div>

      {/* Analysis Presentation Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedActivity}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Top Rating & Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${statusBadgeClass}`}>
                  {analysis.status || 'GOOD CONDITIONS'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/25">
                  {analysis.suitability}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">
                <span className="text-slate-400 font-semibold mr-1.5">Reason:</span>
                {analysis.summary}
              </p>
            </div>

            {/* Recommended Windows */}
            <div className="shrink-0 p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Recommended Time</span>
              </div>
              <div className="space-y-0.5">
                {analysis.bestWindows.map((win, idx) => (
                  <div key={idx} className="text-xs font-semibold text-white">
                    {win}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Factors Breakdown Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {analysis.factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {factor.label}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                    {factor.value}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">
                  {factor.detail}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
