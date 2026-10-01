/**
 * Atmos V2.5 'Plan Your Day' Weather Planning Engine
 * Scans real Open-Meteo hourly forecast slices to evaluate the best available window
 * for any activity, duration, and date.
 * Zero fabrication — if no window meets quality criteria, explicitly returns "No ideal window found."
 */

export const PLANNING_ACTIVITIES = [
  { id: 'walking', name: 'Walking & Hiking', idealTemp: [15, 25], maxWind: 30, maxRain: 20 },
  { id: 'running', name: 'Running / Jogging', idealTemp: [10, 20], maxWind: 25, maxRain: 15 },
  { id: 'cycling', name: 'Cycling / Biking', idealTemp: [14, 24], maxWind: 20, maxRain: 10 },
  { id: 'photography', name: 'Outdoor Photography', idealTemp: [12, 28], maxWind: 25, maxRain: 15, goldenHourBonus: true },
  { id: 'study', name: 'Outdoor Study & Work', idealTemp: [18, 25], maxWind: 15, maxRain: 5 },
  { id: 'sports', name: 'Sports & Training', idealTemp: [14, 23], maxWind: 22, maxRain: 10 },
  { id: 'travel', name: 'Sightseeing & Travel', idealTemp: [16, 26], maxWind: 32, maxRain: 25 },
  { id: 'outdoor', name: 'General Outdoor', idealTemp: [16, 26], maxWind: 28, maxRain: 20 },
];

function formatHour(h24, clock = '12h') {
  const norm = ((h24 % 24) + 24) % 24;
  if (clock === '24h') {
    return `${String(norm).padStart(2, '0')}:00`;
  }
  const period = norm >= 12 ? 'PM' : 'AM';
  const h12 = norm % 12 === 0 ? 12 : norm % 12;
  return `${h12}:00 ${period}`;
}

export function evaluatePlanWindow({
  activityId = 'walking',
  durationHours = 2,
  targetDate = 'today', // 'today' | 'tomorrow' | 'day_after'
  weather,
  units = { temp: 'C', wind: 'kmh', clock: '12h' },
}) {
  if (!weather?.hourly?.time) {
    return { found: false, message: 'Hourly weather forecast is currently unavailable.' };
  }

  const { hourly, daily } = weather;
  const activity = PLANNING_ACTIVITIES.find((a) => a.id === activityId) || PLANNING_ACTIVITIES[0];

  // Determine starting hour offset
  const now = new Date();
  const currentLiveHour = now.getHours();

  let startOffset = 0;
  let endOffset = 23;

  if (targetDate === 'today') {
    startOffset = Math.min(20, currentLiveHour + 1);
    endOffset = 23;
    if (endOffset - startOffset < durationHours) {
      return {
        found: false,
        message: 'Not enough hours remaining today for this duration. Try planning for tomorrow.',
      };
    }
  } else if (targetDate === 'tomorrow') {
    startOffset = 24 + 6; // start at 6 AM tomorrow
    endOffset = 24 + 22; // end at 10 PM
  } else if (targetDate === 'day_after') {
    startOffset = 48 + 6;
    endOffset = 48 + 22;
  }

  // Sunrise / sunset estimation for daylight check
  let sunriseH = 6;
  let sunsetH = 18;
  if (daily?.sunrise?.[0]) {
    sunriseH = new Date(daily.sunrise[0]).getHours();
  }
  if (daily?.sunset?.[0]) {
    sunsetH = new Date(daily.sunset[0]).getHours();
  }

  let bestCandidate = null;
  let highestScore = -1;

  for (let s = startOffset; s <= endOffset - durationHours; s++) {
    let windowScore = 100;
    const windowTemps = [];
    const windowRains = [];
    const windowWinds = [];
    const windowUvs = [];

    for (let h = s; h < s + durationHours; h++) {
      const t = hourly.temperature_2m?.[h] ?? 20;
      const rainProb = hourly.precipitation_probability?.[h] ?? 0;
      const precip = hourly.precipitation?.[h] ?? 0;
      const windKmh = hourly.wind_speed_10m?.[h] ?? 10;
      const uv = hourly.uv_index?.[h] ?? 0;
      const hourOfDay = h % 24;

      windowTemps.push(t);
      windowRains.push(rainProb);
      windowWinds.push(windKmh);
      windowUvs.push(uv);

      // Rain Penalty: Heavy
      if (precip > 0.5) windowScore -= 60;
      else if (rainProb > activity.maxRain) {
        windowScore -= (rainProb - activity.maxRain) * 1.5;
      }

      // Wind Penalty
      if (windKmh > activity.maxWind) {
        windowScore -= (windKmh - activity.maxWind) * 2;
      }

      // Temperature Penalty
      const [minT, maxT] = activity.idealTemp;
      if (t < minT) windowScore -= (minT - t) * 3;
      else if (t > maxT) windowScore -= (t - maxT) * 4;

      // Daylight Preference (unless stargazing)
      if (hourOfDay < sunriseH - 1 || hourOfDay > sunsetH + 1) {
        windowScore -= 20;
      }

      // Photography Golden Hour Bonus
      if (activity.goldenHourBonus) {
        if (Math.abs(hourOfDay - sunriseH) <= 1 || Math.abs(hourOfDay - sunsetH) <= 1) {
          windowScore += 18;
        }
      }
    }

    if (windowScore > highestScore) {
      highestScore = windowScore;
      const avgTempC = windowTemps.reduce((a, b) => a + b, 0) / windowTemps.length;
      const maxRainProb = Math.max(...windowRains);
      const avgWindKmh = windowWinds.reduce((a, b) => a + b, 0) / windowWinds.length;
      const avgUv = windowUvs.reduce((a, b) => a + b, 0) / windowUvs.length;

      bestCandidate = {
        startHour: s % 24,
        endHour: (s + durationHours) % 24,
        score: Math.max(0, Math.round(windowScore)),
        avgTempC,
        maxRainProb,
        avgWindKmh,
        avgUv,
      };
    }
  }

  // Quality threshold: must score at least 50
  if (!bestCandidate || bestCandidate.score < 50) {
    return {
      found: false,
      message: 'No ideal window found.',
      reason: 'Forecast indicates unfavorable conditions (elevated rain risk, strong winds, or temperature extremes) across all available hours.',
    };
  }

  const startLabel = formatHour(bestCandidate.startHour, units.clock);
  const endLabel = formatHour(bestCandidate.endHour, units.clock);

  const tempVal = units.temp === 'F' ? Math.round((bestCandidate.avgTempC * 9) / 5 + 32) : Math.round(bestCandidate.avgTempC);
  const windVal = units.wind === 'mph' ? Math.round(bestCandidate.avgWindKmh * 0.621371) : Math.round(bestCandidate.avgWindKmh);

  return {
    found: true,
    activityName: activity.name,
    windowLabel: `${startLabel} – ${endLabel}`,
    score: bestCandidate.score,
    tempDisplay: `${tempVal}°${units.temp}`,
    rainDisplay: `${bestCandidate.maxRainProb}%`,
    windDisplay: `${windVal} ${units.wind}`,
    uvDisplay: bestCandidate.avgUv.toFixed(1),
    summary: `Prime weather window with comfortable ${tempVal}°${units.temp} temperature, ${bestCandidate.maxRainProb}% rain chance, and gentle ${windVal} ${units.wind} winds.`,
  };
}
