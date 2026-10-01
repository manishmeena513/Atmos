import React, { useState, useEffect } from 'react';
import {
  Sliders,
  MapPin,
  Maximize2,
  CloudSun,
  Sparkles,
  Plane,
  CalendarCheck,
  Bookmark,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { WeatherAlerts } from '../notifications/WeatherAlerts';

export function Header({
  onOpenSearch,
  onOpenSettings,
  onEnterImmersive,
  onOpenStudio,
  onOpenTravel,
  onOpenPlan,
  onOpenMemories,
}) {
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);
  const toggleTempUnit = useWeatherStore((s) => s.toggleTempUnit);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080B10]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl py-2 sm:py-2.5'
          : 'bg-transparent py-3 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-[#080B10] rounded-[14px] flex items-center justify-center">
              <CloudSun className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tighter text-sm sm:text-lg text-white font-sans leading-tight">
              ATMOS
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-widest text-sky-400 font-mono -mt-0.5 uppercase">
              Living V2.5
            </span>
          </div>
        </div>

        {/* Center: City Search Trigger Pill */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl glass-panel glass-panel-hover text-xs sm:text-sm font-medium text-slate-200 border border-white/10 hover:border-sky-400/40 cursor-pointer max-w-[130px] sm:max-w-xs md:max-w-sm truncate"
          title="Search city or coordinates"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate font-semibold">{location.name}</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            · Search City
          </span>
        </button>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Atmos Studio Master Customizer */}
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/40 to-sky-600/40 hover:from-violet-600/60 hover:to-sky-600/60 text-sky-200 hover:text-white border border-sky-400/30 text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
            title="Atmos Studio: Themes, Glass, Typography, Dashboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          {/* Plan Your Day */}
          <button
            onClick={onOpenPlan}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Plan Your Day: Ideal window finder"
            aria-label="Plan Your Day"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Plan Day</span>
          </button>

          {/* Travel Mode */}
          <button
            onClick={onOpenTravel}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Travel Mode: Preview destination weather"
            aria-label="Travel Mode"
          >
            <Plane className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">Travel</span>
          </button>

          {/* Weather Memories */}
          <button
            onClick={onOpenMemories}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Weather Memories Journal"
            aria-label="Weather Memories"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Memories</span>
          </button>

          {/* Desktop ENTER WEATHER Button */}
          <button
            onClick={onEnterImmersive}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-sky-500/20 border border-sky-300/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Enter Full-Screen Weather Immersion"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Immersion</span>
          </button>

          {/* Mobile ENTER WEATHER Icon Button */}
          <button
            onClick={onEnterImmersive}
            className="md:hidden min-w-[32px] min-h-[32px] p-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 transition-colors cursor-pointer flex items-center justify-center"
            title="Enter Full-Screen Weather Immersion"
            aria-label="Enter Weather Immersion"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Browser Alerts Trigger */}
          <div className="hidden 2xl:block">
            <WeatherAlerts />
          </div>

          {/* Quick Unit Switch */}
          <button
            onClick={toggleTempUnit}
            className="min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer flex items-center justify-center select-none"
            title="Toggle °C / °F"
          >
            °{units.temp}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="min-w-[32px] min-h-[32px] p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer flex items-center justify-center select-none"
            aria-label="Open Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
