import React, { useState, useMemo } from 'react';
import { HourlyForecast, VulnerabilityProfile } from '../../types/aqi';
import { calculateSafeActivityWindows } from '../../engines/activityPlannerEngine';
import { getAqiCategoryColor } from '../../services/openMeteoApi';
import { Calendar, Sun, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface SafeWindowPlannerProps {
  forecasts: HourlyForecast[];
  persona: VulnerabilityProfile;
}

const SafeWindowPlannerComponent: React.FC<SafeWindowPlannerProps> = ({
  forecasts,
  persona,
}) => {
  const [activityType, setActivityType] = useState<
    'morning_walk' | 'school_commute' | 'outdoor_workout' | 'grocery_run' | 'general'
  >('morning_walk');

  const safeWindow = useMemo(
    () => calculateSafeActivityWindows(forecasts, persona, activityType),
    [forecasts, persona, activityType]
  );

  const activities = [
    { id: 'morning_walk', label: 'Morning Walk' },
    { id: 'school_commute', label: 'School Run' },
    { id: 'outdoor_workout', label: 'Workout / Run' },
    { id: 'grocery_run', label: 'Grocery Errands' },
    { id: 'general', label: 'General Routine' },
  ] as const;

  return (
    <section 
      aria-labelledby="activity-planner-heading"
      className="glass-card rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="activity-planner-heading" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Daily Smog Routine & Safe Window Planner
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Atmospheric boundary layer solar mixing model
              </span>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 self-start sm:self-auto">
            Diurnal Forecasting
          </span>
        </div>

        {/* Activity Segmented Pills Switcher */}
        <div 
          role="radiogroup" 
          aria-label="Select outdoor activity type" 
          className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-white/5 mb-5"
        >
          {activities.map((a) => (
            <button
              key={a.id}
              role="radio"
              aria-checked={activityType === a.id}
              onClick={() => setActivityType(a.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activityType === a.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Hero Calculated Window Banner */}
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/40 p-5 sm:p-6 rounded-2xl border border-teal-200 dark:border-teal-500/30 mb-5 relative overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400 flex items-center gap-1.5 mb-1.5">
                <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin-slow" aria-hidden="true" />
                Calculated Optimal Outdoor Window Today
              </span>

              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <Clock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                {safeWindow.bestWindow}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-xl leading-relaxed">
                {safeWindow.rationale}
              </p>
            </div>

            <div className="shrink-0 self-start sm:self-auto">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold ${
                safeWindow.safeForCurrentPersona 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40' 
                  : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40'
              }`}>
                {safeWindow.safeForCurrentPersona ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    Acceptable for {persona.title.split(' ')[0]}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                    Caution: Inhalation Exceeds Limits
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Diurnal Timeline */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            24-Hour Atmospheric Smog Curve:
          </span>
          <span className="text-[11px] text-slate-400">Scroll horizontally →</span>
        </div>

        <div 
          tabIndex={0}
          role="region"
          aria-label="24-hour diurnal air quality forecast scrollable timeline"
          className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin"
        >
          {forecasts.map((f, i) => {
            const colors = getAqiCategoryColor(f.category);
            const isWindowHour = safeWindow.bestWindow.includes(f.time);

            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border shrink-0 w-24 transition-all ${
                  isWindowHour 
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-xs ring-1 ring-teal-500/50' 
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/5'
                }`}
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.time}</span>
                
                <div 
                  className={`my-2 text-sm font-black px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}
                  title={`${f.category}: AQI ${f.aqi}`}
                >
                  {f.aqi}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {f.pm25} µg
                </div>

                <div className="mt-1.5 text-[10px] text-center font-bold">
                  {f.hour >= 12 && f.hour <= 16 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> Solar
                    </span>
                  ) : f.hour >= 5 && f.hour <= 9 ? (
                    <span className="text-rose-600 dark:text-rose-400">Inversion</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Trapped</span>
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

export const SafeWindowPlanner = React.memo(SafeWindowPlannerComponent);
