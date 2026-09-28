import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Layers, Clock } from 'lucide-react';

export const ExplainableCard = ({ recommendation }) => {
  if (!recommendation) {
    return (
      <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center text-slate-500 text-xs shadow-sm">
        <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#1D4ED8]" />
        <p>RailPlan Planning Engine has not yet calculated recommendation for this request.</p>
      </div>
    );
  }

  const {
    recommendedSection,
    recommendedBlockId,
    recommendedDate,
    recommendedStart,
    recommendedEnd,
    status,
    factors,
    explanation
  } = recommendation;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-50 text-[#1D4ED8] rounded-xl border border-blue-200 shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Planning Recommendation Details</h3>
              <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                RAILPLAN PLANNING ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500">Deterministic constraint-satisfaction decision support model</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Engine Status</div>
            <div className={`text-xs font-bold font-mono ${status === 'OPTIMAL' ? 'text-emerald-700' : 'text-[#1D4ED8]'}`}>
              {status || 'EVALUATED'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Slot Callout */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 shadow-sm p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-[#1D4ED8] font-bold uppercase tracking-wider block mb-0.5">
            Recommended Maintenance Block Slot
          </span>
          <div className="text-base font-bold text-slate-900">
            Section {recommendedSection} • Block {recommendedBlockId || 'Pending'} • {recommendedDate}
          </div>
        </div>

        <div className="bg-white border border-blue-200 shadow-sm px-4 py-1.5 rounded-lg text-right font-mono">
          <span className="text-xs font-bold text-[#1D4ED8]">
            {recommendedStart} – {recommendedEnd}
          </span>
        </div>
      </div>

      {/* Factor Breakdown List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Evaluated Planning Conditions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {factors && factors.map((factor, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs shadow-sm ${
                factor.status === 'pass' 
                  ? 'bg-white border-slate-200 text-slate-700' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {factor.status === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{factor.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{factor.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Factual Rationale */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8]">
          <Zap className="w-4 h-4 text-[#1D4ED8]" />
          <span>Deterministic Planning Explanation (Why?)</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          {explanation}
        </p>
      </div>

      <div className="text-[10px] text-slate-400 text-right font-mono">
        RailPlan Deterministic Planning Engine • Indian Railways Western Division
      </div>
    </div>
  );
};

export default ExplainableCard;
