import React from 'react';
import { Cloud, Sun, CloudRain, CloudSun, Wind, Droplets, Thermometer } from 'lucide-react';

export const WeatherBadge = ({ weather, location, size = 'sm' }) => {
  if (!weather && !location) return null;

  const temp = weather ? weather.temp : null;
  const description = weather ? weather.description : 'Weather unavailable';
  const cityName = weather?.cityName || location;

  return (
    <div
      title={weather ? `${cityName}: ${temp}°C, ${description}` : `Location: ${location}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border transition-all duration-200 ${
        size === 'sm'
          ? 'px-2.5 py-1 text-xs'
          : 'px-3 py-1.5 text-sm'
      } bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-800/60 font-medium`}
    >
      <div className="flex items-center gap-1">
        {weather?.icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
            alt={description}
            className="w-4 h-4 object-contain inline-block -my-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <CloudSun className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
        )}
        <span className="truncate max-w-[120px]">{cityName}</span>
      </div>

      {temp !== null && (
        <>
          <span className="opacity-40">&bull;</span>
          <span className="font-semibold">{temp}°C</span>
        </>
      )}
    </div>
  );
};

export default WeatherBadge;
