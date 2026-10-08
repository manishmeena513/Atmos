import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  Thermometer,
  Wind,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

export function SettingsPanel({ isOpen, onClose, onOpenStudio }) {
  const units = useWeatherStore((s) => s.units);
  const setUnits = useWeatherStore((s) => s.setUnits);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-in Drawer on Desktop / Bottom Sheet on Mobile */}
          <div className="fixed inset-0 pointer-events-none flex items-end sm:items-stretch sm:justify-end">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="pointer-events-auto w-full sm:w-[420px] max-h-[90vh] sm:max-h-full glass-surface-modal border-t sm:border-t-0 sm:border-l border-white/10 shadow-2xl rounded-t-[28px] sm:rounded-none p-5 sm:p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Mobile Drag Handle */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Preferences
                      </h3>
                      <p className="text-xs text-slate-400">
                        Measurement units & meteorological standards
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Section: Measurement Units */}
                <div className="py-5 space-y-4 border-b border-white/5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Measurement Units
                  </div>

                  {/* Temperature */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <Thermometer className="w-4 h-4 text-sky-400" />
                      <span>Temperature</span>
                    </div>
                    <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
                      <button
                        onClick={() => setUnits('temp', 'C')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          units.temp === 'C'
                            ? 'bg-sky-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        °C
                      </button>
                      <button
                        onClick={() => setUnits('temp', 'F')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          units.temp === 'F'
                            ? 'bg-sky-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        °F
                      </button>
                    </div>
                  </div>

                  {/* Wind Speed */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <Wind className="w-4 h-4 text-sky-400" />
                      <span>Wind Speed</span>
                    </div>
                    <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
                      <button
                        onClick={() => setUnits('wind', 'kmh')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          units.wind === 'kmh'
                            ? 'bg-sky-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        km/h
                      </button>
                      <button
                        onClick={() => setUnits('wind', 'mph')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          units.wind === 'mph'
                            ? 'bg-sky-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        mph
                      </button>
                    </div>
                  </div>

                  {/* Clock Format */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>Clock Format</span>
                    </div>
                    <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
                      <button
                        onClick={() => setUnits('clock', '24h')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          units.clock === '24h'
                            ? 'bg-sky-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        24-hour
                      </button>
                      <button
                        onClick={() => setUnits('clock', '12h')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          units.clock === '12h'
                            ? 'bg-sky-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        12-hour
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Centralized Personalization Hub Callout */}
                <div className="py-5 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Appearance & Themes
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600/15 via-sky-600/10 to-transparent border border-white/10 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <h4 className="text-sm font-bold text-white">Atmos Studio</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All visual customization—including 10 theme presets, frosted glass, typography styles, and dashboard reordering—is centralized in Atmos Studio.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenStudio) onOpenStudio();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm text-center"
                    >
                      Open Atmos Studio
                    </button>
                  </div>
                </div>
              </div>

              {/* Architecture Info Footer */}
              <div className="pt-6 border-t border-white/10 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Provider</span>
                  <span className="text-slate-400 font-medium">Open-Meteo High-Resolution</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Version</span>
                  <span className="text-slate-400 font-mono">Atmos V3.1</span>
                </div>
                <div className="text-center pt-2 text-slate-600">
                  Developed by Manish Meena
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SettingsPanel;
