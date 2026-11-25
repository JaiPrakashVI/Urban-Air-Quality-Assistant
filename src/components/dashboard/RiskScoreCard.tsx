import React from 'react';
import { RiskAssessment, VulnerabilityProfile } from '../../types/aqi';
import { ShieldAlert, HeartPulse, CheckCircle, Info } from 'lucide-react';

interface RiskScoreCardProps {
  assessment: RiskAssessment;
  persona: VulnerabilityProfile;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ assessment, persona }) => {
  const getRiskColor = (level: RiskAssessment['riskLevel']) => {
    switch (level) {
      case 'Critical':
        return { text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', bar: 'bg-rose-500' };
      case 'High':
        return { text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', bar: 'bg-orange-500' };
      case 'Elevated':
        return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', bar: 'bg-amber-500' };
      case 'Guarded':
        return { text: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/30', bar: 'bg-teal-500' };
      case 'Minimal':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bar: 'bg-emerald-500' };
    }
  };

  const colors = getRiskColor(assessment.riskLevel);

  return (
    <section 
      aria-labelledby="risk-score-heading"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-400" aria-hidden="true" />
          <h2 id="risk-score-heading" className="text-lg font-bold text-white">
            Personal Health Vulnerability Index
          </h2>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
          {assessment.riskLevel} Risk
        </span>
      </div>

      {/* Score Meter & Bar */}
      <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-semibold text-slate-300">
            Biological Vulnerability Exposure:
          </span>
          <span className="text-2xl font-black text-white" aria-label={`Score: ${assessment.riskScore} out of 100`}>
            {assessment.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
            style={{ width: `${Math.min(100, Math.max(5, assessment.riskScore))}%` }}
            role="progressbar"
            aria-valuenow={assessment.riskScore}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <p className="text-xs text-slate-400 mt-2">
          {assessment.summary}
        </p>
      </div>

      {/* Primary Alert Banner */}
      <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border} flex items-start gap-3 mb-5`}>
        <ShieldAlert className={`w-5 h-5 ${colors.text} shrink-0 mt-0.5`} aria-hidden="true" />
        <div>
          <div className={`text-sm font-bold ${colors.text}`}>
            {assessment.primaryAlert}
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Certified Mask Requirement: <strong className="text-white underline decoration-emerald-500">{assessment.maskRecommendation}</strong>
          </div>
        </div>
      </div>

      {/* Special Medical Precaution (if present) */}
      {persona.specialMedicationReminder && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-amber-200 font-medium">
            <strong className="text-amber-300 block mb-0.5">Clinical Protocol Alert:</strong>
            {persona.specialMedicationReminder}
          </div>
        </div>
      )}

      {/* Actionable Health Checklist */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Tailored Mitigation Checklist for Today:
        </h3>
        <ul className="space-y-2">
          {assessment.clinicalActions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
