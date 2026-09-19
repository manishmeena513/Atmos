import React, { useEffect, useRef } from 'react';
import { getDeviceTier } from '../../utils/deviceTier';

export function SnowLayer({ theme, windSpeed = 8, windDirection = 180 }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
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

    const device = getDeviceTier();
    const density = theme.particles?.density || 0.6;
    const flakeCount = Math.floor(device.maxSnowParticles * density);

    const windRad = ((windDirection + 180) % 360) * (Math.PI / 180);
    const windHorizontal = Math.sin(windRad) * Math.min(windSpeed, 30) * 0.2;

    const flakes = [];
    for (let i = 0; i < flakeCount; i++) {
      // 3 depth layers: 0: far, 1: mid, 2: near
      const depth = Math.random() < 0.5 ? 0 : Math.random() < 0.8 ? 1 : 2;
      const size = depth === 0 ? 1.5 + Math.random() : depth === 1 ? 2.5 + Math.random() * 1.5 : 4 + Math.random() * 2;
      const speed = depth === 0 ? 0.8 + Math.random() * 0.6 : depth === 1 ? 1.4 + Math.random() * 0.8 : 2.2 + Math.random() * 1.2;
      const opacity = depth === 0 ? 0.35 : depth === 1 ? 0.6 : 0.85;

      flakes.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        size,
        speed,
        opacity,
        depth,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    let isVisible = !document.hidden;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isVisible) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();

        f.wobble += f.wobbleSpeed;
        f.x += Math.sin(f.wobble) * (f.depth + 0.8) + windHorizontal;
        f.y += f.speed;

        if (f.y > height + 10) {
          f.y = -10;
          f.x = Math.random() * (width + 200) - 100;
        }
        if (f.x > width + 100) f.x = -50;
        if (f.x < -100) f.x = width + 50;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [theme, windSpeed, windDirection]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
