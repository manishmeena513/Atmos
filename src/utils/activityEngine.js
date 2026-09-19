/**
 * Activity Mode Recommendation Engine
 * Analyzes hourly forecasts to compute suitability and recommended time windows.
 */

export const ACTIVITIES = [
  { id: 'walking', name: 'Walking', icon: 'Footprints' },
  { id: 'running', name: 'Running', icon: 'Flame' },
  { id: 'cycling', name: 'Cycling', icon: 'Bike' },
  { id: 'photography', name: 'Photography', icon: 'Camera' },
  { id: 'study', name: 'Outdoor Study & Work', icon: 'BookOpen' },
  { id: 'travel', name: 'Travel & Sightseeing', icon: 'Plane' },
  { id: 'sports', name: 'Outdoor Sports', icon: 'Trophy' },
  { id: 'driving', name: 'Driving', icon: 'Car' },
];

export function analyzeActivity(activityId, weatherData) {
  if (!weatherData?.hourly) {
    return {
      suitability: 'Moderate',
      score: 70,
      bestWindows: ['Afternoon'],
      factors: [],
      summary: 'Awaiting forecast calculation...',
    };
  }

  const { hourly, daily } = weatherData;
  const currentHour = new Date().getHours();

  // Extract upcoming 24 hours
  const hours = hourly.time ? hourly.time.slice(0, 24) : [];
  const temps = hourly.temperature_2m || [];
  const precips = hourly.precipitation_probability || [];
  const winds = hourly.wind_speed_10m || [];
  const uvs = hourly.uv_index || [];
  const visibilities = hourly.visibility || [];
  const clouds = hourly.cloud_cover || [];

  const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
  const sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]) : null;

  switch (activityId) {
    case 'photography': {
      // Best around golden hours (1hr after sunrise, 1hr before sunset)
      const goldenMorning = sunrise
        ? `${String(sunrise.getHours()).padStart(2, '0')}:${String(sunrise.getMinutes()).padStart(2, '0')} – ${String(sunrise.getHours() + 1).padStart(2, '0')}:00`
        : '06:30 – 07:45';
      const goldenEvening = sunset
        ? `${String(sunset.getHours() - 1).padStart(2, '0')}:00 – ${String(sunset.getHours()).padStart(2, '0')}:${String(sunset.getMinutes()).padStart(2, '0')}`
        : '17:30 – 18:45';

      const avgVis = visibilities.slice(0, 12).reduce((a, b) => a + b, 0) / (visibilities.length || 1);
      const isCloudy = clouds[currentHour] ? clouds[currentHour] > 40 : true;

      return {
        suitability: isCloudy ? 'Dramatic Skies' : 'High Clarity',
        score: avgVis > 8000 ? 92 : 75,
        bestWindows: [goldenMorning, goldenEvening],
        factors: [
          { label: 'Golden Hour (Dawn)', value: goldenMorning, detail: 'Warm diffused sidelight' },
          { label: 'Golden Hour (Dusk)', value: goldenEvening, detail: 'Long shadows & deep hues' },
          { label: 'Cloud Cover', value: `${clouds[currentHour] || 35}%`, detail: 'Soft natural diffuser' },
          { label: 'Avg Visibility', value: `${Math.round(avgVis / 1000)} km`, detail: 'Horizon definition' },
        ],
        summary: 'Optimal lighting occurs around golden hours. Atmospheric clouds will enhance sky contrast without direct glare.',
      };
    }

    case 'study': {
      // Best when wind < 15 km/h, precip < 10%, temp between 18 and 26C
      const curTemp = temps[currentHour] || 20;
      const curWind = winds[currentHour] || 10;
      const curPrecip = precips[currentHour] || 0;
      const curUv = uvs[currentHour] || 2;

      const isWindy = curWind > 18;
      const isWet = curPrecip > 20;
      const isTooHot = curTemp > 28;

      let suitability = 'Optimal Study Air';
      let score = 94;
      if (isWet) {
        suitability = 'Indoor Recommended';
        score = 45;
      } else if (isWindy) {
        suitability = 'Breezy (Drafts)';
        score = 68;
      } else if (isTooHot) {
        suitability = 'Warm in Direct Sun';
        score = 72;
      }

      return {
        suitability,
        score,
        bestWindows: ['10:00 – 12:30', '16:00 – 18:30'],
        factors: [
          { label: 'Air Flow / Wind', value: `${Math.round(curWind)} km/h`, detail: isWindy ? 'Loose papers may blow' : 'Gentle ambient breeze' },
          { label: 'Ambient Temperature', value: `${Math.round(curTemp)}°C`, detail: 'Thermal focus comfort' },
          { label: 'Screen Glare / UV', value: `UV ${Math.round(curUv)}`, detail: curUv > 5 ? 'Shaded spot recommended' : 'Low optical glare' },
          { label: 'Rain Probability', value: `${curPrecip}%`, detail: curPrecip > 0 ? 'Possible moisture droplets' : 'Dry workspace' },
        ],
        summary: isWet
          ? 'Precipitation risk detected; consider studying in a veranda or indoors with natural light.'
          : 'Great conditions for an outdoor reading session or laptop workspace. Choose a shaded bench to reduce glare.',
      };
    }

    case 'travel': {
      const curVis = (visibilities[currentHour] || 10000) / 1000;
      const curRain = precips[currentHour] || 0;
      const curTemp = temps[currentHour] || 19;
      const daylightTotal = daily?.daylight_duration?.[0] ? `${(daily.daylight_duration[0] / 3600).toFixed(1)} hrs` : 'Full Day';

      let suitability = 'Prime Sightseeing';
      let score = 95;
      if (curRain > 40) {
        suitability = 'Museum & Indoor Day';
        score = 60;
      } else if (curVis < 4) {
        suitability = 'Softened Panoramas';
        score = 75;
      }

      return {
        suitability,
        score,
        bestWindows: ['09:30 – 14:00', '15:30 – 18:30'],
        factors: [
          { label: 'Optical Horizon', value: `${curVis.toFixed(1)} km`, detail: curVis >= 10 ? 'Crystal clear landmarks' : 'Mild atmospheric haze' },
          { label: 'Walking Comfort', value: `${Math.round(curTemp)}°C`, detail: 'Foot transit pacing' },
          { label: 'Rain Probability', value: `${curRain}%`, detail: curRain > 30 ? 'Pack compact umbrella' : 'Clear streets' },
          { label: 'Daylight Window', value: daylightTotal, detail: 'Available exploration time' },
        ],
        summary: curRain > 40
          ? 'Scattered showers expected. Combine indoor cultural stops with brief walking tours between cloud breaks.'
          : 'High visibility and comfortable pedestrian temperatures provide ideal conditions for city walking and sightseeing.',
      };
    }

    case 'running': {
      const candidateHours = [];
      for (let i = 0; i < 24; i++) {
        const t = temps[i] ?? 18;
        const p = precips[i] ?? 0;
        const w = winds[i] ?? 10;
        if (p < 25 && t >= 8 && t <= 21 && w < 28) {
          candidateHours.push(i);
        }
      }

      const windowStr = candidateHours.length > 0
        ? `${String(candidateHours[0]).padStart(2, '0')}:00 – ${String(Math.min(candidateHours[0] + 3, 23)).padStart(2, '0')}:00`
        : 'Early Morning';

      const currentTemp = temps[currentHour] || 15;
      const currentWind = winds[currentHour] || 12;

      return {
        suitability: currentTemp > 24 ? 'Challenging (Warm)' : currentTemp < 6 ? 'Crisp (Cool)' : 'Excellent',
        score: currentTemp >= 10 && currentTemp <= 19 ? 90 : 70,
        bestWindows: [windowStr, '20:00 – 22:00'],
        factors: [
          { label: 'Ideal Running Temp', value: `${Math.round(currentTemp)}°C`, detail: 'Optimal metabolic pacing' },
          { label: 'Wind Resistance', value: `${Math.round(currentWind)} km/h`, detail: currentWind > 20 ? 'Moderate headwind' : 'Light breeze' },
          { label: 'Precipitation Risk', value: `${precips[currentHour] || 0}%`, detail: 'Surface traction' },
          { label: 'UV Index Peak', value: `${Math.round(daily?.uv_index_max?.[0] || 4)}`, detail: 'Midday sun intensity' },
        ],
        summary: 'Early hours provide the coolest temperatures and lowest wind resistance for cardio stamina.',
      };
    }

    case 'cycling': {
      const windSpeed = winds[currentHour] || 12;
      const precipProb = precips[currentHour] || 0;
      return {
        suitability: windSpeed > 30 ? 'High Resistance' : precipProb > 40 ? 'Wet Roads' : 'Prime',
        score: windSpeed < 20 && precipProb < 20 ? 94 : 68,
        bestWindows: ['08:00 – 11:00', '16:00 – 18:30'],
        factors: [
          { label: 'Sustained Wind', value: `${Math.round(windSpeed)} km/h`, detail: 'Aerodynamic resistance' },
          { label: 'Road Wetness Risk', value: `${precipProb}%`, detail: 'Braking distance consideration' },
          { label: 'Ambient Temperature', value: `${Math.round(temps[currentHour] || 17)}°C`, detail: 'Thermal comfort' },
          { label: 'Visibility', value: `${Math.round((visibilities[currentHour] || 10000) / 1000)} km`, detail: 'Lane awareness' },
        ],
        summary: 'Clear line of sight with moderate winds. Choose early morning routes before crosswinds pick up.',
      };
    }

    case 'sports': {
      const windSpeed = winds[currentHour] || 10;
      const precipProb = precips[currentHour] || 0;
      const currentTemp = temps[currentHour] || 18;
      return {
        suitability: precipProb > 30 ? 'Damp Field' : windSpeed > 25 ? 'High Ball Drift' : 'Game Ready',
        score: precipProb < 20 && windSpeed < 20 ? 92 : 70,
        bestWindows: ['15:00 – 18:00', '09:00 – 11:30'],
        factors: [
          { label: 'Field Condition', value: precipProb > 30 ? 'Slippery' : 'Firm Turf', detail: 'Traction on turf' },
          { label: 'Wind Drift', value: `${Math.round(windSpeed)} km/h`, detail: 'Projectile / ball trajectory' },
          { label: 'Comfort Level', value: `${Math.round(currentTemp)}°C`, detail: 'Athletic exertion heat' },
        ],
        summary: 'Good conditions for outdoor team games and racquet sports. Wind speeds permit accurate ball play.',
      };
    }

    case 'driving': {
      const vis = visibilities[currentHour] || 10000;
      const rain = precips[currentHour] || 0;
      const windSpeed = winds[currentHour] || 12;
      return {
        suitability: vis < 2000 || rain > 50 ? 'Cautious' : 'Smooth',
        score: vis > 5000 && rain < 30 ? 95 : 70,
        bestWindows: ['Throughout the day', 'Avoid rush-hour storms'],
        factors: [
          { label: 'Sight Distance', value: `${Math.round(vis / 1000)} km`, detail: vis < 3000 ? 'Reduced visibility' : 'Clear highway' },
          { label: 'Hydroplaning Risk', value: rain > 50 ? 'Elevated' : 'Minimal', detail: `${rain}% precipitation probability` },
          { label: 'Crosswind Gusts', value: `${Math.round(windSpeed)} km/h`, detail: 'Vehicle stability' },
        ],
        summary: 'Highway conditions remain stable. Maintain standard following distances and monitor sudden downpours.',
      };
    }

    case 'walking':
    default: {
      const t = temps[currentHour] || 18;
      const p = precips[currentHour] || 0;
      const uv = uvs[currentHour] || 2;
      return {
        suitability: p > 40 ? 'Damp' : t < 5 ? 'Chilly' : 'Delightful',
        score: p < 20 && t >= 14 && t <= 24 ? 96 : 74,
        bestWindows: ['09:00 – 11:30', '16:30 – 19:00'],
        factors: [
          { label: 'Comfort Temp', value: `${Math.round(t)}°C`, detail: 'Brisk, pleasant air' },
          { label: 'Chance of Rain', value: `${p}%`, detail: p > 30 ? 'Pack light umbrella' : 'Dry path' },
          { label: 'UV Factor', value: `${Math.round(uv)}`, detail: uv > 5 ? 'Sun protection advised' : 'Gentle solar angle' },
        ],
        summary: 'Great conditions for an outdoor stroll or brisk walk. Ambient air temperatures remain well within comfort thresholds.',
      };
    }
  }
}
