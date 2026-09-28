import React, { useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Layers, 
  Clock, 
  ArrowRight, 
  X, 
  Info, 
  Building2, 
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export const IntegratedBlockSuccessModal = ({ 
  isOpen, 
  block, 
  onClose, 
  onReview, 
  onCreateAnother 
}) => {
  const primaryButtonRef = useRef(null);

  // Focus primary button when modal opens & handle Escape key
  useEffect(() => {
    if (isOpen) {
      if (primaryButtonRef.current) {
        primaryButtonRef.current.focus();
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !block) return null;

  const activities = block.activities || (block.requests || []).map(r => ({
    requestId: r.id,
    department: r.department,
    maintenanceType: r.maintenanceType || r.title,
    durationMinutes: r.estimatedDurationMinutes || 60
  }));

  const departmentsList = (block.departments || []).join(' • ');

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-desc"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden p-6 space-y-5 my-8 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-[#1D4ED8]" />
            </div>
            <div>
              <h2 id="success-modal-title" className="text-lg font-bold text-slate-900">
                Integrated Block Created
              </h2>
              <p id="success-modal-desc" className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                The selected maintenance requests have been combined into a coordinated block proposal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Key Metadata Grid */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Integrated Block</span>
              <span className="text-base font-extrabold text-[#1D4ED8]">{block.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Corridor Section</span>
              <span className="text-base font-extrabold text-slate-900">{block.section}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Maintenance Block</span>
              <span className="font-bold text-slate-800">{block.blockId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Scheduled Window</span>
              <span className="font-bold text-[#1D4ED8]">{block.start} – {block.end}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Current Status</span>
              <span className="inline-block font-sans font-bold text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                {block.status || 'Pending Approval'}
              </span>
            </div>
          </div>

          {/* Departments & Benefits */}
          <div className="space-y-1.5 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1 font-sans">
              <span className="text-slate-500">Coordinated Departments:</span>
              <span className="font-semibold text-slate-800 font-mono text-xs">{departmentsList}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="text-slate-500">Requests Combined:</span>
              <span className="font-bold text-slate-900 font-mono text-xs">{(block.requestIds || []).length}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="text-slate-500">Separate Blocks Saved:</span>
              <span className="font-bold text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {block.separateBlocksAvoided ?? ((block.requestIds || []).length - 1)} avoided
              </span>
            </div>
          </div>
        </div>

        {/* Included Requests Compact Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-700">
            Included Maintenance Activities ({activities.length})
          </h3>
          <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
            {activities.map(act => (
              <div 
                key={act.requestId}
                className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                    {act.requestId}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">{act.department}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-600">{act.maintenanceType}</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500 shrink-0">
                  {act.durationMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Process Message */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This is a generated planning proposal. It must be reviewed and approved by Central Control before the decision is sent to the departments.
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div>
            {onCreateAnother && (
              <button
                type="button"
                onClick={onCreateAnother}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Create Another Block
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              Back to Planning
            </button>

            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onReview}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Review Integrated Block</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export const IntegratedBlockErrorModal = ({ isOpen, errorReason, onClose }) => {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (closeButtonRef.current) closeButtonRef.current.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 id="error-modal-title" className="text-base font-bold text-slate-900">
              Unable to Create Integrated Block
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {errorReason || 'The selected requests or maintenance block could not be combined due to state or constraint changes.'}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            Review Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegratedBlockSuccessModal;
