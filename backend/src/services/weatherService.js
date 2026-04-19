const axios = require('axios');

const WMO_CONDITIONS = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing Rime Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Heavy Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Heavy Thunderstorm',
};

const getCondition = (code) => WMO_CONDITIONS[code] || 'Unknown';
const getCloudCover = (code) => code <= 1 ? 10 : code <= 3 ? 40 : code <= 48 ? 80 : 90;

/**
 * Fetch 7-day weather forecast from Open-Meteo (FREE, no API key)
 */
const getWeatherForecast = async (lat, lon) => {
  const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,weathercode,windspeed_10m_max,uv_index_max',
      current_weather: true,
      timezone: 'Asia/Kolkata',
      forecast_days: 7,
    },
    timeout: 10000,
  });

  const { current_weather, daily } = response.data;

  const forecast = daily.time.map((date, i) => ({
    date,
    condition: getCondition(daily.weathercode[i]),
    weatherCode: daily.weathercode[i],
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    tempAvg: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
    precipitation: daily.precipitation_sum[i] || 0,
    rain: daily.rain_sum[i] || 0,
    windSpeed: daily.windspeed_10m_max[i],
    uvIndex: daily.uv_index_max?.[i] || 0,
    cloudCover: getCloudCover(daily.weathercode[i]),
    rainProbability: daily.precipitation_sum[i] > 0 ? 70 : 10,
  }));

  return {
    current: current_weather ? {
      temperature: current_weather.temperature,
      windSpeed: current_weather.windspeed,
      condition: getCondition(current_weather.weathercode),
      isDay: current_weather.is_day,
    } : null,
    forecast,
    location: { lat, lon },
  };
};

module.exports = { getWeatherForecast };
