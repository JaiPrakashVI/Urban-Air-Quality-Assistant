import React from 'react';
import { VulnerabilityProfile } from '../../types/aqi';
import { PERSONA_PROFILES } from '../../engines/vulnerabilityEngine';
import { Users, CheckCircle2, ShieldAlert } from 'lucide-react';

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
      className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <h2 id="persona-selector-heading" className="text-xl font-extrabold text-white tracking-tight">
              Personalized Vulnerability Personas
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Select your household profile to dynamically recalculate clinical inhalation risks and tailored precautions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>Biological Multipliers: <strong>1.0x – 1.85x</strong></span>
        </div>
      </div>

      <div 
        role="radiogroup" 
        aria-label="Select your household vulnerability profile"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {personas.map((p) => {
          const isSelected = p.id === selectedPersona.id;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPersona(p)}
              className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/30 border-emerald-500 shadow-glow-emerald ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/50 border-white/5 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                {/* Avatar & Risk Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-inner ${
                    isSelected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-white/5'
                  }`}>
                    <span role="img" aria-hidden="true">{p.avatar}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        p.baselineMultiplier >= 1.7 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : p.baselineMultiplier >= 1.4 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {p.baselineMultiplier}x Bio-Risk
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {p.title}
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.subtitle}
                </div>

                {/* Target Conditions Chips */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {p.targetConditions.map((cond, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-white/5">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Safe Threshold:</span>
                <span className="font-extrabold text-emerald-400">AQI ≤ {p.maxSafeAqi}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
