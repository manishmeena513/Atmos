import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints,
  Flame,
  Bike,
  Camera,
  Trophy,
  Car,
  Plane,
  BookOpen,
  Clock,
  Sparkles,
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
  Car,
  Plane,
  BookOpen,
};

export function ActivityMode() {
  const weather = useWeatherStore((s) => s.weather);
  const [selectedActivity, setSelectedActivity] = useState('walking');

  if (!weather?.hourly) return null;

  const analysis = analyzeActivity(selectedActivity, weather);

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              What are you planning today?
            </h3>
            <p className="text-xs text-slate-400">
              Personalized weather analysis and recommended time windows
            </p>
          </div>
        </div>
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
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Suitability Status
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {analysis.suitability}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">
                {analysis.summary}
              </p>
            </div>

            {/* Recommended Windows */}
            <div className="shrink-0 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Prime Windows</span>
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
