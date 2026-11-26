import React from 'react';
import { PollutantTelemetry } from '../../types/aqi';
import { getAqiCategoryColor, INDIAN_CITIES } from '../../services/openMeteoApi';
import { Wind, Droplets, Thermometer, AlertCircle, Clock, Database, Navigation, Activity } from 'lucide-react';

interface AqiHeroCardProps {
  telemetry: PollutantTelemetry;
  cityName: string;
  activeCityId?: string;
  onSelectCityId?: (cityId: string) => void;
  isGpsLocated?: boolean;
}

const AqiHeroCardComponent: React.FC<AqiHeroCardProps> = ({
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
  });

  const popularCityIds = [
    'delhi', 'mumbai', 'bengaluru', 'kolkata', 'hyderabad', 
    'chennai', 'noida', 'pune', 'lucknow', 'jaipur', 'ahmedabad', 'patna'
  ];

  // Gauge calculation: 0 to 500 AQI mapped to 180-degree arc (-90deg to +90deg)
  const clampedAqi = Math.min(500, Math.max(0, telemetry.aqi));
  const gaugeAngle = (clampedAqi / 500) * 180 - 90;

  // Relative pollutant threshold percentages (based on CPCB / WHO limits)
  const pm25Ratio = Math.min(100, Math.round((telemetry.pm25 / 60) * 100)); // 60 is CPCB 24h limit
  const pm10Ratio = Math.min(100, Math.round((telemetry.pm10 / 100) * 100));
  const no2Ratio = Math.min(100, Math.round((telemetry.no2 / 80) * 100));
  const so2Ratio = Math.min(100, Math.round((telemetry.so2 / 80) * 100));
  const o3Ratio = Math.min(100, Math.round((telemetry.o3 / 100) * 100));
  const coRatio = Math.min(100, Math.round((telemetry.co / 2.0) * 100));

  return (
    <section 
      aria-labelledby="aqi-hero-heading"
      aria-live="polite"
      aria-atomic="true"
      className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl transition-all"
    >
      {/* Dynamic Background Radial Aura */}
      <div 
        className="absolute -right-24 -top-24 w-96 h-96 rounded-full blur-[100px] opacity-25 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: categoryColor.hex }}
        aria-hidden="true"
      />
      <div 
        className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-[90px] opacity-10 pointer-events-none bg-emerald-500"
        aria-hidden="true"
      />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 border-b border-slate-200 dark:border-white/5 pb-4">
        <div className="flex items-center gap-2">
          {isGpsLocated ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <Navigation className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Hyperlocal GPS Telemetry
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Live Telemetry Monitor
            </span>
          )}
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            Synchronized at {formattedTime}
          </span>
        </div>

        {/* Weather Strip */}
        <div className="flex items-center gap-4 bg-slate-100/90 dark:bg-slate-950/70 px-4 py-1.5 rounded-2xl border border-slate-200 dark:border-white/5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Thermometer className="w-4 h-4 text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <span className="font-bold text-slate-900 dark:text-white">{telemetry.temperature}°C</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Droplets className="w-4 h-4 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
            <span className="font-bold text-slate-900 dark:text-white">{telemetry.humidity}%</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Wind className="w-4 h-4 text-teal-500 dark:text-teal-400" aria-hidden="true" />
            <span className="font-bold text-slate-900 dark:text-white">{telemetry.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Main Gauge & Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left: Radial SVG Arc Speedometer Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-white/5 relative">
          <div className="relative w-56 h-36 flex items-center justify-center overflow-hidden">
            {/* SVG Speedometer Gauge */}
            <svg 
              viewBox="0 0 200 110" 
              className="w-full h-full"
              role="img"
              aria-label={`Air Quality Index gauge showing ${telemetry.aqi}, categorized as ${telemetry.category}`}
            >
              <defs>
                <linearGradient id="aqiArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="20%" stopColor="#F59E0B" />
                  <stop offset="45%" stopColor="#F97316" />
                  <stop offset="70%" stopColor="#EF4444" />
                  <stop offset="85%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#E2E8F0"
                className="dark:stroke-slate-800"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Gradient Arc Fill */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#aqiArcGradient)"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Needle Indicator */}
              <g transform={`rotate(${gaugeAngle}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="28"
                  stroke="#0F172A"
                  className="dark:stroke-white transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="7" fill="#0F172A" className="dark:fill-white" />
                <circle cx="100" cy="100" r="3" fill="#10B981" />
              </g>
            </svg>
          </div>

          {/* Central Score Callout */}
          <div className="text-center mt-[-8px]">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight" aria-label={`AQI: ${telemetry.aqi}`}>
                {telemetry.aqi}
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">AQI</span>
            </div>
            
            <div className="mt-1">
              <span 
                className={`inline-block text-xs uppercase font-extrabold px-3 py-1 rounded-full border shadow-xs ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
              >
                {telemetry.category}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: City Details & Health Alert (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
              Atmospheric Diagnostic
            </span>
            <h1 id="aqi-hero-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {cityName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Primary Air Contaminant:{' '}
              <strong className="text-emerald-700 dark:text-emerald-300 underline decoration-emerald-500/40 underline-offset-4">
                {telemetry.dominantPollutant}
              </strong>. 
              Ambient fine particulate burden is currently{' '}
              <strong className="text-rose-600 dark:text-rose-300">
                {(telemetry.pm25 / 15).toFixed(1)}x above
              </strong>{' '}
              the WHO 24-hour health guideline limit (15 µg/m³).
            </p>
          </div>

          {/* Key Insight Chip Box */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Inversion Hazard</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {telemetry.aqi > 250 ? 'Critical Morning Ceiling' : telemetry.aqi > 150 ? 'Moderate Ground Smog' : 'Active Mixing'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Ventilation Guideline</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {telemetry.aqi > 200 ? 'Mechanical HEPA Only' : '1:00 - 3:30 PM Safe Flush'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick City Switcher Bar */}
      {onSelectCityId && (
        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-white/5 flex items-center gap-3 overflow-x-auto scrollbar-none pb-1 relative z-10">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400 shrink-0">
            Hotspots:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {popularCityIds.map((cId) => {
              const city = INDIAN_CITIES.find(c => c.id === cId);
              if (!city) return null;
              const isSelected = activeCityId === cId;
              return (
                <button
                  key={cId}
                  onClick={() => onSelectCityId(cId)}
                  aria-label={`Select ${city.name} air quality data`}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/50'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/70 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {city.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comprehensive 6-Pollutant Telemetry Grid */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative z-10">
        
        {/* PM2.5 */}
        <div className="bg-slate-50/90 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">PM2.5</span>
            <span className="text-[10px]">µg/m³</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{telemetry.pm25}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              role="progressbar"
              aria-valuenow={telemetry.pm25}
              aria-valuemin={0}
              aria-valuemax={150}
              aria-label="PM2.5 particulate level"
              className="bg-rose-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, pm25Ratio)}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">Fine soot</span>
        </div>

        {/* PM10 */}
        <div className="bg-slate-50/90 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">PM10</span>
            <span className="text-[10px]">µg/m³</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{telemetry.pm10}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              role="progressbar"
              aria-valuenow={telemetry.pm10}
              aria-valuemin={0}
              aria-valuemax={250}
              aria-label="PM10 coarse dust level"
              className="bg-amber-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, pm10Ratio)}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">Coarse dust</span>
        </div>

        {/* NO2 */}
        <div className="bg-slate-50/90 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">NO2</span>
            <span className="text-[10px]">µg/m³</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{telemetry.no2}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              role="progressbar"
              aria-valuenow={telemetry.no2}
              aria-valuemin={0}
              aria-valuemax={150}
              aria-label="NO2 traffic exhaust level"
              className="bg-cyan-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, no2Ratio)}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">Traffic exhaust</span>
        </div>

        {/* SO2 */}
        <div className="bg-slate-50/90 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">SO2</span>
            <span className="text-[10px]">µg/m³</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{telemetry.so2}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              role="progressbar"
              aria-valuenow={telemetry.so2}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="SO2 industrial emissions level"
              className="bg-teal-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, so2Ratio)}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">Industrial coal</span>
        </div>

        {/* CO */}
        <div className="bg-slate-50/90 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">CO</span>
            <span className="text-[10px]">mg/m³</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-slate-700 dark:text-slate-100">{telemetry.co}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              role="progressbar"
              aria-valuenow={telemetry.co}
              aria-valuemin={0}
              aria-valuemax={4.0}
              aria-label="CO carbon monoxide level"
              className="bg-slate-400 h-full rounded-full" 
              style={{ width: `${Math.min(100, coRatio)}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">Carbon monoxide</span>
        </div>

        {/* Ozone */}
        <div className="bg-slate-50/90 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">Ozone</span>
            <span className="text-[10px]">µg/m³</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{telemetry.o3}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              role="progressbar"
              aria-valuenow={telemetry.o3}
              aria-valuemin={0}
              aria-valuemax={180}
              aria-label="Ozone photochemical level"
              className="bg-purple-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, o3Ratio)}%` }} 
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">Photochemical</span>
        </div>

      </div>

      {/* Attribution Banner */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 relative z-10">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>
            Telemetry Source: <strong className="text-slate-700 dark:text-slate-200">{telemetry.source === 'live_open_meteo' ? 'Open-Meteo European/US Atmospheric API (Live)' : 'Calibrated Historical CPCB Baseline'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
          <span>CPCB National Ambient Air Quality Standard (NAAQS)</span>
        </div>
      </div>
    </section>
  );
};

export const AqiHeroCard = React.memo(AqiHeroCardComponent);
