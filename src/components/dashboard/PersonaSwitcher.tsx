import React from 'react';
import { VulnerabilityProfile } from '../../types/aqi';
import { PERSONA_PROFILES } from '../../engines/vulnerabilityEngine';
import { Users, CheckCircle2 } from 'lucide-react';

interface PersonaSwitcherProps {
  selectedPersona: VulnerabilityProfile;
  onSelectPersona: (persona: VulnerabilityProfile) => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  selectedPersona,
  onSelectPersona,
}) => {
  const personas = Object.values(PERSONA_PROFILES);

  return (
    <section 
      aria-labelledby="persona-selector-heading"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 id="persona-selector-heading" className="text-lg font-bold text-white">
            Vulnerability Persona & Context Profile
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Personalized biological multipliers dynamically recalculate health risks
        </p>
      </div>

      <div 
        role="radiogroup" 
        aria-label="Select your household vulnerability profile"
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
              className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500/80 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-2xl" role="img" aria-hidden="true">{p.avatar}</span>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.baselineMultiplier >= 1.7 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : p.baselineMultiplier >= 1.4 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.baselineMultiplier}x Risk Multiplier
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {p.title}
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {p.subtitle}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Safe Threshold:</span>
                <span className="font-bold text-slate-200">AQI ≤ {p.maxSafeAqi}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
