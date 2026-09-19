import React from 'react';
import { motion } from 'framer-motion';

export function CloudLayer({
  theme,
  farOffset = { x: 0, y: 0 },
  midOffset = { x: 0, y: 0 },
  nearOffset = { x: 0, y: 0 },
  isImmersive = false,
}) {
  const density = theme.clouds?.density || 0.2;
  const cloudColor = theme.cloudColor || 'rgba(255, 255, 255, 0.3)';

  if (density < 0.05) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Far Cloud Layer (Slow, Higher, More Transparent, Far Parallax) */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${farOffset.x}px, ${farOffset.y}px, 0)`,
        }}
      >
        <motion.div
          className="absolute -top-10 left-0 w-[200%] h-96 flex opacity-40 animate-drift-slow"
          style={{ filter: 'blur(34px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: density * (isImmersive ? 0.75 : 0.6) }}
          transition={{ duration: 1.5 }}
        >
          <div
            className="w-1/2 h-full rounded-[40%] scale-y-50"
            style={{ background: cloudColor }}
          />
          <div
            className="w-1/2 h-full rounded-[50%] scale-y-60 ml-20"
            style={{ background: cloudColor }}
          />
        </motion.div>
      </div>

      {/* Mid Cloud Layer (Medium speed, Organic Shapes, Mid Parallax) */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${midOffset.x}px, ${midOffset.y}px, 0)`,
        }}
      >
        <motion.div
          className="absolute top-10 left-0 w-[200%] h-80 flex opacity-60 animate-drift-mid"
          style={{ filter: 'blur(22px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: density * (isImmersive ? 0.9 : 0.8) }}
          transition={{ duration: 1.5 }}
        >
          <div
            className="w-[45%] h-64 rounded-full scale-y-65"
            style={{ background: cloudColor }}
          />
          <div
            className="w-[55%] h-72 rounded-full scale-y-50 ml-12"
            style={{ background: cloudColor }}
          />
        </motion.div>
      </div>

      {/* Near Cloud Layer (Only when overcast / storm / dense clouds, Near Parallax) */}
      {density > 0.6 && (
        <div
          className="absolute inset-0 transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${nearOffset.x}px, ${nearOffset.y}px, 0)`,
          }}
        >
          <motion.div
            className="absolute -top-20 -left-10 w-[220%] h-96 flex opacity-75 animate-drift-fast"
            style={{ filter: 'blur(16px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: (density - 0.5) * (isImmersive ? 1.8 : 1.5) }}
            transition={{ duration: 1.5 }}
          >
            <div
              className="w-1/3 h-80 rounded-full"
              style={{ background: cloudColor }}
            />
            <div
              className="w-1/2 h-96 rounded-full -ml-16"
              style={{ background: cloudColor }}
            />
            <div
              className="w-1/3 h-80 rounded-full -ml-20"
              style={{ background: cloudColor }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
