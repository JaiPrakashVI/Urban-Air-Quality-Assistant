import React from 'react';
import { RiskAssessment, VulnerabilityProfile } from '../../types/aqi';
import { ShieldAlert, HeartPulse, CheckCircle, Stethoscope } from 'lucide-react';

interface RiskScoreCardProps {
  assessment: RiskAssessment;
  persona: VulnerabilityProfile;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ assessment, persona }) => {
  const getRiskColor = (level: RiskAssessment['riskLevel']) => {
    switch (level) {
      case 'Critical':
        return { text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', bar: 'bg-rose-500', glow: 'shadow-glow-rose' };
      case 'High':
        return { text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', bar: 'bg-orange-500', glow: 'shadow-glow-rose' };
      case 'Elevated':
        return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', bar: 'bg-amber-500', glow: 'shadow-glow-amber' };
      case 'Guarded':
        return { text: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/30', bar: 'bg-teal-500', glow: 'shadow-glow-cyan' };
      case 'Minimal':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bar: 'bg-emerald-500', glow: 'shadow-glow-emerald' };
    }
  };

  const colors = getRiskColor(assessment.riskLevel);

  return (
    <section 
      aria-labelledby="risk-score-heading"
      className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="risk-score-heading" className="text-lg font-bold text-white">
                Clinical Health Vulnerability Index
              </h2>
              <span className="text-xs text-slate-400">
                Persona: <strong className="text-slate-200">{persona.title}</strong>
              </span>
            </div>
          </div>

          <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border} ${colors.glow}`}>
            {assessment.riskLevel} Risk
          </span>
        </div>

        {/* Big Score Callout & Progress Bar */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Calculated Biological Vulnerability:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white" aria-label={`Risk score: ${assessment.riskScore} out of 100`}>
                {assessment.riskScore}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Segmented / Smooth Progress Bar */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar} ${colors.glow}`}
              style={{ width: `${Math.min(100, Math.max(5, assessment.riskScore))}%` }}
              role="progressbar"
              aria-valuenow={assessment.riskScore}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            {assessment.summary}
          </p>
        </div>

        {/* Primary Alert Banner */}
        <div className={`p-4 rounded-2xl border ${colors.bg} ${colors.border} flex items-start gap-3.5 mb-5`}>
          <ShieldAlert className={`w-5 h-5 ${colors.text} shrink-0 mt-0.5`} aria-hidden="true" />
          <div className="space-y-1">
            <div className={`text-sm font-bold ${colors.text}`}>
              {assessment.primaryAlert}
            </div>
            <div className="text-xs text-slate-300">
              Mandated Protective Respirator: <strong className="text-white underline decoration-emerald-500 underline-offset-2">{assessment.maskRecommendation}</strong>
            </div>
          </div>
        </div>

        {/* Special Clinical Protocol Banner */}
        {persona.specialMedicationReminder && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-amber-200">
              <strong className="text-amber-300 font-bold block mb-0.5">Special Medical Protocol:</strong>
              {persona.specialMedicationReminder}
            </div>
          </div>
        )}
      </div>

      {/* Actionable Health Checklist */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Immediate Actionable Precautions:
        </h3>
        <ul className="space-y-2">
          {assessment.clinicalActions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span className="leading-relaxed">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
