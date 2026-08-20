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
      className={`inline-flex items-center gap-1.5 rounded-xl border transition-all duration-200 ${
        size === 'sm'
          ? 'px-2.5 py-1 text-xs'
          : 'px-3 py-1.5 text-sm'
      } bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/60 dark:to-blue-950/60 text-sky-800 dark:text-sky-200 border-sky-200/80 dark:border-sky-800/60 font-semibold shadow-sm`}
    >
      <div className="flex items-center gap-1.5">
        {weather?.icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
            alt={description}
            className="w-4 h-4 object-contain inline-block -my-1 drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <CloudSun className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
        )}
        <span className="truncate max-w-[130px]">{cityName}</span>
      </div>

      {temp !== null && (
        <>
          <span className="opacity-40 font-normal">&bull;</span>
          <span className="font-extrabold text-sky-900 dark:text-sky-100">{temp}°C</span>
        </>
      )}
    </div>
  );
};

export default WeatherBadge;
