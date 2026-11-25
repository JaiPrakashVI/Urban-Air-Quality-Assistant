import React from 'react';
import { RiskAssessment, VulnerabilityProfile } from '../../types/aqi';
import { ShieldAlert, HeartPulse, CheckCircle2, Shield, Wind } from 'lucide-react';

interface RiskScoreCardProps {
  assessment: RiskAssessment;
  persona: VulnerabilityProfile;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ assessment, persona }) => {
  const getRiskColor = (level: RiskAssessment['riskLevel']) => {
    switch (level) {
      case 'Critical':
        return { text: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/15', border: 'border-rose-200 dark:border-rose-500/30', bar: 'bg-rose-500' };
      case 'High':
        return { text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/15', border: 'border-orange-200 dark:border-orange-500/30', bar: 'bg-orange-500' };
      case 'Elevated':
        return { text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/15', border: 'border-amber-200 dark:border-amber-500/30', bar: 'bg-amber-500' };
      case 'Guarded':
        return { text: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/15', border: 'border-teal-200 dark:border-teal-500/30', bar: 'bg-teal-500' };
      case 'Minimal':
      default:
        return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/15', border: 'border-emerald-200 dark:border-emerald-500/30', bar: 'bg-emerald-500' };
    }
  };

  const colors = getRiskColor(assessment.riskLevel);

  return (
    <section 
      aria-labelledby="risk-score-heading"
      className="glass-card rounded-2xl p-5 sm:p-6 shadow-xs transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header with Title and Score Pill */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-500" aria-hidden="true" />
            <h2 id="risk-score-heading" className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Biological Risk Index
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
              {assessment.riskScore}/100 · {assessment.riskLevel}
            </span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-200/80 dark:border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
            style={{ width: `${Math.min(100, Math.max(5, assessment.riskScore))}%` }}
            role="progressbar"
            aria-valuenow={assessment.riskScore}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* 3 Metric Stat Tiles */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Respirator</span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {assessment.maskRecommendation.split('/')[0].trim()}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
              <HeartPulse className="w-3 h-3 text-rose-500" />
              <span>Bio Intake</span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {persona.baselineMultiplier}×
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
              <Wind className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Safe Ceiling</span>
            </div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              AQI ≤ {persona.maxSafeAqi}
            </div>
          </div>
        </div>

        {/* Single Integrated Alert Banner */}
        <div className={`p-3 rounded-xl border ${colors.bg} ${colors.border} flex items-start gap-2.5 mb-3.5`}>
          <ShieldAlert className={`w-4 h-4 ${colors.text} shrink-0 mt-0.5`} aria-hidden="true" />
          <div className="text-xs leading-snug">
            <strong className={`block font-semibold ${colors.text}`}>
              {assessment.primaryAlert}
            </strong>
            {persona.specialMedicationReminder && (
              <span className="text-slate-600 dark:text-slate-300 block mt-1 text-[11px]">
                {persona.specialMedicationReminder.split('.')[0]}.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Health Checklist */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Recommended Actions:
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {assessment.clinicalActions.slice(0, 3).map((action, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{action.replace(/\.$/, '')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
