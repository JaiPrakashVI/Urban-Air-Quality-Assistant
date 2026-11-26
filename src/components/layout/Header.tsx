import React, { useState, useEffect, useRef } from 'react';
import { CityPreset, PollutantTelemetry } from '../../types/aqi';
import { INDIAN_CITIES, searchCitiesGeocoding } from '../../services/openMeteoApi';
import { ShieldCheck, MapPin, Radio, RefreshCw, Crosshair, Search, Sparkles, X, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  selectedCity: CityPreset;
  onSelectCity: (city: CityPreset) => void;
  telemetry: PollutantTelemetry;
  isLoading: boolean;
  onRefresh: () => void;
  onDetectLocation: () => void;
  isGpsActive?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  selectedCity,
  onSelectCity,
  telemetry,
  isLoading,
  onRefresh,
  onDetectLocation,
  isGpsActive = false,
  theme = 'light',
  onToggleTheme,
}) => {
  const isLive = telemetry.source === 'live_open_meteo';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [geocodedResults, setGeocodedResults] = useState<CityPreset[]>([]);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter preset cities
  const filteredPresets = INDIAN_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger geocoding search for custom towns if not found in presets
  useEffect(() => {
    if (searchQuery.trim().length >= 3 && filteredPresets.length === 0) {
      const timer = setTimeout(async () => {
        setIsSearchingGeocode(true);
        const results = await searchCitiesGeocoding(searchQuery);
        setGeocodedResults(results);
        setIsSearchingGeocode(false);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setGeocodedResults([]);
      setIsSearchingGeocode(false);
    }
  }, [searchQuery, filteredPresets.length]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-bold shadow-lg transition-all"
      >
        Skip to main content
      </a>

      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/10 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent m-0">
                AeroShield
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                Live Advisory
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden md:block">
              Context-Aware Urban Air Quality & Smog Mitigation Assistant
            </p>
          </div>
        </div>

        {/* Search Bar & City Selector */}
        <div className="flex-1 max-w-md relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <label htmlFor="city-search-input" className="sr-only">
              Search cities or districts in India
            </label>
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
            <input
              id="city-search-input"
              type="text"
              role="combobox"
              aria-expanded={isDropdownOpen}
              aria-controls={isDropdownOpen ? "city-search-listbox" : undefined}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsDropdownOpen(false);
                }
              }}
              placeholder={selectedCity.name ? `Search 35+ cities (Active: ${selectedCity.name})` : "Search any city or district in India..."}
              className="w-full bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              aria-label="Search cities or districts in India"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setGeocodedResults([]);
                }}
                className="absolute right-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div 
              id="city-search-listbox"
              role="listbox"
              aria-label="City suggestions"
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50 scrollbar-thin"
            >
              {/* Presets List */}
              {filteredPresets.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    Preset Urban Hotspots ({filteredPresets.length})
                  </div>
                  {filteredPresets.map((c) => (
                    <button
                      key={c.id}
                      role="option"
                      aria-selected={c.id === selectedCity.id}
                      onClick={() => {
                        onSelectCity(c);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${
                        c.id === selectedCity.id ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{c.defaultTelemetry.category}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Geocoding Results */}
              {isSearchingGeocode && (
                <div className="p-3 text-xs text-slate-600 dark:text-slate-400 text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" aria-hidden="true" />
                  <span>Searching national coordinates...</span>
                </div>
              )}

              {geocodedResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800">
                    Live Geocoded Coordinates ({geocodedResults.length})
                  </div>
                  {geocodedResults.map((c, idx) => (
                    <button
                      key={idx}
                      role="option"
                      aria-selected={c.id === selectedCity.id}
                      onClick={() => {
                        onSelectCity(c);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-700 dark:text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 shrink-0" aria-hidden="true" />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{c.lat.toFixed(2)}, {c.lon.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredPresets.length === 0 && geocodedResults.length === 0 && !isSearchingGeocode && (
                <div className="p-4 text-xs text-slate-600 dark:text-slate-400 text-center">
                  No cities found matching "{searchQuery}". Type 3+ characters to search coordinates.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls: GPS, Telemetry Status & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle (Light / Dark) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-sm"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              )}
            </button>
          )}

          {/* GPS Auto-Detect Button */}
          <button
            onClick={onDetectLocation}
            disabled={isLoading}
            title="Detect My Real-Time GPS Location"
            aria-label="Auto detect my real-time GPS location"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isGpsActive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/50'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Crosshair className={`w-4 h-4 text-emerald-500 dark:text-emerald-400 ${isGpsActive ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">GPS Auto-Detect</span>
          </button>

          {/* Refresh / Telemetry Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-500 dark:text-emerald-400 animate-pulse' : 'text-amber-500 dark:text-amber-400'}`} aria-hidden="true" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {isLive ? 'Live Open-Meteo' : 'Calibrated Cache'}
            </span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh telemetry feed"
              aria-label="Refresh air quality telemetry"
              className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 ml-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
