import React from 'react';
import { motion } from 'framer-motion';

export function SunLayer({ theme, parallaxOffset = { x: 0, y: 0 } }) {
  if (!theme.sunVisible) return null;

  // Calculate position along arc based on solarProgress (0 to 1)
  const progress = Math.max(0.05, Math.min(0.95, theme.solarProgress || 0.5));
  const leftPercent = progress * 80 + 10; // 10% to 90%
  // Parabola: peaks at 14% from top at solar midday (progress = 0.5) on desktop
  const topPercent = 14 + 30 * Math.pow((progress - 0.5) * 2, 2);

  const isDawnOrSunset = theme.phase === 'dawn' || theme.phase === 'sunset';
  const sunColor = isDawnOrSunset ? '#FB923C' : '#FDE047';
  const glowColor = isDawnOrSunset ? 'rgba(251, 146, 60, 0.3)' : 'rgba(253, 224, 71, 0.25)';

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
      }}
    >
      {/* Mobile Sun Position (Anchored Top-Right, away from text) */}
      <div className="md:hidden absolute top-6 right-6 pointer-events-none">
        {/* Soft atmospheric ambient glow */}
        <div
          className="w-44 h-44 rounded-full absolute -top-12 -left-12 blur-2xl opacity-45 pointer-events-none animate-pulse-slow"
          style={{ background: glowColor }}
        />

        {/* Sun Core Disc */}
        <div
          className="w-14 h-14 rounded-full relative shadow-xl transition-all duration-700 opacity-90"
          style={{
            background: `radial-gradient(circle, #FFFFFF 20%, ${sunColor} 80%, transparent 100%)`,
            boxShadow: `0 0 35px 12px ${glowColor}`,
          }}
        />
      </div>

      {/* Desktop Sun Position (Celestial Arc Trajectory) */}
      <motion.div
        className="hidden md:block absolute pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.5 }}
      >
        {/* Outer ambient glow */}
        <div
          className="w-64 h-64 rounded-full absolute -top-20 -left-20 blur-3xl opacity-50 animate-pulse-slow pointer-events-none"
          style={{ background: glowColor }}
        />

        {/* Rotating soft rays */}
        <div
          className="w-36 h-36 rounded-full absolute -top-8 -left-8 animate-spin-slow opacity-40 blur-lg pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${glowColor} 45deg, transparent 90deg, ${glowColor} 135deg, transparent 180deg, ${glowColor} 225deg, transparent 270deg, ${glowColor} 315deg, transparent 360deg)`,
          }}
        />

        {/* Sun Core Disc */}
        <div
          className="w-20 h-20 rounded-full relative shadow-2xl transition-all duration-700 opacity-95"
          style={{
            background: `radial-gradient(circle, #FFFFFF 20%, ${sunColor} 80%, transparent 100%)`,
            boxShadow: `0 0 50px 16px ${glowColor}`,
          }}
        />
      </motion.div>
    </div>
  );
}
