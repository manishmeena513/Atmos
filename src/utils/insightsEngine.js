/**
 * Weather Intelligence, Trends & Changes Engine
 * Formulates data-backed explanations, trends, and shift alerts strictly from real Open-Meteo telemetry.
 */

function formatHourLabel(hour24, clock = '12h') {
  if (clock === '24h') return `${String(hour24).padStart(2, '0')}:00`;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12} ${period}`;
}

export function calculateWeatherInsights(weatherData, airQualityData = null, units = { temp: 'C', wind: 'kmh', clock: '12h' }) {
  if (!weatherData || !weatherData.current) return [];

  const { current, hourly } = weatherData;
  const insights = [];
  const currentHour = new Date().getHours();

  const toDispTemp = (c) =>
    units.temp === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c);
  const toDispWind = (kmh) =>
    units.wind === 'mph' ? Math.round(kmh * 0.621371) : Math.round(kmh);

  const temps = hourly?.temperature_2m || [];
  const precips = hourly?.precipitation_probability || [];
  const winds = hourly?.wind_speed_10m || [];
  const humidities = hourly?.relative_humidity_2m || [];
  const uvs = hourly?.uv_index || [];

  // 1. Temperature trajectory insight
  if (temps.length >= 24) {
    const morningTemp = temps[8] ?? current.temperature_2m;
    const afternoonPeak = Math.max(...temps.slice(11, 17));
    const peakHour = temps.indexOf(afternoonPeak);
    const nightTemp = temps[22] ?? current.temperature_2m;

    if (currentHour <= 11 && afternoonPeak - morningTemp >= 4) {
      insights.push({
        id: 'temp-rise',
        type: 'info',
        category: 'Temperature',
        title: `Temperatures rise quickly after ${formatHourLabel(9, units.clock)}`,
        description: `Daytime heating pushes temperatures from ${toDispTemp(morningTemp)}°${units.temp} this morning to ${toDispTemp(afternoonPeak)}°${units.temp} around ${formatHourLabel(peakHour, units.clock)}.`,
        icon: 'ThermometerSun',
      });
    } else if (afternoonPeak - nightTemp >= 5) {
      insights.push({
        id: 'temp-cooling',
        type: 'info',
        category: 'Temperature',
        title: `Noticeable cooling after sunset`,
        description: `Temperatures drop from a daytime high of ${toDispTemp(afternoonPeak)}°${units.temp} down to ${toDispTemp(nightTemp)}°${units.temp} tonight.`,
        icon: 'ThermometerSnowflake',
      });
    }
  }

  // 2. Rain probability shift insight
  if (precips.length >= 24) {
    let rainStartHour = -1;
    let maxPrecip = 0;
    for (let h = currentHour; h < 24; h++) {
      if (precips[h] > maxPrecip) maxPrecip = precips[h];
      if (precips[h] >= 40 && rainStartHour === -1) {
        rainStartHour = h;
      }
    }

    if ((current.precipitation || 0) > 0) {
      insights.push({
        id: 'rain-active',
        type: 'warning',
        category: 'Precipitation',
        title: 'Active precipitation in your area',
        description: `Rainfall is currently measuring ${current.precipitation.toFixed(1)} mm/h. Carry waterproof protection if heading out.`,
        icon: 'CloudRain',
      });
    } else if (rainStartHour !== -1) {
      insights.push({
        id: 'rain-later',
        type: 'warning',
        category: 'Precipitation',
        title: `Rain probability increases after ${formatHourLabel(rainStartHour, units.clock)}`,
        description: `Hourly models indicate a ${maxPrecip}% chance of precipitation developing later today.`,
        icon: 'CloudRain',
      });
    }
  }

  // 3. Afternoon / Evening Humidity insight
  if (humidities.length >= 24) {
    const afternoonHum = Math.max(...humidities.slice(12, 18));
    if (afternoonHum >= 70 || current.relative_humidity_2m >= 72) {
      insights.push({
        id: 'humidity-high',
        type: 'info',
        category: 'Moisture',
        title: currentHour >= 12 && currentHour < 18 ? 'Humidity is high this afternoon' : 'Elevated atmospheric moisture',
        description: `Relative humidity reaches ${Math.max(afternoonHum, current.relative_humidity_2m)}%, making the air feel heavier and slowing evaporative cooling.`,
        icon: 'CloudFog',
      });
    }
  }

  // 4. Wind speed trajectory insight
  if (winds.length >= 24) {
    const eveningWindMax = Math.max(...winds.slice(17, 24));
    if (eveningWindMax >= 26) {
      insights.push({
        id: 'wind-tonight',
        type: 'warning',
        category: 'Wind',
        title: 'Stronger winds are expected later today',
        description: `Sustained wind speeds build up to ${toDispWind(eveningWindMax)} ${units.wind} through the evening hours.`,
        icon: 'Wind',
      });
    } else if (current.wind_speed_10m >= 25) {
      insights.push({
        id: 'wind-now',
        type: 'info',
        category: 'Wind',
        title: 'Breezy conditions across the area',
        description: `Current sustained winds are ${toDispWind(current.wind_speed_10m)} ${units.wind} with gusts up to ${toDispWind(current.wind_gusts_10m || current.wind_speed_10m)} ${units.wind}.`,
        icon: 'Wind',
      });
    }
  }

  // 5. UV Peak insight
  if (uvs.length >= 24) {
    const maxUv = Math.max(...uvs.slice(0, 24));
    const maxUvHour = uvs.indexOf(maxUv);
    if (maxUv >= 5) {
      insights.push({
        id: 'uv-peak',
        type: maxUv >= 8 ? 'danger' : 'warning',
        category: 'Solar UV',
        title: `UV reaches its highest level around ${formatHourLabel(maxUvHour, units.clock)}`,
        description: `Peak UV index hits ${maxUv.toFixed(1)} today. Direct sun protection is recommended during midday hours.`,
        icon: 'Sun',
      });
    }
  }

  // 6. Air Quality insight if supported by real station data
  if (airQualityData?.current?.european_aqi) {
    const aqi = airQualityData.current.european_aqi;
    if (aqi > 60) {
      insights.push({
        id: 'aqi-elevated',
        type: 'warning',
        category: 'Air Quality',
        title: 'Elevated particulate concentration',
        description: `European AQI is ${Math.round(aqi)}. Sensitive individuals may prefer shorter intense outdoor sessions.`,
        icon: 'Activity',
      });
    }
  }

  // Ensure at least two informative explanations even on calm days
  if (insights.length < 2) {
    insights.push({
      id: 'calm-day',
      type: 'success',
      category: 'Overview',
      title: 'Steady, balanced atmospheric conditions',
      description: `Temperatures hold near ${toDispTemp(current.temperature_2m)}°${units.temp} with ${current.relative_humidity_2m}% humidity and light ${toDispWind(current.wind_speed_10m)} ${units.wind} winds.`,
      icon: 'Sparkles',
    });
  }

  return insights;
}

export function calculateWeatherTrends(weatherData, units = { temp: 'C', wind: 'kmh', clock: '12h' }) {
  if (!weatherData?.hourly || !weatherData?.current) return [];

  const { current, hourly } = weatherData;
  const currentHour = new Date().getHours();
  const trends = [];

  const temps = hourly.temperature_2m || [];
  const winds = hourly.wind_speed_10m || [];
  const precips = hourly.precipitation_probability || [];
  const humidities = hourly.relative_humidity_2m || [];

  const formatDeltaTemp = (deltaC) =>
    units.temp === 'F' ? Math.round(Math.abs(deltaC) * 1.8) : Math.round(Math.abs(deltaC));
  const toDispWind = (kmh) =>
    units.wind === 'mph' ? Math.round(kmh * 0.621371) : Math.round(kmh);

  // 1. Temperature Trend (compare current vs morning 08:00 or upcoming evening 20:00)
  if (temps.length >= 24) {
    const morningTemp = temps[8] ?? current.temperature_2m;
    const eveningTemp = temps[20] ?? current.temperature_2m;
    const diffMorning = current.temperature_2m - morningTemp;
    const diffEvening = eveningTemp - current.temperature_2m;

    let tempText = 'Holding steady near current levels.';
    let tempDirection = 'steady';
    if (currentHour >= 11 && Math.abs(diffMorning) >= 2) {
      const deg = formatDeltaTemp(diffMorning);
      tempText =
        diffMorning > 0
          ? `${deg}° warmer than this morning.`
          : `${deg}° cooler than this morning.`;
      tempDirection = diffMorning > 0 ? 'up' : 'down';
    } else if (Math.abs(diffEvening) >= 2) {
      const deg = formatDeltaTemp(diffEvening);
      tempText =
        diffEvening > 0
          ? `Warming by ${deg}° heading into the later hours.`
          : `Cooling by ${deg}° through this evening.`;
      tempDirection = diffEvening > 0 ? 'up' : 'down';
    }

    trends.push({
      id: 'trend-temp',
      category: 'Temperature',
      direction: tempDirection,
      statement: tempText,
    });
  }

  // 2. Wind Trend
  if (winds.length >= 24) {
    const currW = current.wind_speed_10m || 0;
    const futureWinds = winds.slice(currentHour + 1, Math.min(24, currentHour + 8));
    const maxFutureW = futureWinds.length > 0 ? Math.max(...futureWinds) : currW;
    const minFutureW = futureWinds.length > 0 ? Math.min(...futureWinds) : currW;

    let windText = `Steady airflow around ${toDispWind(currW)} ${units.wind}.`;
    let windDir = 'steady';
    if (maxFutureW - currW >= 6) {
      windText = `Wind speeds increasing up to ${toDispWind(maxFutureW)} ${units.wind} later today.`;
      windDir = 'up';
    } else if (currW - minFutureW >= 6) {
      windText = `Winds calming down to ${toDispWind(minFutureW)} ${units.wind} through the evening.`;
      windDir = 'down';
    }

    trends.push({
      id: 'trend-wind',
      category: 'Wind',
      direction: windDir,
      statement: windText,
    });
  }

  // 3. Rain Trend
  if (precips.length >= 24) {
    const currP = precips[currentHour] ?? 0;
    let riseHour = -1;
    let peakP = currP;
    for (let h = currentHour + 1; h < 24; h++) {
      if (precips[h] > peakP) {
        peakP = precips[h];
        if (precips[h] - currP >= 20 && riseHour === -1) {
          riseHour = h;
        }
      }
    }

    let rainText = peakP < 20 ? 'Dry conditions holding steady today.' : `Precipitation probability steady near ${peakP}%.`;
    let rainDir = 'steady';
    if (riseHour !== -1) {
      rainText = `Rain probability rising after ${formatHourLabel(riseHour, units.clock)} (to ${peakP}%).`;
      rainDir = 'up';
    } else if (currP >= 35 && (precips[Math.min(23, currentHour + 4)] ?? 0) < 20) {
      rainText = 'Rain chances tapering off over the next few hours.';
      rainDir = 'down';
    }

    trends.push({
      id: 'trend-rain',
      category: 'Rain',
      direction: rainDir,
      statement: rainText,
    });
  }

  // 4. Humidity Trend
  if (humidities.length >= 24) {
    const currH = current.relative_humidity_2m || 50;
    const nightH = humidities[22] ?? currH;
    const diffH = nightH - currH;

    let humText = `Humidity holding stable near ${currH}%.`;
    let humDir = 'steady';
    if (diffH >= 10) {
      humText = `Humidity expected to increase tonight (to ${nightH}%).`;
      humDir = 'up';
    } else if (diffH <= -10) {
      humText = `Air becoming drier later today (${nightH}% humidity).`;
      humDir = 'down';
    }

    trends.push({
      id: 'trend-humidity',
      category: 'Humidity',
      direction: humDir,
      statement: humText,
    });
  }

  return trends;
}

export function calculateWeatherChanges(weatherData, units = { temp: 'C', wind: 'kmh', clock: '12h' }) {
  if (!weatherData?.hourly || !weatherData?.current) return [];

  const { current, hourly } = weatherData;
  const currentHour = new Date().getHours();
  const changes = [];

  const temps = hourly.temperature_2m || [];
  const precips = hourly.precipitation_probability || [];
  const winds = hourly.wind_speed_10m || [];
  const uvs = hourly.uv_index || [];

  // 1. Rain expected later
  const futurePrecipMax = precips.slice(currentHour, 24).length > 0
    ? Math.max(...precips.slice(currentHour, 24))
    : 0;
  if (futurePrecipMax >= 40) {
    const rainH = precips.findIndex((p, idx) => idx >= currentHour && p >= 40);
    changes.push({
      id: 'change-rain',
      icon: 'CloudRain',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
      label: `Rain expected around ${formatHourLabel(rainH !== -1 ? rainH : currentHour + 2, units.clock)} (${futurePrecipMax}%)`,
    });
  }

  // 2. Large temperature drop tonight
  const maxDayTemp = temps.length > 0 ? Math.max(...temps.slice(10, 17)) : current.temperature_2m;
  const nightTemp = temps[22] ?? current.temperature_2m;
  if (maxDayTemp - nightTemp >= 6) {
    const dropDisp = units.temp === 'F' ? Math.round((maxDayTemp - nightTemp) * 1.8) : Math.round(maxDayTemp - nightTemp);
    changes.push({
      id: 'change-temp-drop',
      icon: 'ThermometerSnowflake',
      color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/25',
      label: `${dropDisp}°${units.temp} temperature drop tonight`,
    });
  }

  // 3. Increasing winds
  const maxUpcomingWind = winds.slice(currentHour, 24).length > 0
    ? Math.max(...winds.slice(currentHour, 24))
    : 0;
  if (maxUpcomingWind >= 28 && maxUpcomingWind - (current.wind_speed_10m || 0) >= 6) {
    const wDisp = units.wind === 'mph' ? Math.round(maxUpcomingWind * 0.621371) : Math.round(maxUpcomingWind);
    changes.push({
      id: 'change-wind',
      icon: 'Wind',
      color: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
      label: `Increasing winds (${wDisp} ${units.wind})`,
    });
  }

  // 4. High UV around midday
  const maxUv = uvs.length > 0 ? Math.max(...uvs.slice(10, 16)) : 0;
  if (maxUv >= 6 && currentHour <= 15) {
    changes.push({
      id: 'change-uv',
      icon: 'Sun',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      label: `High UV around midday (UV ${maxUv.toFixed(1)})`,
    });
  }

  return changes;
}
