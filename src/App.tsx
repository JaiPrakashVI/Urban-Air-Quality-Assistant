import React, { useState, useEffect } from 'react';
import { CityPreset, PollutantTelemetry, VulnerabilityProfile, HourlyForecast } from './types/aqi';
import { INDIAN_CITIES, fetchLiveAirQuality, generateDiurnalForecast, reverseGeocodeLocation } from './services/openMeteoApi';
import { PERSONA_PROFILES, calculatePersonalRisk } from './engines/vulnerabilityEngine';
import { calculateIaqMitigation } from './engines/iaqMitigationEngine';
import { Header } from './components/layout/Header';
import { AqiHeroCard } from './components/dashboard/AqiHeroCard';
import { PersonaSwitcher } from './components/dashboard/PersonaSwitcher';
import { RiskScoreCard } from './components/dashboard/RiskScoreCard';
import { SafeWindowPlanner } from './components/dashboard/SafeWindowPlanner';
import { IaqMitigationCard } from './components/dashboard/IaqMitigationCard';
import { EcoCommuteCalculator } from './components/dashboard/EcoCommuteCalculator';
import { ChatAssistant } from './components/assistant/ChatAssistant';
import { Footer } from './components/layout/Footer';
import { LayoutDashboard, Calendar, Home, Compass, MessageSquareCode } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityPreset>(INDIAN_CITIES[0]); // Delhi (NCR)
  const [telemetry, setTelemetry] = useState<PollutantTelemetry>(INDIAN_CITIES[0].defaultTelemetry);
  const [selectedPersona, setSelectedPersona] = useState<VulnerabilityProfile>(PERSONA_PROFILES.asthmatic);
  const [forecasts, setForecasts] = useState<HourlyForecast[]>(() => 
    generateDiurnalForecast(INDIAN_CITIES[0].defaultTelemetry.aqi)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGpsLocated, setIsGpsLocated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'planner' | 'iaq' | 'commute' | 'assistant'>('overview');

  // Load telemetry when city changes
  useEffect(() => {
    let isMounted = true;

    async function loadTelemetry() {
      setIsLoading(true);
      try {
        const liveData = await fetchLiveAirQuality(selectedCity);
        if (isMounted) {
          setTelemetry(liveData);
          setForecasts(generateDiurnalForecast(liveData.aqi));
        }
      } catch (err) {
        console.error('Failed to load air quality:', err);
        if (isMounted) {
          setTelemetry(selectedCity.defaultTelemetry);
          setForecasts(generateDiurnalForecast(selectedCity.defaultTelemetry.aqi));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTelemetry();

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const liveData = await fetchLiveAirQuality(selectedCity);
      setTelemetry(liveData);
      setForecasts(generateDiurnalForecast(liveData.aqi));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle city selection
  const handleSelectCity = (city: CityPreset) => {
    setIsGpsLocated(false);
    setSelectedCity(city);
  };

  // Handle quick city select by ID
  const handleSelectCityId = (cityId: string) => {
    const city = INDIAN_CITIES.find(c => c.id === cityId);
    if (city) {
      handleSelectCity(city);
    }
  };

  // Handle GPS location auto-detect with reverse geocoding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;

        try {
          // Reverse geocode exact locality name
          const placeName = await reverseGeocodeLocation(userLat, userLon);

          const gpsCity: CityPreset = {
            id: `gps-${Date.now()}`,
            name: `${placeName}`,
            country: 'India',
            lat: userLat,
            lon: userLon,
            typicalWinterSmogPeak: 'Local atmospheric inversion peak',
            defaultTelemetry: {
              aqi: 175,
              category: 'Poor',
              pm25: 85,
              pm10: 160,
              no2: 50,
              so2: 18,
              co: 1.4,
              o3: 45,
              temperature: 25,
              humidity: 60,
              windSpeed: 8.0,
              dominantPollutant: 'PM2.5',
              source: 'offline_telemetry',
              timestamp: new Date().toISOString(),
            }
          };

          setIsGpsLocated(true);
          setSelectedCity(gpsCity);
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          // Fallback to nearest city if reverse lookup fails
          let nearest = INDIAN_CITIES[0];
          let minDist = Infinity;
          INDIAN_CITIES.forEach((c) => {
            const d = Math.hypot(c.lat - userLat, c.lon - userLon);
            if (d < minDist) {
              minDist = d;
              nearest = c;
            }
          });
          setIsGpsLocated(true);
          setSelectedCity(nearest);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setIsLoading(false);
        alert('Could not access GPS. Please allow location permissions in your browser or select your city from the search bar.');
      },
      { timeout: 8000 }
    );
  };

  const riskAssessment = calculatePersonalRisk(telemetry, selectedPersona);
  const iaqPlan = calculateIaqMitigation(telemetry);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        telemetry={telemetry}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onDetectLocation={handleDetectLocation}
        isGpsActive={isGpsLocated}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Navigation Tabs (Accessible ARIA TabList) */}
        <nav aria-label="Dashboard views navigation" className="flex flex-wrap items-center border-b border-slate-800/80 pb-3 gap-2">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            <span>Overview & Risk</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'planner'}
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'planner'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Daily Routine Planner</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'iaq'}
            onClick={() => setActiveTab('iaq')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'iaq'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Indoor Air Quality Hacks</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'commute'}
            onClick={() => setActiveTab('commute')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'commute'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>Low-Emission Commute</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'assistant'}
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'assistant'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" aria-hidden="true" />
            <span>GenAI Conversational Assistant</span>
          </button>
        </nav>

        {/* Tab 1: Overview & Risk Assessment */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AqiHeroCard 
              telemetry={telemetry} 
              cityName={selectedCity.name} 
              activeCityId={selectedCity.id}
              onSelectCityId={handleSelectCityId}
              isGpsLocated={isGpsLocated}
            />
            <PersonaSwitcher selectedPersona={selectedPersona} onSelectPersona={setSelectedPersona} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RiskScoreCard assessment={riskAssessment} persona={selectedPersona} />
              <SafeWindowPlanner forecasts={forecasts} persona={selectedPersona} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <IaqMitigationCard plan={iaqPlan} />
              <EcoCommuteCalculator telemetry={telemetry} />
            </div>
          </div>
        )}

        {/* Tab 2: Activity Planner */}
        {activeTab === 'planner' && (
          <div className="space-y-8">
            <PersonaSwitcher selectedPersona={selectedPersona} onSelectPersona={setSelectedPersona} />
            <SafeWindowPlanner forecasts={forecasts} persona={selectedPersona} />
            <AqiHeroCard 
              telemetry={telemetry} 
              cityName={selectedCity.name} 
              activeCityId={selectedCity.id}
              onSelectCityId={handleSelectCityId}
              isGpsLocated={isGpsLocated}
            />
          </div>
        )}

        {/* Tab 3: Indoor Air Quality */}
        {activeTab === 'iaq' && (
          <div className="space-y-8">
            <IaqMitigationCard plan={iaqPlan} />
            <AqiHeroCard 
              telemetry={telemetry} 
              cityName={selectedCity.name} 
              activeCityId={selectedCity.id}
              onSelectCityId={handleSelectCityId}
              isGpsLocated={isGpsLocated}
            />
          </div>
        )}

        {/* Tab 4: Low-Emission Commute */}
        {activeTab === 'commute' && (
          <div className="space-y-8">
            <EcoCommuteCalculator telemetry={telemetry} />
            <AqiHeroCard 
              telemetry={telemetry} 
              cityName={selectedCity.name} 
              activeCityId={selectedCity.id}
              onSelectCityId={handleSelectCityId}
              isGpsLocated={isGpsLocated}
            />
          </div>
        )}

        {/* Tab 5: GenAI Conversational Assistant */}
        {activeTab === 'assistant' && (
          <div className="space-y-8">
            <ChatAssistant telemetry={telemetry} persona={selectedPersona} cityName={selectedCity.name} />
            <PersonaSwitcher selectedPersona={selectedPersona} onSelectPersona={setSelectedPersona} />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
