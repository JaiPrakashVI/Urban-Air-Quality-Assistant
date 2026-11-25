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
import { 
  LayoutDashboard, 
  Calendar, 
  Home, 
  Compass, 
  MessageSquareCode, 
  Download, 
  Check
} from 'lucide-react';

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
  const [reportExported, setReportExported] = useState<boolean>(false);
  
  // Theme state: default to Light theme as requested
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('aero_theme') : null;
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aero_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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

  // Generate & Download Clinical Health Advisory Report
  const handleExportReport = () => {
    const reportText = `======================================================================
AEROSHIELD URBAN AIR QUALITY ASSISTANT - CLINICAL & SMOG ADVISORY
Generated: ${new Date().toLocaleString()}
Target Location: ${selectedCity.name} (${selectedCity.country})
======================================================================

1. ATMOSPHERIC TELEMETRY:
   - AQI: ${telemetry.aqi} (${telemetry.category})
   - PM2.5: ${telemetry.pm25} µg/m³ (${(telemetry.pm25 / 15).toFixed(1)}x WHO Safe Threshold)
   - PM10: ${telemetry.pm10} µg/m³
   - NO2: ${telemetry.no2} µg/m³ | SO2: ${telemetry.so2} µg/m³ | CO: ${telemetry.co} mg/m³
   - Temperature: ${telemetry.temperature}°C | Humidity: ${telemetry.humidity}% | Wind: ${telemetry.windSpeed} km/h
   - Telemetry Source: ${telemetry.source}

2. PERSONALIZED VULNERABILITY PROFILE:
   - Persona: ${selectedPersona.title}
   - Biological Sensitivity Multiplier: ${selectedPersona.baselineMultiplier}x
   - Calculated Health Vulnerability Index: ${riskAssessment.riskScore} / 100 (${riskAssessment.riskLevel} Risk)
   - Certified Protective Respirator: ${riskAssessment.maskRecommendation}
   ${selectedPersona.specialMedicationReminder ? `- Clinical Medication Protocol: ${selectedPersona.specialMedicationReminder}` : ''}

3. DIURNAL ROUTINE & ACTIVITY WINDOW:
   - Optimal Outdoor Window Today: ${iaqPlan.bestVentilationHour}
   - Rationale: Ground-level radiational inversion traps soot early morning (05:00-09:00 AM). Solar convective mixing dilutes surface particulate mid-day.

4. INDOOR AIR QUALITY (IAQ) MITIGATION:
   - Exterior Windows Status: ${iaqPlan.ventilationRecommendedNow ? 'OPEN SAFE FOR BRIEF FLUSH' : 'KEEP ALL WINDOWS SEALED'}
   - HEPA Air Purifier Operational Mode: ${iaqPlan.purifierMode}
   - Recommended Daily Runtime: ${iaqPlan.recommendedPurifierRuntimeHours} hours
   - Evidence-Based DIY Hacks:
     * Damp mopping over dry sweeping (prevents PM2.5 resuspension)
     * Weatherstripping exterior doors & window frame seals
     * NASA Clean-Air botanicals (Snake Plant, Areca Palm)

5. LOW-EMISSION TRANSIT IMPACT (15 km Commute):
   - Recommended Mode: Metro Rail / Filtered Electric Transit
   - CO2 Avoided vs Solo Driving: ~2.5 kg CO2
   - Inhaled PM2.5 Reduction vs Two-Wheeler: ~80% reduction

======================================================================
AeroShield Clean Air Intelligence • Winter Smog Mitigation Platform
Report Generated: ${new Date().toLocaleString()}
======================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AeroShield_Advisory_${selectedCity.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setReportExported(true);
    setTimeout(() => setReportExported(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white bg-mesh-gradient transition-colors">
      {/* Top Navbar */}
      <Header
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        telemetry={telemetry}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onDetectLocation={handleDetectLocation}
        isGpsActive={isGpsLocated}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area: Expanded container using full side space */}
      <main id="main-content" className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Navigation Tabs (Accessible ARIA TabList with Segmented Glass Styling) & Advisory Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav 
            aria-label="Dashboard views navigation" 
            className="glass-pill p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-xs border border-slate-200 dark:border-white/5"
          >
            <button
              role="tab"
              aria-selected={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span>Overview & Clinical Risk</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'planner'}
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'planner'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Daily Routine Planner</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'iaq'}
              onClick={() => setActiveTab('iaq')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'iaq'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Indoor Air Quality Hacks</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'commute'}
              onClick={() => setActiveTab('commute')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'commute'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Low-Emission Commute</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'assistant'}
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <MessageSquareCode className="w-4 h-4" aria-hidden="true" />
              <span>GenAI Assistant</span>
            </button>
          </nav>

          {/* Action Button: Export Advisory Report */}
          <button
            onClick={handleExportReport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 hover:border-emerald-500/60 shadow-xs transition-all shrink-0 self-start sm:self-auto"
            title="Download personalized clinical advisory report"
          >
            {reportExported ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            <span>{reportExported ? 'Advisory Downloaded' : 'Export Health Advisory'}</span>
          </button>
        </div>

        {/* Tab 1: Overview & Risk Assessment */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            <AqiHeroCard 
              telemetry={telemetry} 
              cityName={selectedCity.name} 
              activeCityId={selectedCity.id}
              onSelectCityId={handleSelectCityId}
              isGpsLocated={isGpsLocated}
            />

            {/* Expansive 2-Column Desktop Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
              <div className="xl:col-span-6">
                <PersonaSwitcher selectedPersona={selectedPersona} onSelectPersona={setSelectedPersona} />
              </div>
              <div className="xl:col-span-6">
                <RiskScoreCard assessment={riskAssessment} persona={selectedPersona} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Activity Planner */}
        {activeTab === 'planner' && (
          <div className="space-y-6 sm:space-y-8">
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
          <div className="space-y-6 sm:space-y-8">
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
          <div className="space-y-6 sm:space-y-8">
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
          <div className="space-y-6 sm:space-y-8">
            <ChatAssistant telemetry={telemetry} persona={selectedPersona} cityName={selectedCity.name} />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
