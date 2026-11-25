import React from 'react';
import { RiskAssessment, VulnerabilityProfile } from '../../types/aqi';
import { ShieldAlert, HeartPulse, CheckCircle2, Stethoscope, Shield, Wind } from 'lucide-react';

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
      className="glass-card rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="risk-score-heading" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Biological Vulnerability Index
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Active Profile: <strong className="text-slate-700 dark:text-slate-200">{persona.title}</strong>
              </span>
            </div>
          </div>

          <span className={`text-xs font-black px-3 py-1 rounded-full border uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
            {assessment.riskLevel} Risk
          </span>
        </div>

        {/* Score Callout & Progress Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/5 mb-4">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              Personalized Inhalation Burden:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white" aria-label={`Risk score: ${assessment.riskScore} out of 100`}>
                {assessment.riskScore}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
              style={{ width: `${Math.min(100, Math.max(5, assessment.riskScore))}%` }}
              role="progressbar"
              aria-valuenow={assessment.riskScore}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
            {assessment.summary}
          </p>
        </div>

        {/* 3 Metric Stat Tiles */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-slate-400 mb-0.5">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Respirator</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              {assessment.maskRecommendation.split('/')[0].trim()}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-slate-400 mb-0.5">
              <HeartPulse className="w-3 h-3 text-rose-500" />
              <span>Bio Intake</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              {persona.baselineMultiplier}x Normal
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-slate-400 mb-0.5">
              <Wind className="w-3 h-3 text-cyan-500" />
              <span>Safe Ceiling</span>
            </div>
            <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              AQI ≤ {persona.maxSafeAqi}
            </div>
          </div>
        </div>

        {/* Primary Alert Banner */}
        <div className={`p-3.5 rounded-xl border ${colors.bg} ${colors.border} flex items-start gap-3 mb-4`}>
          <ShieldAlert className={`w-4 h-4 ${colors.text} shrink-0 mt-0.5`} aria-hidden="true" />
          <div className="text-xs">
            <strong className={`block font-bold ${colors.text}`}>
              {assessment.primaryAlert}
            </strong>
          </div>
        </div>

        {/* Medication Banner */}
        {persona.specialMedicationReminder && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start gap-2.5">
            <Stethoscope className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
              <strong className="text-amber-800 dark:text-amber-300 font-bold block mb-0.5">Clinical Protocol:</strong>
              {persona.specialMedicationReminder}
            </div>
          </div>
        )}
      </div>

      {/* Concise Clinical Action Bullets */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Immediate Actionable Precautions:
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {assessment.clinicalActions.map((action, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
