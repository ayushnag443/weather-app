// WMO Weather interpretation codes
export const getWeatherDescription = (code) => {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm'
  };
  return codes[code] || 'Unknown';
};

export const fetchWeatherData = async (city) => {
  try {
    // 1. Get coordinates for the city
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found. Please try another location.');
    }
    
    const location = geoData.results[0];
    
    // 2. Fetch weather data using coordinates
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code`
    );
    const weatherData = await weatherRes.json();
    
    // 3. Format the 24-hour forecast data for Recharts
    // The API returns arrays of time and temperature_2m. We need to pair them up.
    // Let's get the next 24 hours starting from the current hour
    const currentHourIndex = weatherData.hourly.time.findIndex(time => new Date(time) >= new Date());
    const startIndex = currentHourIndex !== -1 ? currentHourIndex : 0;
    
    const forecast = [];
    for (let i = startIndex; i < startIndex + 24 && i < weatherData.hourly.time.length; i++) {
      const timeDate = new Date(weatherData.hourly.time[i]);
      // Format time as "3 PM"
      const timeStr = timeDate.toLocaleTimeString([], { hour: 'numeric' });
      
      forecast.push({
        time: timeStr,
        temp: Math.round(weatherData.hourly.temperature_2m[i]),
        code: weatherData.hourly.weather_code[i]
      });
    }

    return {
      name: `${location.name}${location.country ? `, ${location.country}` : ''}`,
      current: {
        temp: Math.round(weatherData.current.temperature_2m),
        humidity: Math.round(weatherData.current.relative_humidity_2m),
        wind: Math.round(weatherData.current.wind_speed_10m),
        code: weatherData.current.weather_code,
        description: getWeatherDescription(weatherData.current.weather_code)
      },
      forecast
    };
  } catch (error) {
    if (error.message.includes('City not found')) throw error;
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
};
