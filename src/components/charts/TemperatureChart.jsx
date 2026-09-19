import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp, Thermometer } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="glass-panel rounded-xl px-3 py-2 text-xs border border-white/10 shadow-xl backdrop-blur-md">
      <div className="font-semibold text-slate-300 mb-0.5">{label}</div>
      <div className="flex items-center gap-1.5 text-white text-sm font-bold">
        <Thermometer className="w-3.5 h-3.5 text-sky-400" />
        <span>{data.temp}°{unit}</span>
      </div>
      <div className="text-[11px] text-slate-400 mt-0.5">
        Feels like {data.apparent}°{unit}
      </div>
    </div>
  );
}

export function TemperatureChart() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);

  if (!weather?.hourly?.temperature_2m) return null;

  // Format 24 hour points
  const chartData = [];
  const hoursCount = 24;

  for (let i = 0; i < hoursCount; i++) {
    const rawC = weather.hourly.temperature_2m[i];
    const rawApparentC = weather.hourly.apparent_temperature?.[i] ?? rawC;

    const temp =
      units.temp === 'F' ? Math.round((rawC * 9) / 5 + 32) : Math.round(rawC);
    const apparent =
      units.temp === 'F'
        ? Math.round((rawApparentC * 9) / 5 + 32)
        : Math.round(rawApparentC);

    const hourLabel = `${String(i).padStart(2, '0')}:00`;

    chartData.push({
      time: hourLabel,
      temp,
      apparent,
    });
  }

  // Calculate min & max for comfortable chart domain
  const temps = chartData.map((d) => d.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">
            24-Hour Temperature Curve
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Low: {Math.min(...temps)}° · High: {Math.max(...temps)}°{units.temp}
        </span>
      </div>

      <div className="w-full h-56 sm:h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={3}
            />

            <YAxis
              domain={[minTemp, maxTemp]}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}°`}
            />

            <Tooltip
              content={<CustomTooltip unit={units.temp} />}
              cursor={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="temp"
              stroke="#38BDF8"
              strokeWidth={2.5}
              fill="url(#tempAreaGradient)"
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
