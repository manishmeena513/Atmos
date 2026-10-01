import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Palette,
  LayoutGrid,
  Compass,
  Bookmark,
  Zap,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  Type,
  Sun,
  Moon,
  Laptop,
  Flame,
  ShieldAlert,
  Plane,
  Plus,
  Trash2,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { THEME_PRESETS, FONTS } from '../../utils/themeEngine';

export function AtmosStudioModal() {
  const isOpen = useWeatherStore((s) => s.isStudioOpen);
  const closeStudio = useWeatherStore((s) => s.closeStudio);

  const themePreset = useWeatherStore((s) => s.themePreset);
  const setThemePreset = useWeatherStore((s) => s.setThemePreset);
  const themeMode = useWeatherStore((s) => s.themeMode);
  const setThemeMode = useWeatherStore((s) => s.setThemeMode);
  const customColors = useWeatherStore((s) => s.customColors);
  const setCustomColors = useWeatherStore((s) => s.setCustomColors);

  const glassSettings = useWeatherStore((s) => s.glassSettings);
  const setGlassSetting = useWeatherStore((s) => s.setGlassSetting);

  const typography = useWeatherStore((s) => s.typography);
  const setTypographySetting = useWeatherStore((s) => s.setTypographySetting);

  const dashboard = useWeatherStore((s) => s.dashboard);
  const toggleSectionVisibility = useWeatherStore((s) => s.toggleSectionVisibility);
  const moveSection = useWeatherStore((s) => s.moveSection);
  const setDashboardDensity = useWeatherStore((s) => s.setDashboardDensity);

  const effects = useWeatherStore((s) => s.effects);
  const setEffectSetting = useWeatherStore((s) => s.setEffectSetting);
  const reducedMotion = useWeatherStore((s) => s.reducedMotion);
  const setReducedMotion = useWeatherStore((s) => s.setReducedMotion);

  const profiles = useWeatherStore((s) => s.profiles);
  const saveProfile = useWeatherStore((s) => s.saveProfile);
  const applyProfile = useWeatherStore((s) => s.applyProfile);
  const deleteProfile = useWeatherStore((s) => s.deleteProfile);
  const autoAdapt = useWeatherStore((s) => s.autoAdapt);
  const toggleAutoAdapt = useWeatherStore((s) => s.toggleAutoAdapt);

  const resetAppearance = useWeatherStore((s) => s.resetAppearance);
  const resetDashboard = useWeatherStore((s) => s.resetDashboard);
  const resetAllSettings = useWeatherStore((s) => s.resetAllSettings);

  const openPlan = useWeatherStore((s) => s.openPlan);
  const openTravel = useWeatherStore((s) => s.openTravel);
  const openMemories = useWeatherStore((s) => s.openMemories);

  const [activeTab, setActiveTab] = useState('appearance');
  const [profileNameInput, setProfileNameInput] = useState('');

  if (!isOpen) return null;

  const TABS = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tools', label: 'Plan & Travel', icon: Compass },
    { id: 'profiles', label: 'Profiles', icon: Bookmark },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'reset', label: 'Reset', icon: RotateCcw },
  ];

  const PRESET_ACCENT_COLORS = [
    '#38BDF8', // Cyan Sky
    '#818CF8', // Indigo
    '#F97316', // Sunset Orange
    '#34D399', // Emerald
    '#2DD4BF', // Teal
    '#C084FC', // Violet
    '#FB7185', // Rose
    '#FBBF24', // Amber
    '#FFFFFF', // Stark White
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeStudio}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto"
        />

        {/* Studio Panel Drawer */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full sm:w-[500px] h-[92vh] sm:h-full bg-[#090d16] border-t sm:border-t-0 sm:border-l border-white/15 rounded-t-[32px] sm:rounded-none shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Top Title Bar */}
          <div className="p-5 sm:p-6 pb-3 border-b border-white/10 shrink-0">
            {/* Mobile drag handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Atmos Studio
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Living weather aesthetics &amp; personalization suite
                  </p>
                </div>
              </div>

              <button
                onClick={closeStudio}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Atmos Studio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Horizontal Tabs Scroller */}
            <div className="flex gap-1.5 overflow-x-auto pt-4 scrollbar-none no-scrollbar touch-pan-x">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 border border-sky-400/50'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* ================= TAB 1: APPEARANCE ================= */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* 1. Theme Presets */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-sky-400 block mb-2.5">
                    1. Atmospheric Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEME_PRESETS.map((p) => {
                      const isSelected = themePreset === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setThemePreset(p.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-sky-500/15 border-sky-400 text-white shadow-md'
                              : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs truncate">{p.name}</span>
                            <span
                              className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                              style={{ background: p.accent }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 line-clamp-2">
                            {p.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Mode: Dark / Light / AMOLED / Reactive */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-sky-400 block mb-2 flex items-center justify-between">
                    <span>2. Mode &amp; Atmosphere</span>
                    <span className="text-[10px] text-slate-400 font-normal uppercase">OLED &amp; Day/Night</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/[0.03] rounded-2xl border border-white/5">
                    {[
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'amoled', label: 'AMOLED', icon: Laptop },
                      { id: 'reactive', label: 'Reactive', icon: Sparkles },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setThemeMode(m.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          themeMode === m.id
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <m.icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Custom Color System */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-sky-400 block mb-2 flex items-center justify-between">
                    <span>3. Custom Accent Tint</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-Contrast Guard Active</span>
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {PRESET_ACCENT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCustomColors({ accent: c, glow: c })}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                        style={{
                          backgroundColor: c,
                          borderColor: (customColors.accent || '#38BDF8') === c ? '#FFFFFF' : 'transparent',
                        }}
                      >
                        {(customColors.accent || '#38BDF8') === c && (
                          <Check className="w-3.5 h-3.5 text-black" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Glass Studio */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                    <Layers className="w-4 h-4" />
                    <span>4. Glass Studio</span>
                  </div>

                  {/* Glass Level */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5">Glass Intensity</span>
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/30 rounded-xl">
                      {['off', 'soft', 'medium', 'strong'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setGlassSetting('level', lvl)}
                          className={`py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            glassSettings.level === lvl
                              ? 'bg-sky-500 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blur Radius */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Blur Strength</span>
                      <span className="text-white font-mono">{glassSettings.blur || 20}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="36"
                      step="4"
                      value={glassSettings.blur || 20}
                      onChange={(e) => setGlassSetting('blur', parseInt(e.target.value, 10))}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  {/* Border Styling */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5">Glass Border</span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/30 rounded-xl">
                      {['off', 'subtle', 'bright'].map((b) => (
                        <button
                          key={b}
                          onClick={() => setGlassSetting('border', b)}
                          className={`py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            glassSettings.border === b
                              ? 'bg-sky-500 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Typography Studio */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                    <Type className="w-4 h-4" />
                    <span>5. Typography Studio</span>
                  </div>

                  {/* Font Family */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5">Typeface Family</span>
                    <div className="grid grid-cols-2 gap-2">
                      {FONTS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setTypographySetting('font', f.id)}
                          className={`p-2 rounded-xl text-left border text-xs transition-all ${
                            typography.font === f.id
                              ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                              : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'
                          }`}
                          style={{ fontFamily: f.family }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Temperature Format */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5">Temperature Format</span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/30 rounded-xl text-center">
                      {[
                        { id: 'clean', label: '26°' },
                        { id: 'spaced', label: '26 °C' },
                        { id: 'unit', label: '26°C' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          onClick={() => setTypographySetting('tempFormat', fmt.id)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            typography.tempFormat === fmt.id
                              ? 'bg-sky-500 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: DASHBOARD BUILDER ================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Dashboard Composition
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize which sections appear on your screen and reorder their position.
                  </p>
                </div>

                {/* Density Selector */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Spacing &amp; Information Density
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.03] rounded-2xl border border-white/5">
                    {[
                      { id: 'compact', label: 'Compact' },
                      { id: 'comfortable', label: 'Comfortable' },
                      { id: 'spacious', label: 'Spacious' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDashboardDensity(d.id)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          dashboard.density === d.id
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Visibility & Reordering List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Sections Order &amp; Visibility
                  </span>

                  {dashboard.sections.map((section, idx) => (
                    <div
                      key={section.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                        section.visible
                          ? 'bg-white/[0.04] border-white/10 text-white'
                          : 'bg-white/[0.01] border-white/5 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleSectionVisibility(section.id)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                          title={section.visible ? 'Hide section' : 'Show section'}
                        >
                          {section.visible ? (
                            <Eye className="w-4 h-4 text-sky-400" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-xs font-medium truncate">
                          {section.name}
                        </span>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={idx === dashboard.sections.length - 1}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={resetDashboard}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  Reset Dashboard to Default Order
                </button>
              </div>
            )}

            {/* ================= TAB 3: PLAN & TRAVEL ================= */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Intelligence Tools
                  </h3>
                  <p className="text-xs text-slate-400">
                    Plan outdoor schedules, inspect travel destinations, and view your climate journal.
                  </p>
                </div>

                {/* Plan Your Day Trigger Card */}
                <div
                  onClick={() => {
                    closeStudio();
                    openPlan();
                  }}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        Plan Your Day
                      </div>
                      <div className="text-xs text-slate-400">
                        Find optimal weather windows for running, hiking, or study
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-sky-400">Open →</span>
                </div>

                {/* Travel Mode Trigger Card */}
                <div
                  onClick={() => {
                    closeStudio();
                    openTravel();
                  }}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        Travel Mode
                      </div>
                      <div className="text-xs text-slate-400">
                        Inspect travel destination weather, packing, and rain outlook
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-indigo-400">Open →</span>
                </div>

                {/* Weather Memories Trigger Card */}
                <div
                  onClick={() => {
                    closeStudio();
                    openMemories();
                  }}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        Weather Memories Journal
                      </div>
                      <div className="text-xs text-slate-400">
                        Historical local snapshots of memorable weather moments
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-400">Open →</span>
                </div>
              </div>
            )}

            {/* ================= TAB 4: PROFILES ================= */}
            {activeTab === 'profiles' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Personalization Profiles
                  </h3>
                  <p className="text-xs text-slate-400">
                    Save your custom combination of theme, glass, typography, and density into one-tap profiles.
                  </p>
                </div>

                {/* Auto Adapt Toggle */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Auto Adapt Atmosphere</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automatically shifts theme between Day, Sunset, and Night
                    </p>
                  </div>
                  <button
                    onClick={toggleAutoAdapt}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      autoAdapt ? 'bg-sky-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        autoAdapt ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Save Current Setup */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileNameInput}
                    onChange={(e) => setProfileNameInput(e.target.value)}
                    placeholder="New profile name (e.g. AMOLED Midnight)..."
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    onClick={() => {
                      if (profileNameInput.trim()) {
                        saveProfile(profileNameInput);
                        setProfileNameInput('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>

                {/* Saved Profiles List */}
                <div className="space-y-2">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.themePreset} · {p.themeMode} · {p.typography?.font || 'atmos'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => applyProfile(p.id)}
                          className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 text-xs font-semibold cursor-pointer"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => deleteProfile(p.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                          title="Delete profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 5: PERFORMANCE ================= */}
            {activeTab === 'performance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Performance &amp; Battery
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fine-tune hardware rendering for optimal framerates on mobile and desktop.
                  </p>
                </div>

                {/* Performance Mode */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Performance Preset
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'battery', label: 'Battery Saver', desc: 'Minimal effects & blur' },
                      { id: 'balanced', label: 'Balanced', desc: 'Default smooth Atmos' },
                      { id: 'cinematic', label: 'Cinematic', desc: 'Maximum visual fidelity' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setEffectSetting('performanceMode', mode.id)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          effects.performanceMode === mode.id
                            ? 'bg-sky-500/20 border-sky-400 text-white'
                            : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white mb-0.5">{mode.label}</div>
                        <div className="text-[10px] text-slate-400">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Reduced Motion</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Disables particle loops and large scale animations
                    </p>
                  </div>
                  <button
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      reducedMotion ? 'bg-sky-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        reducedMotion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* ================= TAB 6: RESET ================= */}
            {activeTab === 'reset' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
                    Reset &amp; Restore
                  </h3>
                  <p className="text-xs text-slate-400">
                    Restore default settings without removing your saved city bookmarks.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={resetAppearance}
                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Reset Appearance &amp; Theming</span>
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={resetDashboard}
                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Reset Dashboard Layout to Default</span>
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset all Atmos personalization and dashboard settings?')) {
                        resetAllSettings();
                      }
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold text-rose-300 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Reset All Atmos Settings</span>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#070b13] flex items-center justify-between text-xs text-slate-500">
            <span>Atmos V2.5 · Living Experience</span>
            <button
              onClick={closeStudio}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
