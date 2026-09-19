import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export function MoonStarLayer({ theme, parallaxOffset = { x: 0, y: 0 } }) {
  if (!theme.starsVisible && !theme.moonVisible) return null;

  // Generate deterministic star coordinates
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 75; i++) {
      list.push({
        id: i,
        x: (i * 37) % 98 + 1,
        y: (i * 23) % 65 + 5,
        size: (i % 3) * 0.8 + 1,
        opacity: 0.3 + (i % 5) * 0.15,
        delay: (i % 7) * 0.5,
      });
    }
    return list;
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
      }}
    >
      {/* Twinkling Stars */}
      {theme.starsVisible && (
        <div className="absolute inset-0">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
              }}
              animate={{
                opacity: [star.opacity * 0.4, star.opacity * 1.3, star.opacity * 0.4],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2.5 + (star.id % 4),
                repeat: Infinity,
                delay: star.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Moon Disc & Aura */}
      {theme.moonVisible && (
        <motion.div
          className="absolute right-[15%] top-[15%] pointer-events-none"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 1.5 }}
        >
          {/* Moon Glow */}
          <div className="w-56 h-56 rounded-full absolute -top-16 -left-16 bg-sky-200/10 blur-3xl" />
          <div className="w-32 h-32 rounded-full absolute -top-4 -left-4 bg-sky-100/15 blur-xl" />

          {/* Moon Disc with subtle crater shading */}
          <div
            className="w-24 h-24 rounded-full relative shadow-inner overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #F8FAFC 0%, #E2E8F0 50%, #94A3B8 100%)',
              boxShadow: '0 0 35px 8px rgba(226, 232, 240, 0.25)',
            }}
          >
            {/* Crater details */}
            <div className="absolute top-4 left-6 w-5 h-5 rounded-full bg-slate-400/25 blur-xs" />
            <div className="absolute top-11 left-12 w-7 h-6 rounded-full bg-slate-400/20 blur-xs" />
            <div className="absolute bottom-4 left-5 w-4 h-4 rounded-full bg-slate-400/25 blur-xs" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
