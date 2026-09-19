import React, { useEffect, useRef, useState } from 'react';
import { useWeatherStore } from '../../store/weatherStore';

export function GlassOverlay() {
  const glassMode = useWeatherStore((s) => s.glassMode);
  const getCurrentTheme = useWeatherStore((s) => s.getCurrentTheme);
  const theme = getCurrentTheme();
  const isRaining = theme.particles?.type === 'rain';

  const canvasRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Cursor parallax
  useEffect(() => {
    if (!glassMode) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [glassMode]);

  // Rain droplets on glass canvas
  useEffect(() => {
    if (!glassMode || !isRaining) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Droplets on glass
    const droplets = [];
    for (let i = 0; i < 45; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.5 + Math.random() * 3.5,
        speed: 0.1 + Math.random() * 0.4,
        dripLength: 0,
        opacity: 0.4 + Math.random() * 0.4,
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];

        // Draw droplet lens highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        // Droplet specular glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Slow trickle down glass
        d.y += d.speed;
        if (d.y > height + 10) {
          d.y = -10;
          d.x = Math.random() * width;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [glassMode, isRaining]);

  if (!glassMode) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      }}
    >
      {/* Frosted Glass Pane Edge & Glint */}
      <div className="absolute inset-4 rounded-3xl border border-white/10 shadow-[inset_0_0_80px_rgba(255,255,255,0.03)] backdrop-blur-[2px] overflow-hidden">
        {/* Diagonal glass light reflection */}
        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rotate-12 pointer-events-none" />

        {/* Rain droplets on glass surface */}
        {isRaining && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}
