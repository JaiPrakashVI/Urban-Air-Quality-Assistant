import React from 'react';
import { PollutantTelemetry } from '../../types/aqi';
import { getAqiCategoryColor, INDIAN_CITIES } from '../../services/openMeteoApi';
import { Wind, Droplets, Thermometer, AlertCircle, Clock, Database, MapPin, Navigation } from 'lucide-react';

interface AqiHeroCardProps {
  telemetry: PollutantTelemetry;
  cityName: string;
  activeCityId?: string;
  onSelectCityId?: (cityId: string) => void;
  isGpsLocated?: boolean;
}

export const AqiHeroCard: React.FC<AqiHeroCardProps> = ({
  telemetry,
  cityName,
  activeCityId,
  onSelectCityId,
  isGpsLocated = false,
}) => {
  const categoryColor = getAqiCategoryColor(telemetry.category);
  const formattedTime = new Date(telemetry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const popularCityIds = [
    'delhi', 'mumbai', 'bengaluru', 'kolkata', 'hyderabad', 
    'chennai', 'noida', 'pune', 'lucknow', 'jaipur', 'ahmedabad', 'patna'
  ];

  return (
    <section 
      aria-labelledby="aqi-hero-heading"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative overflow-hidden"
    >
      {/* Background ambient glow matching category color */}
      <div 
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: categoryColor.hex }}
        aria-hidden="true"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Score Gauge & Category */}
        <div className="flex items-start sm:items-center gap-6">
          <div 
            className={`flex flex-col items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 ${categoryColor.border} ${categoryColor.bg} shadow-lg shrink-0 transition-all`}
          >
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">AQI</span>
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight" aria-label={`Air Quality Index: ${telemetry.aqi}`}>
              {telemetry.aqi}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${categoryColor.text}`}>
              {telemetry.category}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              {isGpsLocated ? (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" aria-hidden="true" />
                  Hyperlocal GPS Active
                </span>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  Atmospheric Telemetry
                </span>
              )}
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Updated {formattedTime}
              </span>
            </div>
            <h1 id="aqi-hero-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {cityName}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Dominant Pollutant: <strong className="text-emerald-300">{telemetry.dominantPollutant}</strong>. Ambient fine particulate is{' '}
              <strong>{(telemetry.pm25 / 15).toFixed(1)}x</strong> above the WHO 24-hour safe guideline (15 µg/m³).
            </p>
          </div>
        </div>

        {/* Right: Weather Telemetry Chips */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-1">
            <Thermometer className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Temp</span>
              <span className="text-sm font-bold text-white">{telemetry.temperature}°C</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-800 self-center hidden sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2.5 px-3 py-1">
            <Droplets className="w-5 h-5 text-cyan-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Humidity</span>
              <span className="text-sm font-bold text-white">{telemetry.humidity}%</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-800 self-center hidden sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2.5 px-3 py-1">
            <Wind className="w-5 h-5 text-teal-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Wind</span>
              <span className="text-sm font-bold text-white">{telemetry.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick City Navigation Pills */}
      {onSelectCityId && (
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0">
            Quick Cities:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {popularCityIds.map((cId) => {
              const city = INDIAN_CITIES.find(c => c.id === cId);
              if (!city) return null;
              const isSelected = activeCityId === cId;
              return (
                <button
                  key={cId}
                  onClick={() => onSelectCityId(cId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {city.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pollutant Detail Grid */}
      <div className="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PM2.5</span>
            <span className="text-[10px] text-slate-500">µg/m³</span>
          </div>
          <div className="text-xl font-black text-rose-400 mt-1">{telemetry.pm25}</div>
          <div className="text-[10px] text-slate-400 truncate">Fine inhalable</div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PM10</span>
            <span className="text-[10px] text-slate-500">µg/m³</span>
          </div>
          <div className="text-xl font-black text-amber-400 mt-1">{telemetry.pm10}</div>
          <div className="text-[10px] text-slate-400 truncate">Coarse dust</div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>NO2</span>
            <span className="text-[10px] text-slate-500">µg/m³</span>
          </div>
          <div className="text-xl font-black text-cyan-400 mt-1">{telemetry.no2}</div>
          <div className="text-[10px] text-slate-400 truncate">Traffic exhaust</div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SO2</span>
            <span className="text-[10px] text-slate-500">µg/m³</span>
          </div>
          <div className="text-xl font-black text-teal-400 mt-1">{telemetry.so2}</div>
          <div className="text-[10px] text-slate-400 truncate">Industrial fuel</div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CO</span>
            <span className="text-[10px] text-slate-500">mg/m³</span>
          </div>
          <div className="text-xl font-black text-slate-200 mt-1">{telemetry.co}</div>
          <div className="text-[10px] text-slate-400 truncate">Incomplete burn</div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ozone (O3)</span>
            <span className="text-[10px] text-slate-500">µg/m³</span>
          </div>
          <div className="text-xl font-black text-indigo-400 mt-1">{telemetry.o3}</div>
          <div className="text-[10px] text-slate-400 truncate">Sunlight smog</div>
        </div>
      </div>

      {/* Attribution & Data Source Footer Banner */}
      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>
            Telemetry Source: <strong className="text-slate-300">{telemetry.source === 'live_open_meteo' ? 'Open-Meteo European/US Atmospheric API (Live)' : 'Calibrated Historical CPCB Winter Baseline'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>CPCB National Ambient Air Quality Standard (NAAQS)</span>
        </div>
      </div>
    </section>
  );
};
