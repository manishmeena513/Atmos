import React from 'react';
import { motion } from 'framer-motion';

export function SunLayer({ theme, parallaxOffset = { x: 0, y: 0 } }) {
  if (!theme.sunVisible) return null;

  // Calculate position along arc based on solarProgress (0 to 1)
  const progress = Math.max(0.05, Math.min(0.95, theme.solarProgress || 0.5));
  const leftPercent = progress * 80 + 10; // 10% to 90%
  // Parabola: peaks at 18% from top at solar midday (progress = 0.5)
  const topPercent = 18 + 35 * Math.pow((progress - 0.5) * 2, 2);

  const isDawnOrSunset = theme.phase === 'dawn' || theme.phase === 'sunset';
  const sunColor = isDawnOrSunset ? '#FB923C' : '#FDE047';
  const glowColor = isDawnOrSunset ? 'rgba(251, 146, 60, 0.4)' : 'rgba(253, 224, 71, 0.35)';

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
      }}
    >
      <motion.div
        className="absolute pointer-events-none transition-all duration-1000 ease-out"
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
          className="w-72 h-72 rounded-full absolute -top-24 -left-24 blur-3xl animate-pulse-slow pointer-events-none"
          style={{ background: glowColor }}
        />

        {/* Rotating soft rays */}
        <div
          className="w-44 h-44 rounded-full absolute -top-10 -left-10 animate-spin-slow opacity-60 blur-xl pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${glowColor} 45deg, transparent 90deg, ${glowColor} 135deg, transparent 180deg, ${glowColor} 225deg, transparent 270deg, ${glowColor} 315deg, transparent 360deg)`,
          }}
        />

        {/* Sun Core Disc */}
        <div
          className="w-24 h-24 rounded-full relative shadow-2xl transition-all duration-700"
          style={{
            background: `radial-gradient(circle, #FFFFFF 20%, ${sunColor} 80%, transparent 100%)`,
            boxShadow: `0 0 60px 20px ${glowColor}`,
          }}
        />
      </motion.div>
    </div>
  );
}
