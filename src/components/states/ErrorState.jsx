import React from 'react';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

export function ErrorState({ error, onOpenSearch }) {
  const fetchData = useWeatherStore((s) => s.fetchData);
  const location = useWeatherStore((s) => s.location);

  const handleRetry = () => {
    fetchData(location.lat, location.lon);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 text-center border border-rose-500/20 shadow-2xl space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Atmospheric Signal Lost
          </h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {error || 'Unable to establish connection with the weather telemetry satellites.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-200 text-sm font-medium border border-white/10 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search City</span>
          </button>
        </div>
      </div>
    </div>
  );
}
