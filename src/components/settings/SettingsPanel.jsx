import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  Thermometer,
  Wind,
  Clock,
  Sparkles,
  Layers,
  Eye,
  Check,
  Zap,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

export function SettingsPanel({ isOpen, onClose }) {
  const units = useWeatherStore((s) => s.units);
  const setUnits = useWeatherStore((s) => s.setUnits);
  const glassMode = useWeatherStore((s) => s.glassMode);
  const toggleGlassMode = useWeatherStore((s) => s.toggleGlassMode);
  const animationIntensity = useWeatherStore((s) => s.animationIntensity);
  const setAnimationIntensity = useWeatherStore((s) => s.setAnimationIntensity);
  const reducedMotion = useWeatherStore((s) => s.reducedMotion);
  const setReducedMotion = useWeatherStore((s) => s.setReducedMotion);

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
              className="pointer-events-auto w-full sm:w-[440px] max-h-[90vh] sm:max-h-full bg-[#0c1322] border-t sm:border-t-0 sm:border-l border-white/10 shadow-2xl rounded-t-[28px] sm:rounded-none p-5 sm:p-6 overflow-y-auto flex flex-col justify-between"
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
                        Customize telemetry units & visual environment
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          units.temp === 'C'
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        °C Celsius
                      </button>
                      <button
                        onClick={() => setUnits('temp', 'F')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          units.temp === 'F'
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        °F Fahrenheit
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
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          units.wind === 'kmh'
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        km/h
                      </button>
                      <button
                        onClick={() => setUnits('wind', 'mph')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          units.wind === 'mph'
                            ? 'bg-sky-500 text-white shadow'
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
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          units.clock === '24h'
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        24-hour
                      </button>
                      <button
                        onClick={() => setUnits('clock', '12h')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          units.clock === '12h'
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        12-hour
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Immersive Visuals */}
                <div className="py-5 space-y-4 border-b border-white/5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Atmospheric Immersion
                  </div>

                  {/* Glass Window Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-sky-400" />
                        <span>Glass Window Mode</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Overlays frosted pane with dripping condensation & parallax
                      </p>
                    </div>

                    <button
                      onClick={toggleGlassMode}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        glassMode ? 'bg-sky-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          glassMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Animation Intensity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        <span>Particle & Effect Intensity</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['full', 'reduced', 'minimal'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setAnimationIntensity(mode)}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                            animationIntensity === mode
                              ? 'bg-sky-500 text-white shadow'
                              : 'bg-white/[0.04] text-slate-400 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reduced Motion Override */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-sky-400" />
                        <span>Reduced Motion</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Disables canvas particles and high-frequency animations
                      </p>
                    </div>

                    <button
                      onClick={() => setReducedMotion(!reducedMotion)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        reducedMotion ? 'bg-sky-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          reducedMotion ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Architecture Info Footer */}
              <div className="pt-6 border-t border-white/10 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Provider</span>
                  <span className="text-slate-400 font-medium">Open-Meteo (Keyless)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Architecture</span>
                  <span className="text-slate-400 font-medium">Vercel Serverless Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Version</span>
                  <span className="text-slate-400 font-mono">Atmos v1.0 (Phase 1)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
