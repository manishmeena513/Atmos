/**
 * Weather Insights Calculation Engine
 * Formulates data-backed insights and recommendations strictly from real metrics.
 */

export function calculateWeatherInsights(weatherData, airQualityData = null) {
  if (!weatherData || !weatherData.current) return [];

  const { current, hourly, daily } = weatherData;
  const insights = [];

  const temp = current.temperature_2m;
  const apparentTemp = current.apparent_temperature;
  const wind = current.wind_speed_10m;
  const humidity = current.relative_humidity_2m;
  const uv = current.uv_index || 0;
  const precip = current.precipitation || 0;
  const visibility = current.visibility || 10000;

  // 1. Rain alert / Umbrella recommendation
  const next3HoursPrecipProb = hourly?.precipitation_probability
    ? Math.max(...hourly.precipitation_probability.slice(0, 4))
    : 0;

  if (precip > 0.5 || next3HoursPrecipProb >= 60) {
    insights.push({
      id: 'rain-alert',
      type: 'warning',
      category: 'Precipitation',
      title: 'Umbrella Recommended',
      description: precip > 1
        ? `Precipitation is actively occurring (${precip} mm/h). Keep rain protection handy.`
        : `High probability of rain (${next3HoursPrecipProb}%) within the next 3 hours.`,
      icon: 'CloudRain',
    });
  } else if (next3HoursPrecipProb >= 30) {
    insights.push({
      id: 'rain-possible',
      type: 'info',
      category: 'Precipitation',
      title: 'Scattered Showers Possible',
      description: `There is a ${next3HoursPrecipProb}% chance of light precipitation ahead.`,
      icon: 'CloudDrizzle',
    });
  }

  // 2. UV Exposure
  if (uv >= 8) {
    insights.push({
      id: 'uv-extreme',
      type: 'danger',
      category: 'Sun & UV',
      title: 'Very High UV Index',
      description: `Current UV index is ${uv.toFixed(1)}. Wear SPF 50+, hat, and seek shade during midday hours.`,
      icon: 'Sun',
    });
  } else if (uv >= 5) {
    insights.push({
      id: 'uv-moderate',
      type: 'warning',
      category: 'Sun & UV',
      title: 'Moderate UV Exposure',
      description: `UV index reaches ${uv.toFixed(1)}. Sunscreen is recommended for outdoor stays longer than 30 minutes.`,
      icon: 'Sun',
    });
  }

  // 3. Wind speed & gust advisory
  if (wind >= 45) {
    insights.push({
      id: 'wind-gale',
      type: 'warning',
      category: 'Wind',
      title: 'Gale-force Winds',
      description: `Wind speeds of ${Math.round(wind)} km/h. Secure loose outdoor objects and exercise caution while driving.`,
      icon: 'Wind',
    });
  } else if (wind >= 28) {
    insights.push({
      id: 'wind-breezy',
      type: 'info',
      category: 'Wind',
      title: 'Breezy Conditions',
      description: `Sustained winds at ${Math.round(wind)} km/h with noticeable resistance for cycling and light activities.`,
      icon: 'Wind',
    });
  }

  // 4. Perceived temperature disparity (Wind chill or Muggy Heat)
  const tempDiff = apparentTemp - temp;
  if (tempDiff <= -3.5) {
    insights.push({
      id: 'wind-chill',
      type: 'info',
      category: 'Comfort',
      title: 'Significant Wind Chill',
      description: `Feels like ${Math.round(apparentTemp)}° despite an actual temperature of ${Math.round(temp)}°. Dress in windproof layers.`,
      icon: 'ThermometerSnowflake',
    });
  } else if (tempDiff >= 3.5 && temp >= 24) {
    insights.push({
      id: 'humidity-heat',
      type: 'info',
      category: 'Comfort',
      title: 'High Humidity Discomfort',
      description: `Feels like ${Math.round(apparentTemp)}° with ${humidity}% humidity. Stay hydrated and take rest breaks outdoors.`,
      icon: 'ThermometerSun',
    });
  }

  // 5. Visibility and Fog
  if (visibility < 1500) {
    insights.push({
      id: 'low-visibility',
      type: 'warning',
      category: 'Visibility',
      title: 'Reduced Road Visibility',
      description: `Visibility is restricted to ${(visibility / 1000).toFixed(1)} km. Use fog lights and keep extended stopping distance.`,
      icon: 'CloudFog',
    });
  }

  // 6. Air Quality insight
  if (airQualityData?.current?.european_aqi) {
    const aqi = airQualityData.current.european_aqi;
    if (aqi > 60) {
      insights.push({
        id: 'aqi-poor',
        type: 'warning',
        category: 'Air Quality',
        title: 'Sensitive Air Quality',
        description: `European AQI is elevated (${aqi}). Individuals with respiratory sensitivities should reduce strenuous outdoor exertion.`,
        icon: 'Activity',
      });
    } else if (aqi <= 30) {
      insights.push({
        id: 'aqi-clean',
        type: 'success',
        category: 'Air Quality',
        title: 'Crisp, Pure Air',
        description: `Clean atmospheric quality (AQI ${aqi}). Excellent conditions for outdoor exercise and ventilation.`,
        icon: 'Sparkles',
      });
    }
  }

  // 7. General outdoor walk recommendation
  if (
    precip === 0 &&
    next3HoursPrecipProb < 20 &&
    wind < 25 &&
    temp >= 14 &&
    temp <= 25 &&
    visibility >= 5000
  ) {
    insights.push({
      id: 'ideal-walk',
      type: 'success',
      category: 'Activity',
      title: 'Prime Time for a Walk',
      description: `Mild ${Math.round(temp)}°C with gentle breezes and dry skies make this ideal for outdoor exercise.`,
      icon: 'Compass',
    });
  }

  return insights;
}
