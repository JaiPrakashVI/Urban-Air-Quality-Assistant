import React from 'react';
import { VulnerabilityProfile } from '../../types/aqi';
import { PERSONA_PROFILES } from '../../engines/vulnerabilityEngine';
import { Users, CheckCircle2, ShieldAlert, HeartPulse, Baby, Flame, Briefcase, ShieldCheck } from 'lucide-react';

interface PersonaSwitcherProps {
  selectedPersona: VulnerabilityProfile;
  onSelectPersona: (persona: VulnerabilityProfile) => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  selectedPersona,
  onSelectPersona,
}) => {
  const personas = Object.values(PERSONA_PROFILES);

  const getPersonaIcon = (id: string) => {
    switch (id) {
      case 'asthmatic':
        return <HeartPulse className="w-5 h-5 text-rose-500" aria-hidden="true" />;
      case 'infant_parent':
        return <Baby className="w-5 h-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />;
      case 'elderly':
        return <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
      case 'outdoor_athlete':
        return <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />;
      case 'commuter':
        return <Briefcase className="w-5 h-5 text-blue-500" aria-hidden="true" />;
      case 'healthy_adult':
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
    }
  };

  return (
    <section 
      aria-labelledby="persona-selector-heading"
      className="glass-card rounded-3xl p-6 sm:p-7 shadow-sm transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <h2 id="persona-selector-heading" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Household Vulnerability Profiles
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select profile to recalculate minute ventilation and clinical thresholds in real-time.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          <span>Multipliers: <strong className="text-slate-900 dark:text-white">1.0x – 1.85x</strong></span>
        </div>
      </div>

      <div 
        role="radiogroup" 
        aria-label="Select your household vulnerability profile"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
      >
        {personas.map((p) => {
          const isSelected = p.id === selectedPersona.id;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPersona(p)}
              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-emerald-50/90 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-teal-950/30 border-emerald-500 shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-white/80 dark:bg-slate-950/50 border-slate-200/90 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div>
                {/* Icon & Risk Badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
                    isSelected 
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' 
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5'
                  }`}>
                    {getPersonaIcon(p.id)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        p.baselineMultiplier >= 1.7 
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' 
                          : p.baselineMultiplier >= 1.4 
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.baselineMultiplier}x Bio-Risk
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {p.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {p.subtitle}
                </div>

                {/* Target Conditions Chips */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {p.targetConditions.map((cond, i) => (
                    <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5 font-medium">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Safe Threshold:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">AQI ≤ {p.maxSafeAqi}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
