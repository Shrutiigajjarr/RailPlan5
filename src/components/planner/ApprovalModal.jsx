import React, { useState } from 'react';
import { X, Edit3, PauseCircle, XCircle, CheckCircle2, Clock } from 'lucide-react';
import { calculateDurationMinutes, formatDurationString } from '../../utils/dateUtils';
import { useRailPlan } from '../../context/RailPlanContext';
import TrainImpactAnalysisCard from './TrainImpactAnalysisCard';

export const ApprovalModal = ({ request, type, onClose, onSubmit }) => {
  const { trains, availableBlocks } = useRailPlan();
  const isModify = type === 'modify';
  const isDefer = type === 'defer';
  const isReject = type === 'reject';

  const defaultStart = request.recommendation?.recommendedStart || request.requestedStart || '13:00';
  const defaultEnd = request.recommendation?.recommendedEnd || request.requestedEnd || '15:00';
  const defaultDate = request.recommendation?.recommendedDate || request.requestedDate || '2026-08-31';
  const defaultBlock = request.recommendation?.recommendedBlockId || 'MB-204';

  const [approvedDate, setApprovedDate] = useState(defaultDate);
  const [approvedStart, setApprovedStart] = useState(defaultStart);
  const [approvedEnd, setApprovedEnd] = useState(defaultEnd);
  const [approvedBlockId, setApprovedBlockId] = useState(defaultBlock);
  const [reason, setReason] = useState(
    isModify 
      ? 'Modified schedule to clear passenger corridor overlap and align with section maintenance window.' 
      : isDefer 
      ? 'Deferred to next cycle due to heavy freight corridor saturation.' 
      : 'Rejected due to unresolvable train movement conflict during peak daylight hours.'
  );

  const duration = calculateDurationMinutes(approvedStart, approvedEnd);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isModify) {
      onSubmit({ approvedDate, approvedStart, approvedEnd, approvedBlockId, reason });
    } else {
      onSubmit({ reason });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              isModify ? 'bg-sky-50 text-[#0369A1] border-sky-200' :
              isDefer ? 'bg-orange-50 text-[#B45309] border-orange-200' :
              'bg-rose-50 text-[#B91C1C] border-rose-200'
            }`}>
              {isModify && <Edit3 className="w-5 h-5" />}
              {isDefer && <PauseCircle className="w-5 h-5" />}
              {isReject && <XCircle className="w-5 h-5" />}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isModify && 'Modify Maintenance Schedule'}
                {isDefer && 'Defer Maintenance Request'}
                {isReject && 'Reject Maintenance Request'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Request ID: {request.id} ({request.department})</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Modify Window Controls */}
          {isModify && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-[#0369A1] mb-1">Set Approved Schedule Parameters</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Approved Date</label>
                  <input 
                    type="date"
                    value={approvedDate}
                    onChange={(e) => setApprovedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 shadow-sm rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Block ID</label>
                  <input 
                    type="text"
                    value={approvedBlockId}
                    onChange={(e) => setApprovedBlockId(e.target.value)}
                    className="w-full bg-white border border-slate-300 shadow-sm rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Approved Start Time</label>
                  <input 
                    type="time"
                    value={approvedStart}
                    onChange={(e) => setApprovedStart(e.target.value)}
                    className="w-full bg-white border border-slate-300 shadow-sm rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Approved End Time</label>
                  <input 
                    type="time"
                    value={approvedEnd}
                    onChange={(e) => setApprovedEnd(e.target.value)}
                    className="w-full bg-white border border-slate-300 shadow-sm rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-[#0369A1] font-semibold">
                  Approved Duration: {formatDurationString(duration)}
                </span>
              </div>

              {/* Rerun Train Impact Analysis Live for Updated Window */}
              <div className="pt-2">
                <TrainImpactAnalysisCard
                  proposedBlock={{
                    section: request.section,
                    start: approvedStart,
                    end: approvedEnd,
                    date: approvedDate,
                    blockId: approvedBlockId
                  }}
                  trains={trains}
                  availableBlocks={availableBlocks}
                  showTitle={false}
                  onSelectAlternativeWindow={(alt) => {
                    setApprovedStart(alt.alternativeStart);
                    setApprovedEnd(alt.alternativeEnd);
                    setApprovedBlockId(alt.blockId);
                  }}
                />
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Central Control Official Remarks & Reason (Dispatched to {request.department})
            </label>
            <textarea 
              rows="3"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-slate-300 shadow-sm rounded-xl p-3 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 shadow-sm text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                isModify ? 'bg-[#0369A1] hover:bg-[#075985]' :
                isDefer ? 'bg-[#B45309] hover:bg-[#92400E]' :
                'bg-[#B91C1C] hover:bg-[#991B1B]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm {isModify ? 'Modification' : isDefer ? 'Deferral' : 'Rejection'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ApprovalModal;
