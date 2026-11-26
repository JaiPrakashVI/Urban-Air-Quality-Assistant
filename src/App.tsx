import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { VulnerabilityProfile } from './types/aqi';
import { PERSONA_PROFILES, calculatePersonalRisk } from './engines/vulnerabilityEngine';
import { calculateIaqMitigation } from './engines/iaqMitigationEngine';
import { useTheme } from './hooks/useTheme';
import { useAirQuality } from './hooks/useAirQuality';
import { useGeolocation } from './hooks/useGeolocation';
import { useHealthReport } from './hooks/useHealthReport';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AqiHeroCard } from './components/dashboard/AqiHeroCard';
import { PersonaSwitcher } from './components/dashboard/PersonaSwitcher';
import { RiskScoreCard } from './components/dashboard/RiskScoreCard';
import { TabLoadingSkeleton } from './components/ui/TabLoadingSkeleton';
import { 
  LayoutDashboard, 
  Calendar, 
  Home, 
  Compass, 
  MessageSquareCode, 
  Download, 
  Check
} from 'lucide-react';

// Dynamic code splitting for non-critical secondary tabs (maximum initial bundle efficiency)
const SafeWindowPlanner = lazy(() => 
  import('./components/dashboard/SafeWindowPlanner').then(m => ({ default: m.SafeWindowPlanner }))
);
const IaqMitigationCard = lazy(() => 
  import('./components/dashboard/IaqMitigationCard').then(m => ({ default: m.IaqMitigationCard }))
);
const EcoCommuteCalculator = lazy(() => 
  import('./components/dashboard/EcoCommuteCalculator').then(m => ({ default: m.EcoCommuteCalculator }))
);
const ChatAssistant = lazy(() => 
  import('./components/assistant/ChatAssistant').then(m => ({ default: m.ChatAssistant }))
);

type ActiveTab = 'overview' | 'planner' | 'iaq' | 'commute' | 'assistant';

export const App: React.FC = () => {
  // Theme management via custom hook
  const { theme, toggleTheme } = useTheme();

  // Air quality telemetry and forecasting engine hook
  const {
    selectedCity,
    telemetry,
    forecasts,
    isLoading,
    selectCity,
    selectCityById,
    refreshTelemetry,
  } = useAirQuality();

  // Hyperlocal GPS auto-detection hook
  const { isGpsLocated, isDetecting, detectLocation, resetGpsStatus } = useGeolocation();

  // Active user vulnerability persona profile
  const [selectedPersona, setSelectedPersona] = useState<VulnerabilityProfile>(
    PERSONA_PROFILES.asthmatic
  );

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Memoized domain calculations - only recalculated when inputs change
  const riskAssessment = useMemo(() => {
    return calculatePersonalRisk(telemetry, selectedPersona);
  }, [telemetry, selectedPersona]);

  const iaqPlan = useMemo(() => {
    return calculateIaqMitigation(telemetry);
  }, [telemetry]);

  // Clinical health advisory report export hook
  const { reportExported, exportHealthReport } = useHealthReport({
    city: selectedCity,
    telemetry,
    persona: selectedPersona,
    riskAssessment,
    iaqPlan,
  });

  // Event handlers with stable references
  const handleSelectCity = useCallback((city: typeof selectedCity) => {
    resetGpsStatus();
    selectCity(city);
  }, [resetGpsStatus, selectCity]);

  const handleSelectCityId = useCallback((cityId: string) => {
    resetGpsStatus();
    selectCityById(cityId);
  }, [resetGpsStatus, selectCityById]);

  const handleDetectLocation = useCallback(() => {
    detectLocation((gpsCity) => {
      selectCity(gpsCity);
    });
  }, [detectLocation, selectCity]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white bg-mesh-gradient transition-colors">
      {/* Top Navbar */}
      <Header
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        telemetry={telemetry}
        isLoading={isLoading || isDetecting}
        onRefresh={refreshTelemetry}
        onDetectLocation={handleDetectLocation}
        isGpsActive={isGpsLocated}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area: Expanded container using full side space */}
      <main id="main-content" role="main" className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Navigation Tabs (Accessible ARIA TabList with Segmented Glass Styling) & Advisory Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav 
            role="tablist"
            aria-label="Dashboard views navigation" 
            className="glass-pill p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-xs border border-slate-200 dark:border-white/5"
          >
            <button
              role="tab"
              id="tab-overview"
              aria-controls="panel-overview"
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
              id="tab-planner"
              aria-controls="panel-planner"
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
              id="tab-iaq"
              aria-controls="panel-iaq"
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
              id="tab-commute"
              aria-controls="panel-commute"
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
              id="tab-assistant"
              aria-controls="panel-assistant"
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
            onClick={exportHealthReport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 hover:border-emerald-500/60 shadow-xs transition-all shrink-0 self-start sm:self-auto"
            title="Download personalized clinical advisory report"
          >
            {reportExported ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            <span>{reportExported ? 'Advisory Downloaded' : 'Export Health Advisory'}</span>
          </button>
        </div>

        {/* Tab 1: Overview & Risk Assessment */}
        {activeTab === 'overview' && (
          <div 
            id="panel-overview" 
            role="tabpanel" 
            aria-labelledby="tab-overview"
            className="space-y-6 sm:space-y-8"
          >
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
          <div 
            id="panel-planner" 
            role="tabpanel" 
            aria-labelledby="tab-planner"
            className="space-y-6 sm:space-y-8"
          >
            <Suspense fallback={<TabLoadingSkeleton />}>
              <SafeWindowPlanner forecasts={forecasts} persona={selectedPersona} />
            </Suspense>
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
          <div 
            id="panel-iaq" 
            role="tabpanel" 
            aria-labelledby="tab-iaq"
            className="space-y-6 sm:space-y-8"
          >
            <Suspense fallback={<TabLoadingSkeleton />}>
              <IaqMitigationCard plan={iaqPlan} />
            </Suspense>
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
          <div 
            id="panel-commute" 
            role="tabpanel" 
            aria-labelledby="tab-commute"
            className="space-y-6 sm:space-y-8"
          >
            <Suspense fallback={<TabLoadingSkeleton />}>
              <EcoCommuteCalculator telemetry={telemetry} />
            </Suspense>
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
          <div 
            id="panel-assistant" 
            role="tabpanel" 
            aria-labelledby="tab-assistant"
            className="space-y-6 sm:space-y-8"
          >
            <Suspense fallback={<TabLoadingSkeleton />}>
              <ChatAssistant telemetry={telemetry} persona={selectedPersona} cityName={selectedCity.name} />
            </Suspense>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
