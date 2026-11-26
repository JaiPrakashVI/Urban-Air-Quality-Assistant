import React from 'react';
import { VulnerabilityProfile } from '../../types/aqi';
import { PERSONA_PROFILES } from '../../engines/vulnerabilityEngine';
import { Users, CheckCircle2, HeartPulse, Baby, Flame, Briefcase, ShieldCheck } from 'lucide-react';

interface PersonaSwitcherProps {
  selectedPersona: VulnerabilityProfile;
  onSelectPersona: (persona: VulnerabilityProfile) => void;
}

/**
 * Household Vulnerability Profile Selector Component.
 * Enables users to toggle across 6 clinical personas (Asthmatic, Infant Parent, Elderly,
 * Athlete, Commuter, General Resident), dynamically recalibrating biological risk multipliers (1.0x-1.85x).
 */
const PersonaSwitcherComponent: React.FC<PersonaSwitcherProps> = ({
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

  const getPersonaSubtitle = (id: string) => {
    switch (id) {
      case 'asthmatic':
        return 'Asthma & reactive airways';
      case 'infant_parent':
        return 'Infants & young children';
      case 'elderly':
        return 'Ages 60+ & cardiac care';
      case 'outdoor_athlete':
        return 'Runners, cyclists & sports';
      case 'commuter':
        return 'Daily road & transit travel';
      case 'healthy_adult':
      default:
        return 'Baseline preventative care';
    }
  };

  return (
    <section 
      aria-labelledby="persona-selector-heading"
      className="glass-card rounded-2xl p-5 sm:p-6 shadow-xs transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 id="persona-selector-heading" className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Vulnerability Profiles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select household profile to recalculate minute ventilation and clinical thresholds.
          </p>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] shrink-0">
          1.0× – 1.85×
        </span>
      </div>

      <div 
        role="radiogroup" 
        aria-label="Select household vulnerability profile"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {personas.map((p) => {
          const isSelected = p.id === selectedPersona.id;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPersona(p)}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500/40'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200/90 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
              }`}
            >
              <div>
                {/* Top row: Icon & Risk Multiplier */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs ${
                    isSelected 
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' 
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5'
                  }`}>
                    {getPersonaIcon(p.id)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`text-[11px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-md ${
                        p.baselineMultiplier >= 1.7 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30' 
                          : p.baselineMultiplier >= 1.4 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {p.baselineMultiplier}×
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2 min-h-[32px] flex items-center">
                  {p.title.split('/')[0].split('(')[0].trim()}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {getPersonaSubtitle(p.id)}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Safe Threshold</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">AQI ≤ {p.maxSafeAqi}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const PersonaSwitcher = React.memo(PersonaSwitcherComponent);
