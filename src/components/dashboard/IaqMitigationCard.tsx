import React from 'react';
import { IaqMitigationPlan } from '../../types/aqi';
import { Home, Wind, Fan, CheckCircle2, Sparkles } from 'lucide-react';

interface IaqMitigationCardProps {
  plan: IaqMitigationPlan;
}

export const IaqMitigationCard: React.FC<IaqMitigationCardProps> = ({ plan }) => {
  return (
    <section 
      aria-labelledby="iaq-heading"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          <h2 id="iaq-heading" className="text-lg font-bold text-white">
            Indoor Air Quality (IAQ) & Smog Shielding
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Home Optimization
        </span>
      </div>

      {/* Grid: Window Status + Purifier Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Window Ventilation Card */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          plan.ventilationRecommendedNow 
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4" aria-hidden="true" />
                Window Ventilation Status
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                plan.ventilationRecommendedNow ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {plan.ventilationRecommendedNow ? 'OPEN SAFE NOW' : 'KEEP WINDOWS SEALED'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              {plan.ventilationReason}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
            Optimal Solar Flushing Slot: <strong className="text-white">{plan.bestVentilationHour}</strong>
          </div>
        </div>

        {/* Air Purifier Dynamic Protocol */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Fan className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                Air Purifier Configuration
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Mode: {plan.purifierMode}
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {plan.recommendedPurifierRuntimeHours} <span className="text-xs font-normal text-slate-400">hours/day</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {plan.recommendedPurifierRuntimeHours >= 18 
                ? 'Severe ambient particulate requires continuous HEPA circulation to counteract passive envelope infiltration.' 
                : 'Cyclic operation during morning and evening rush hours is sufficient.'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            Keep pre-filters vacuumed bi-weekly to prevent motor strain.
          </div>
        </div>
      </div>

      {/* Actionable DIY Smog Hacks */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Actionable DIY Smog Mitigation Hacks:
        </h3>
        <div className="space-y-2">
          {plan.diyActionTips.map((tip, idx) => {
            const [title, desc] = tip.split(': ');
            return (
              <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs">
                  <strong className="text-slate-200 block mb-0.5">{title}</strong>
                  <span className="text-slate-400 leading-relaxed">{desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
