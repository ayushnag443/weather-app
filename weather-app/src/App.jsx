import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, MapPin, Droplets, Wind, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog } from 'lucide-react';
import { fetchWeatherData } from './weatherService';
import './index.css';

// Dynamic Weather Icon component based on WMO code
const WeatherIcon = ({ code, className = "" }) => {
  // Map WMO codes to Lucide icons
  if (code === 0 || code === 1) return <Sun className={className} />;
  if (code === 2 || code === 3) return <Cloud className={className} />;
  if (code === 45 || code === 48) return <CloudFog className={className} />;
  if (code >= 51 && code <= 67) return <CloudRain className={className} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={className} />;
  if (code >= 80 && code <= 82) return <CloudRain className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  
  return <Sun className={className} />;
};

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default load
  useEffect(() => {
    handleSearch('London');
  }, []);

  const handleSearch = async (searchCity) => {
    const targetCity = searchCity || city;
    if (!targetCity.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(targetCity);
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="app-container glass-panel">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter a city name..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          <Search size={20} />
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="status-message error-message glass-panel">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="status-message">
          Fetching weather data...
        </div>
      )}

      {/* Weather Data Display */}
      {!loading && !error && weatherData && (
        <>
          {/* Current Weather Display */}
          <div className="current-weather">
            <h1 className="city-name">{weatherData.name}</h1>
            <p className="weather-desc">{weatherData.current.description}</p>
            
            <div className="weather-main">
              <WeatherIcon code={weatherData.current.code} className="weather-icon" />
              <div className="temperature">
                {weatherData.current.temp}°
              </div>
            </div>

            <div className="weather-details">
              <div className="detail-item">
                <Droplets className="detail-icon" />
                <span className="detail-value">{weatherData.current.humidity}%</span>
                <span className="detail-label">Humidity</span>
              </div>
              <div className="detail-item">
                <Wind className="detail-icon" />
                <span className="detail-value">{weatherData.current.wind} km/h</span>
                <span className="detail-label">Wind Speed</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Forecast Chart */}
          <div className="chart-container">
            <h3 className="chart-title">24-Hour Forecast</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherData.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--text-secondary)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}°`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-color)', 
                    borderColor: 'var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--accent-color)' }}
                  formatter={(value) => [`${value}°`, 'Temperature']}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="var(--accent-color)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
