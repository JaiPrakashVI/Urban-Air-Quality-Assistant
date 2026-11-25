import React from 'react';
import { CityPreset, PollutantTelemetry } from '../../types/aqi';
import { INDIAN_CITIES } from '../../services/openMeteoApi';
import { ShieldCheck, MapPin, Radio, RefreshCw, Crosshair } from 'lucide-react';

interface HeaderProps {
  selectedCity: CityPreset;
  onSelectCity: (city: CityPreset) => void;
  telemetry: PollutantTelemetry;
  isLoading: boolean;
  onRefresh: () => void;
  onDetectLocation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onSelectCity,
  telemetry,
  isLoading,
  onRefresh,
  onDetectLocation,
}) => {
  const isLive = telemetry.source === 'live_open_meteo';

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Skip to Main Content Link for Screen Readers (WCAG a11y) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-bold shadow-lg transition-all"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                AeroShield
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Challenge 06
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Context-Aware Urban Air Quality & Smog Mitigation Assistant
            </p>
          </div>
        </div>

        {/* Location Selector & Live Telemetry Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* City Selector */}
          <div className="relative">
            <label htmlFor="city-select" className="sr-only">Select Urban Location</label>
            <div className="flex items-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 transition-colors shadow-inner">
              <MapPin className="w-4 h-4 text-emerald-400 mr-2 shrink-0" aria-hidden="true" />
              <select
                id="city-select"
                aria-label="Select City"
                value={selectedCity.id}
                onChange={(e) => {
                  const city = INDIAN_CITIES.find(c => c.id === e.target.value);
                  if (city) onSelectCity(city);
                }}
                className="bg-transparent border-none text-slate-100 font-medium focus:ring-0 focus:outline-none cursor-pointer pr-4"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={onDetectLocation}
            title="Detect My City via GPS"
            aria-label="Auto detect my city location via browser geolocation"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <Crosshair className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Refresh / Telemetry Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} aria-hidden="true" />
            <span className="font-semibold text-slate-300">
              {isLive ? 'Live Open-Meteo' : 'Calibrated Cache'}
            </span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh telemetry feed"
              aria-label="Refresh air quality telemetry"
              className="text-slate-400 hover:text-emerald-400 ml-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
