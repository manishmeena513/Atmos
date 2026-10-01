import React, { useState, useEffect } from 'react';
import { WifiOff, Clock } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const lastUpdated = useWeatherStore((s) => s.lastUpdated);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  const timeLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'recently';

  return (
    <div className="fixed top-14 sm:top-18 inset-x-0 z-40 px-4 pointer-events-none flex justify-center animate-fade-in">
      <div className="pointer-events-auto max-w-md w-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-xl text-amber-200 px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">You&apos;re offline</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300/90 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Last updated {timeLabel}</span>
        </div>
      </div>
    </div>
  );
}
