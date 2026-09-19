import React, { useEffect, useRef } from 'react';
import { getDeviceTier } from '../../utils/deviceTier';

export function RainLayer({ theme, windSpeed = 10, windDirection = 180 }) {
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
    const density = theme.particles?.density || 0.5;
    const dropCount = Math.floor(device.maxRainParticles * density);

    // Wind angle calculation (windDirection is meteorological 0-360, where it blows FROM)
    // Horizontal drift dx
    const windRad = ((windDirection + 180) % 360) * (Math.PI / 180);
    const windHorizontal = Math.sin(windRad) * Math.min(windSpeed, 40) * 0.4;

    // Drops array
    const drops = [];
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        length: 12 + Math.random() * 18,
        speed: 14 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.35,
        width: 0.75 + Math.random() * 0.75,
      });
    }

    // Splashes
    const splashes = [];

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

      // Render & update rain drops
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        ctx.strokeStyle = `rgba(186, 230, 253, ${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + windHorizontal * (d.length / 10), d.y + d.length);
        ctx.stroke();

        d.x += windHorizontal;
        d.y += d.speed;

        // Reset drop when hitting bottom
        if (d.y > height) {
          d.y = -20;
          d.x = Math.random() * (width + 200) - 100;

          // Occasional splash
          if (Math.random() < 0.25) {
            splashes.push({
              x: d.x,
              y: height - Math.random() * 20,
              radius: 1,
              maxRadius: 3 + Math.random() * 4,
              opacity: 0.3,
            });
          }
        }
      }

      // Render splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.strokeStyle = `rgba(186, 230, 253, ${s.opacity})`;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.radius * 2, s.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();

        s.radius += 0.4;
        s.opacity -= 0.03;

        if (s.opacity <= 0 || s.radius > s.maxRadius) {
          splashes.splice(i, 1);
        }
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
