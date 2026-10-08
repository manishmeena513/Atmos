import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Maximize2,
  CloudSun,
  Sparkles,
  Plane,
  CalendarCheck,
  Bookmark,
  Share2,
  SlidersHorizontal,
  X,
  Settings,
  Thermometer,
  Clock,
  Compass,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

export function Header({
  onOpenSearch,
  onOpenSettings,
  onEnterImmersive,
  onOpenStudio,
  onOpenTravel,
  onOpenPlan,
  onOpenMemories,
  onOpenShare,
}) {
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);
  const toggleTempUnit = useWeatherStore((s) => s.toggleTempUnit);
  const setUnits = useWeatherStore((s) => s.setUnits);

  const [scrolled, setScrolled] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toolItems = [
    {
      id: 'studio',
      name: 'Atmos Studio',
      desc: 'Themes, Glass, Typography & Layout',
      icon: Sparkles,
      iconColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      action: onOpenStudio,
    },
    {
      id: 'immersive',
      name: 'Enter Immersion',
      desc: 'Full-screen cinematic living sky',
      icon: Maximize2,
      iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      action: onEnterImmersive,
    },
    {
      id: 'plan',
      name: 'Plan Your Day',
      desc: 'Ideal activity window finder',
      icon: CalendarCheck,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      action: onOpenPlan,
    },
    {
      id: 'travel',
      name: 'Travel Mode',
      desc: 'Dual destination weather preview',
      icon: Plane,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      action: onOpenTravel,
    },
    {
      id: 'memories',
      name: 'Weather Memories',
      desc: 'Local snapshot weather journal',
      icon: Bookmark,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      action: onOpenMemories,
    },
    {
      id: 'share',
      name: 'Share Weather Card',
      desc: 'Export 9:16, 1:1, or 16:9 social cards',
      icon: Share2,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      action: onOpenShare,
    },
    {
      id: 'settings',
      name: 'Preferences',
      desc: 'Units & meteorological defaults',
      icon: Settings,
      iconColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      action: onOpenSettings,
    },
  ];

  return (
    <>
      {/* 1. CLEAN PRIMARY HEADER (Never a toolbar) */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--atmos-bg)]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl py-2 sm:py-2.5'
            : 'bg-transparent py-3 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-8 flex items-center justify-between gap-2">
          {/* Primary Control 1: Atmos Wordmark Branding */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-md shadow-sky-500/20 shrink-0">
              <div className="w-full h-full bg-[var(--atmos-bg,#080B10)] rounded-[10px] flex items-center justify-center">
                <CloudSun className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-white font-sans leading-none">
              ATMOS
            </span>
          </div>

          {/* Primary Control 2: Current Location (Tap to search) */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-panel glass-panel-hover text-xs sm:text-sm font-medium text-slate-200 border border-white/10 hover:border-sky-400/40 cursor-pointer max-w-[170px] sm:max-w-xs md:max-w-sm truncate"
            title="Search city or coordinates"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate font-semibold">{location.name}</span>
            {location.country && (
              <span className="text-slate-400 text-xs hidden sm:inline">
                · {location.country}
              </span>
            )}
          </button>

          {/* Primary Control 3: Compact Actions & Menu Control */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop-only: Quick Unit Switch */}
            <button
              onClick={toggleTempUnit}
              className="hidden md:flex min-h-[32px] px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer items-center justify-center select-none"
              title="Toggle °C / °F"
            >
              °{units.temp}
            </button>

            {/* Desktop-only: Direct Studio Pill */}
            <button
              onClick={onOpenStudio}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-sky-200 hover:text-white border border-sky-400/25 text-xs font-semibold transition-all cursor-pointer"
              title="Atmos Studio: Themes, Glass, Typography"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Studio</span>
            </button>

            {/* Compact Master Tools Menu Trigger */}
            <button
              onClick={() => setIsToolsOpen(true)}
              className="min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              aria-label="Open Tools and Actions Menu"
              title="Tools & Intelligence Menu"
            >
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline text-xs font-medium text-slate-300">
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. COMPACT SECONDARY TOOLS & ACTIONS SHEET */}
      <AnimatePresence>
        {isToolsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsToolsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Slide-over Drawer / Bottom Sheet */}
            <div className="fixed inset-0 pointer-events-none flex items-end sm:items-stretch sm:justify-end">
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="pointer-events-auto w-full sm:w-[420px] max-h-[88vh] sm:max-h-full glass-surface-modal border-t sm:border-t-0 sm:border-l border-white/15 shadow-2xl rounded-t-[28px] sm:rounded-none p-5 sm:p-6 overflow-y-auto flex flex-col justify-between"
              >
                <div>
                  {/* Mobile Drag Pill */}
                  <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

                  {/* Sheet Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          Tools & Actions
                        </h3>
                        <p className="text-xs text-slate-400">
                          Weather intelligence & customization
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsToolsOpen(false)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      aria-label="Close tools menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tool Tiles List */}
                  <div className="py-4 space-y-2">
                    {toolItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setIsToolsOpen(false);
                            if (item.action) item.action();
                          }}
                          className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all text-left cursor-pointer group active:scale-[0.98]"
                        >
                          <div
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.iconColor} group-hover:scale-105 transition-transform`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Unit Preferences Row */}
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Quick Units
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Temp Unit */}
                      <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
                        <button
                          onClick={() => setUnits('temp', 'C')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            units.temp === 'C'
                              ? 'bg-sky-500 text-slate-950 font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          °C
                        </button>
                        <button
                          onClick={() => setUnits('temp', 'F')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            units.temp === 'F'
                              ? 'bg-sky-500 text-slate-950 font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          °F
                        </button>
                      </div>

                      {/* Wind Unit */}
                      <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
                        <button
                          onClick={() => setUnits('wind', 'kmh')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            units.wind === 'kmh'
                              ? 'bg-sky-500 text-slate-950 font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          km/h
                        </button>
                        <button
                          onClick={() => setUnits('wind', 'mph')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            units.wind === 'mph'
                              ? 'bg-sky-500 text-slate-950 font-bold shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          mph
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Attribution */}
                <div className="pt-4 border-t border-white/10 text-center text-[11px] text-slate-500">
                  <span>Atmos V3.1 · Developed by Manish Meena</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
