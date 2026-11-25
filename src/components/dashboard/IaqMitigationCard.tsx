import React from 'react';
import { IaqMitigationPlan } from '../../types/aqi';
import { Home, Wind, Fan, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

interface IaqMitigationCardProps {
  plan: IaqMitigationPlan;
}

export const IaqMitigationCard: React.FC<IaqMitigationCardProps> = ({ plan }) => {
  return (
    <section 
      aria-labelledby="iaq-heading"
      className="glass-card rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Home className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="iaq-heading" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Indoor Air Quality (IAQ) & Smog Shielding
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mechanical filtration & envelope infiltration protocols
              </span>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
            Home Defense
          </span>
        </div>

        {/* Status Dual Cards: Window Flush & Purifier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Window Ventilation */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between ${
            plan.ventilationRecommendedNow 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wind className="w-4 h-4" aria-hidden="true" />
                  Window Ventilation
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  plan.ventilationRecommendedNow 
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40' 
                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                }`}>
                  {plan.ventilationRecommendedNow ? 'OPEN SAFE NOW' : 'KEEP SEALED'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                {plan.ventilationReason}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-200/60 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
              Optimal Flushing Slot: <strong className="text-slate-900 dark:text-white font-bold">{plan.bestVentilationHour}</strong>
            </div>
          </div>

          {/* Air Purifier Config */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Fan className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" aria-hidden="true" />
                  HEPA Air Purifier Mode
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                  {plan.purifierMode}
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.recommendedPurifierRuntimeHours}</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">hours daily runtime</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {plan.recommendedPurifierRuntimeHours >= 18 
                  ? 'Severe ambient pollution mandates continuous circulation to counteract building envelope infiltration.' 
                  : 'Operate cyclically during morning and evening rush hours.'}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span>Vacuum pre-filters bi-weekly to sustain optimal CADR delivery.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable DIY Smog Hacks: 2-Column Clean Grid */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          Evidence-Based Home Mitigation Hacks:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {plan.diyActionTips.map((tip, idx) => {
            const [title, desc] = tip.split(': ');
            return (
              <div key={idx} className="bg-slate-50/90 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">{title}</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-snug">{desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
