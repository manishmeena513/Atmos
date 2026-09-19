import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, ShieldAlert } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

export function WeatherAlerts() {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);

  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted' && weather?.current) {
        new Notification(`Atmos Telemetry Active · ${location.name}`, {
          body: `Monitoring atmospheric conditions (${Math.round(weather.current.temperature_2m)}°C, ${weather.current.relative_humidity_2m}% humidity).`,
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  // Trigger data-backed notification on severe changes
  useEffect(() => {
    if (permission !== 'granted' || !weather?.current) return;

    const precip = weather.current.precipitation || 0;
    const wind = weather.current.wind_speed_10m || 0;

    if (precip > 1.5) {
      new Notification(`Precipitation Advisory · ${location.name}`, {
        body: `Active rainfall detected (${precip} mm/h). Carry waterproof protection.`,
      });
    } else if (wind > 45) {
      new Notification(`High Wind Advisory · ${location.name}`, {
        body: `Gale force winds of ${Math.round(wind)} km/h recorded.`,
      });
    }
  }, [weather?.current?.weather_code, permission]);

  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  return (
    <button
      onClick={requestPermission}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
        permission === 'granted'
          ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
          : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/5'
      }`}
      title={permission === 'granted' ? 'Atmospheric telemetry alerts active' : 'Enable live weather alerts'}
    >
      {permission === 'granted' ? (
        <>
          <BellRing className="w-3.5 h-3.5 text-sky-400" />
          <span>Alerts On</span>
        </>
      ) : (
        <>
          <Bell className="w-3.5 h-3.5" />
          <span>Enable Alerts</span>
        </>
      )}
    </button>
  );
}
