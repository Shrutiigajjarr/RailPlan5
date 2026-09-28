import React, { useState } from 'react';
import { 
  Train, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Info,
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { analyzeTrainImpact } from '../../utils/trainImpactAnalyzer';

export const TrainImpactAnalysisCard = ({ 
  proposedBlock, 
  trains = [], 
  availableBlocks = [],
  onSelectAlternativeWindow = null,
  showTitle = true
}) => {
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (!proposedBlock || !proposedBlock.section || !proposedBlock.start || !proposedBlock.end) {
    return null;
  }

  // Rerun Train Impact Analysis for the current proposed block window
  const impactReport = analyzeTrainImpact(proposedBlock, trains, availableBlocks);
  const { 
    section, 
    blockWindow, 
    totalTrainsOnSection, 
    affectedTrainsCount, 
    affectedTrains, 
    reschedulingRecommendations = [],
    totalEstimatedDelayMinutes, 
    delaysWithMissingDataCount, 
    alternativeBlockWindows, 
    hasConflicts, 
    summaryMessage 
  } = impactReport;

  const feasibleReschedulesCount = reschedulingRecommendations.filter(r => r.isRescheduleFeasible).length;

  return (
    <div className={`rounded-2xl p-5 border-2 shadow-sm space-y-4 transition-all ${
      hasConflicts 
        ? 'bg-amber-50/40 border-amber-300' 
        : 'bg-emerald-50/40 border-emerald-300'
    }`}>
      
      {/* Header Row */}
      {showTitle && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3.5 border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              hasConflicts 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}>
              <Train className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Train Impact & Rescheduling Analysis</h3>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">COA Block Approval Workflow</span>
              </div>
              <p className="text-xs text-slate-500">
                Corridor Section: <span className="font-semibold text-slate-800">{section}</span> • Window: <span className="font-mono text-[#1D4ED8] font-bold">{blockWindow}</span>
              </p>
            </div>
          </div>

          {/* Conflict Summary Badge */}
          <div>
            {hasConflicts ? (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>{affectedTrainsCount} TRAIN CONFLICT(S) DETECTED</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ZERO TRAIN CONFLICTS</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Overview Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[10px]">Trains on Section</span>
          <span className="text-base font-extrabold text-slate-900">{totalTrainsOnSection} Services</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[10px]">Conflicting Movements</span>
          <span className={`text-base font-extrabold ${hasConflicts ? 'text-amber-600' : 'text-emerald-600'}`}>
            {affectedTrainsCount} Trains
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[10px]">Automatic Reschedules</span>
          <span className="text-base font-extrabold text-indigo-700">
            {feasibleReschedulesCount}/{affectedTrainsCount} Feasible
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[10px]">Alternative Clear Windows</span>
          <span className="text-base font-extrabold text-purple-700">
            {alternativeBlockWindows.length} Slots
          </span>
        </div>
      </div>

      {/* Summary Message */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>Operational Impact & Rescheduling Summary:</span>
        </div>
        <p className="text-slate-700 leading-relaxed font-sans">
          {summaryMessage}
        </p>
      </div>

      {/* Affected Train Details & Automatic Rescheduling Recommendations */}
      {hasConflicts && (
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Train Impact Analysis & Rescheduling Recommendations</span>
            </span>
            <span className="text-[10px] text-amber-700 font-normal">Auto-Sequenced with 5m Headway</span>
          </div>

          <div className="space-y-3">
            {affectedTrains.map((item, idx) => {
              const recom = reschedulingRecommendations.find(r => r.trainId === item.trainId);
              return (
                <div 
                  key={idx} 
                  className="bg-white border-2 border-amber-200 rounded-xl p-4 space-y-3 shadow-xs hover:border-amber-400 transition-colors"
                >
                  {/* Train Top Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 font-mono">
                      <Train className="w-4 h-4 text-[#1D4ED8]" />
                      <span className="font-extrabold text-slate-900 text-sm">Train #{item.trainNo}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 text-xs">{item.trainName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px] font-mono">Section: <strong className="text-slate-800">{item.section}</strong></span>
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[10px] font-mono font-bold">
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  {/* Impact Breakdown Cards (Conflict, Delay, Recommendation) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    
                    {/* 1. DETECTED CONFLICT */}
                    <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-900">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>DETECTED CONFLICT</span>
                        </span>
                        <span className="text-[10px] bg-amber-200 px-1.5 py-0.2 rounded text-amber-900 uppercase">
                          {item.detectedConflict.severity} Severity
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                        {item.detectedConflict.description}
                      </p>
                      <div className="font-mono text-[10px] text-amber-800 pt-1">
                        Scheduled Window: <strong>{item.scheduledWindow}</strong> vs Block: <strong>{item.conflictingBlockWindow}</strong>
                      </div>
                    </div>

                    {/* 2. AUTOMATIC RESCHEDULING RECOMMENDATION */}
                    <div className={`p-3 rounded-lg border space-y-1.5 ${
                      recom?.isRescheduleFeasible
                        ? 'bg-indigo-50/70 border-indigo-200'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}>
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                        <span className={`flex items-center gap-1 ${
                          recom?.isRescheduleFeasible ? 'text-indigo-900' : 'text-rose-900'
                        }`}>
                          <RefreshCw className={`w-3.5 h-3.5 ${recom?.isRescheduleFeasible ? 'text-indigo-600' : 'text-rose-600'}`} />
                          <span>SUGGESTED REVISED TIME</span>
                        </span>

                        {recom?.isRescheduleFeasible ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>FEASIBLE (+{recom.estimatedDelayMinutes}m)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-200 text-rose-900 border border-rose-300 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>UNFEASIBLE</span>
                          </span>
                        )}
                      </div>

                      {/* Original vs Suggested Timing */}
                      <div className="font-mono text-[11px] grid grid-cols-2 gap-1 bg-white p-2 rounded border border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Original Time</span>
                          <span className="font-bold text-slate-800">{item.scheduledWindow}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Suggested Revised</span>
                          <span className={`font-bold ${recom?.isRescheduleFeasible ? 'text-indigo-700' : 'text-rose-700'}`}>
                            {recom?.suggestedRevisedWindow || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Explanation Reason */}
                      <p className={`text-[11px] leading-relaxed font-sans ${
                        recom?.isRescheduleFeasible ? 'text-indigo-950' : 'text-rose-950'
                      }`}>
                        <strong>Reason:</strong> {recom?.reason || item.delayAnalysis.delayExplanation}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alternative Block Windows Section */}
      {alternativeBlockWindows && alternativeBlockWindows.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Layers className="w-4 h-4 text-[#1D4ED8]" />
              <span>Alternative Maintenance Block Windows (Zero Train Conflicts):</span>
            </div>

            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="text-[#1D4ED8] hover:text-[#1E40AF] font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{showAlternatives ? 'Hide Alternatives' : `View ${alternativeBlockWindows.length} Alternative Slots`}</span>
              {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showAlternatives && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-mono text-xs animate-in fade-in">
              {alternativeBlockWindows.map((alt, altIdx) => (
                <div 
                  key={altIdx} 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 hover:border-blue-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{alt.blockId}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        Zero Conflict
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-[#1D4ED8] mt-1">
                      {alt.alternativeStart} – {alt.alternativeEnd} ({alt.durationMinutes}m)
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans mt-1">
                      {alt.explanation}
                    </p>
                  </div>

                  {onSelectAlternativeWindow && (
                    <button
                      onClick={() => onSelectAlternativeWindow(alt)}
                      className="w-full mt-2 py-1.5 px-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Switch to this Window</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default TrainImpactAnalysisCard;

