import React, { useState } from 'react';
import { HourlyForecast, VulnerabilityProfile } from '../../types/aqi';
import { calculateSafeActivityWindows } from '../../engines/activityPlannerEngine';
import { getAqiCategoryColor } from '../../services/openMeteoApi';
import { Calendar, Sun, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface SafeWindowPlannerProps {
  forecasts: HourlyForecast[];
  persona: VulnerabilityProfile;
}

export const SafeWindowPlanner: React.FC<SafeWindowPlannerProps> = ({
  forecasts,
  persona,
}) => {
  const [activityType, setActivityType] = useState<
    'morning_walk' | 'school_commute' | 'outdoor_workout' | 'grocery_run' | 'general'
  >('morning_walk');

  const safeWindow = calculateSafeActivityWindows(forecasts, persona, activityType);

  return (
    <section 
      aria-labelledby="activity-planner-heading"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" aria-hidden="true" />
          <h2 id="activity-planner-heading" className="text-lg font-bold text-white">
            Safe Activity Window & Diurnal Smog Planner
          </h2>
        </div>

        {/* Activity Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="activity-select" className="text-xs text-slate-400 font-medium">Activity:</label>
          <select
            id="activity-select"
            aria-label="Select Daily Activity"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="morning_walk">Morning Walk / Jog</option>
            <option value="school_commute">School Commute & Drop-off</option>
            <option value="outdoor_workout">Outdoor Workout / Cycling</option>
            <option value="grocery_run">Grocery & Errands</option>
            <option value="general">General Daily Routine</option>
          </select>
        </div>
      </div>

      {/* Hero Window Recommendation Box */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 rounded-xl border border-teal-500/30 mb-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-1">
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              Calculated Optimal Outdoor Window Today
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-emerald-400" aria-hidden="true" />
              {safeWindow.bestWindow}
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {safeWindow.rationale}
            </p>
          </div>

          <div className="shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              safeWindow.safeForCurrentPersona 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {safeWindow.safeForCurrentPersona ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  Acceptable for {persona.title.split(' ')[0]}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" aria-hidden="true" />
                  Caution: Inhalation Exceeds Limits
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 24-Hour Diurnal Forecast Timeline */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300">Hourly Atmospheric Smog Curve (24h Forecast):</span>
          <span>Scroll horizontally →</span>
        </div>

        <div 
          tabIndex={0}
          role="region"
          aria-label="Hourly air quality forecast scrollable timeline"
          className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin"
        >
          {forecasts.map((f, i) => {
            const colors = getAqiCategoryColor(f.category);
            const isWindowHour = safeWindow.bestWindow.includes(f.time);

            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border shrink-0 w-24 transition-all ${
                  isWindowHour 
                    ? 'bg-teal-950/40 border-teal-400/80 shadow-md ring-1 ring-teal-400/50' 
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <span className="text-xs font-bold text-slate-300">{f.time}</span>
                
                <div 
                  className={`my-2 text-sm font-black px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}
                  title={`${f.category}: AQI ${f.aqi}`}
                >
                  {f.aqi}
                </div>

                <div className="text-[10px] text-slate-400 font-medium">
                  {f.pm25} µg
                </div>

                <div className="mt-2 text-[10px] text-center font-semibold">
                  {f.hour >= 12 && f.hour <= 16 ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" aria-hidden="true" /> Solar Mix
                    </span>
                  ) : f.hour >= 5 && f.hour <= 9 ? (
                    <span className="text-rose-400">Inversion</span>
                  ) : (
                    <span className="text-slate-500">Normal</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
