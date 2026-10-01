import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Compass,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wind,
  Droplets,
  Sun,
  Sparkles,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { PLANNING_ACTIVITIES, evaluatePlanWindow } from '../../utils/planningEngine';

export function PlanYourDayModal() {
  const isOpen = useWeatherStore((s) => s.isPlanOpen);
  const closePlan = useWeatherStore((s) => s.closePlan);
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);

  const [selectedActivity, setSelectedActivity] = useState('walking');
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [selectedDate, setSelectedDate] = useState('today');

  if (!isOpen) return null;

  const result = evaluatePlanWindow({
    activityId: selectedActivity,
    durationHours: selectedDuration,
    targetDate: selectedDate,
    weather,
    units,
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePlan}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0b1220] border-t sm:border border-white/15 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
        >
          {/* Mobile Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Plan Your Day
                  </h3>
                  <p className="text-xs text-slate-400">
                    Find the optimal weather window for your schedule
                  </p>
                </div>
              </div>

              <button
                onClick={closePlan}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close planning"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Select Activity */}
            <div className="my-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                1. Choose Activity
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLANNING_ACTIVITIES.map((act) => {
                  const isSelected = selectedActivity === act.id;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setSelectedActivity(act.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                          : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="block truncate">{act.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Duration & Day Pickers */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {/* Duration */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Duration</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                  {[1, 2, 3].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setSelectedDuration(dur)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedDuration === dur
                          ? 'bg-sky-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {dur} hr{dur > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target Day</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'tomorrow', label: 'Tomorrow' },
                    { id: 'day_after', label: 'Day 3' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDate(d.id)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedDate === d.id
                          ? 'bg-sky-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Evaluation Result Presentation */}
            <div className="mt-5">
              {result.found ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-white/[0.02] to-transparent border border-sky-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Best Available Window</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Score: {result.score}/100
                    </span>
                  </div>

                  {/* Window Hours Display */}
                  <div className="text-2xl sm:text-3xl font-extrabold text-white my-1 tracking-tight">
                    {result.windowLabel}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                    {result.summary}
                  </p>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block">Temp</span>
                      <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{result.tempDisplay}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block">Rain Risk</span>
                      <span className="text-xs sm:text-sm font-bold text-sky-400 mt-0.5 block">{result.rainDisplay}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block">Wind</span>
                      <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{result.windDisplay}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block">UV Index</span>
                      <span className="text-xs sm:text-sm font-bold text-amber-400 mt-0.5 block">{result.uvDisplay}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-2">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{result.message}</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    {result.reason || 'Forecast conditions do not provide a favorable window for this activity.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Evaluated from Open-Meteo hourly model</span>
            <button
              onClick={closePlan}
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
