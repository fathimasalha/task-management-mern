const axios = require('axios');

// In-memory cache for weather results: { [cityNameLower]: { data, expiry } }
const weatherCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches live weather for a given city via OpenWeatherMap API
 * @param {string} city - City name (e.g., "San Francisco", "London", "Tokyo")
 * @returns {Promise<{temp: number, description: string, icon: string, cityName: string, humidity: number, windSpeed: number} | null>}
 */
const getWeatherByCity = async (city) => {
  if (!city || typeof city !== 'string' || !city.trim()) {
    return null;
  }

  const cleanCity = city.trim();
  const cacheKey = cleanCity.toLowerCase();

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  // If no API key provided, generate dynamic mock weather so dashboard features work smoothly
  if (!apiKey || apiKey === 'your_openweather_api_key') {
    const mockWeather = generateMockWeather(cleanCity);
    weatherCache.set(cacheKey, {
      data: mockWeather,
      expiry: Date.now() + CACHE_TTL_MS,
    });
    return mockWeather;
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: cleanCity,
        appid: apiKey,
        units: 'metric',
      },
      timeout: 5000,
    });

    const { data } = response;
    const weatherResult = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0]?.description
        ? data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)
        : 'Clear',
      icon: data.weather[0]?.icon || '01d',
      cityName: data.name || cleanCity,
      country: data.sys?.country || '',
      fetchedAt: new Date(),
    };

    weatherCache.set(cacheKey, {
      data: weatherResult,
      expiry: Date.now() + CACHE_TTL_MS,
    });

    return weatherResult;
  } catch (error) {
    console.warn(`[WeatherService] Could not fetch live weather for "${city}": ${error.response?.data?.message || error.message}`);
    // Fallback to simulated weather for the requested city
    const mock = generateMockWeather(cleanCity);
    return mock;
  }
};

/**
 * Helper to generate realistic simulated weather if external API is unconfigured or unreachable
 */
function generateMockWeather(cityName) {
  const weatherTypes = [
    { desc: 'Sunny / Clear Sky', icon: '01d', baseTemp: 24 },
    { desc: 'Partly Cloudy', icon: '02d', baseTemp: 20 },
    { desc: 'Scattered Clouds', icon: '03d', baseTemp: 18 },
    { desc: 'Light Rain', icon: '10d', baseTemp: 16 },
    { desc: 'Mild Breeze', icon: '50d', baseTemp: 22 },
  ];
  
  // Deterministic pick based on city string hash
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = (hash << 5) - hash + cityName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % weatherTypes.length;
  const picked = weatherTypes[index];
  const tempOffset = (Math.abs(hash) % 7) - 3;

  return {
    temp: picked.baseTemp + tempOffset,
    feelsLike: picked.baseTemp + tempOffset + 1,
    humidity: 55 + (Math.abs(hash) % 30),
    description: picked.desc,
    icon: picked.icon,
    cityName: cityName.charAt(0).toUpperCase() + cityName.slice(1),
    country: 'Live Context',
    fetchedAt: new Date(),
    isMock: true,
  };
}

module.exports = {
  getWeatherByCity,
};
