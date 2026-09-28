import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Info, 
  Save, 
  Activity
} from 'lucide-react';
import { evaluatePriorityValidation, VALIDATION_STATUS, PRIORITY_LEVELS } from '../../utils/priorityValidator';
import PriorityBadge from '../common/PriorityBadge';

export const PriorityValidationCard = ({ request, onUpdateApprovedPriority, isControlOfficer = true }) => {
  if (!request) return null;

  const evaluation = evaluatePriorityValidation(request);
  const { 
    requestedPriority, 
    systemAssessedPriority, 
    approvedPriority: currentApprovedPriority, 
    validationStatus, 
    explanation, 
    evidence 
  } = evaluation;

  const [selectedApprovedPriority, setSelectedApprovedPriority] = useState(currentApprovedPriority || requestedPriority);
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateApprovedPriority) {
      onUpdateApprovedPriority(request.id, selectedApprovedPriority, officerRemarks);
      setSaveNotice(`Approved Priority updated to ${selectedApprovedPriority}.`);
      setIsEditing(false);
      setTimeout(() => setSaveNotice(null), 4000);
    }
  };

  return (
    <div className={`rounded-2xl p-5 border-2 shadow-sm space-y-4 transition-all ${
      validationStatus === VALIDATION_STATUS.MATCHED
        ? 'bg-emerald-50/40 border-emerald-300'
        : validationStatus === VALIDATION_STATUS.OVERSTATED
        ? 'bg-amber-50/50 border-amber-300'
        : 'bg-sky-50/50 border-sky-300'
    }`}>
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3.5 border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${
            validationStatus === VALIDATION_STATUS.MATCHED ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
            validationStatus === VALIDATION_STATUS.OVERSTATED ? 'bg-amber-100 text-amber-800 border-amber-300' :
            'bg-sky-100 text-sky-800 border-sky-300'
          }`}>
            {validationStatus === VALIDATION_STATUS.MATCHED && <ShieldCheck className="w-5 h-5" />}
            {validationStatus === VALIDATION_STATUS.OVERSTATED && <AlertTriangle className="w-5 h-5 text-amber-700" />}
            {validationStatus === VALIDATION_STATUS.UNDERSTATED && <Activity className="w-5 h-5 text-sky-700" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Priority Validation & Reassessment</h3>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">COA Review Workflow</span>
            </div>
            <p className="text-xs text-slate-500">
              System evaluation of requested priority against asset availability, criticality, and overdue maintenance
            </p>
          </div>
        </div>

        {/* Validation Status Badge */}
        <div>
          {validationStatus === VALIDATION_STATUS.MATCHED && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>MATCHED (VERIFIED)</span>
            </span>
          )}
          {validationStatus === VALIDATION_STATUS.OVERSTATED && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>FLAG: OVERSTATED PRIORITY</span>
            </span>
          )}
          {validationStatus === VALIDATION_STATUS.UNDERSTATED && (
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-700" />
              <span>FLAG: UNDERSTATED PRIORITY</span>
            </span>
          )}
        </div>
      </div>

      {/* Save Notification */}
      {saveNotice && (
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Three Values Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        
        {/* 1. Requested Priority */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">1. Requested Priority</span>
          <div className="flex items-center gap-2 pt-0.5">
            <PriorityBadge priority={requestedPriority} />
            <span className="text-slate-400 text-[11px]">(Department)</span>
          </div>
        </div>

        {/* 2. System-Assessed Priority */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">2. System-Assessed Priority</span>
          <div className="flex items-center gap-2 pt-0.5">
            <PriorityBadge priority={systemAssessedPriority} />
            <span className="text-slate-400 text-[11px]">(Evidence-based)</span>
          </div>
        </div>

        {/* 3. Approved Priority */}
        <div className="bg-white p-3.5 rounded-xl border-2 border-[#1D4ED8] space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#1D4ED8] block uppercase font-bold">3. Approved Priority</span>
            {isControlOfficer && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[11px] text-[#1D4ED8] hover:underline flex items-center gap-1 font-sans font-bold cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Reassess</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <PriorityBadge priority={currentApprovedPriority || requestedPriority} />
            <span className="text-slate-400 text-[11px]">(Final Approved)</span>
          </div>
        </div>
      </div>

      {/* COA Officer Reassessment Controls */}
      {isEditing && isControlOfficer && (
        <form onSubmit={handleSave} className="bg-white p-4 rounded-xl border-2 border-blue-300 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-[#1D4ED8] border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" />
              <span>COA Officer Priority Reassessment</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono font-normal">Review evidence & confirm or modify final approved priority</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(PRIORITY_LEVELS).map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedApprovedPriority(level)}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedApprovedPriority === level
                    ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{level}</span>
                {selectedApprovedPriority === level && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              COA Officer Assessment Remarks / Justification
            </label>
            <input 
              type="text"
              placeholder="e.g. Confirmed HIGH priority due to overdue track maintenance before monsoon."
              value={officerRemarks}
              onChange={(e) => setOfficerRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#1D4ED8] text-white font-bold text-xs hover:bg-[#1E40AF] flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Confirm Approved Priority</span>
            </button>
          </div>
        </form>
      )}

      {/* Explanation Box */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 font-sans">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>System Assessment Explanation:</span>
        </div>
        <p className="text-slate-700 leading-relaxed">
          {explanation}
        </p>

        {/* Evidence Parameters Grid */}
        <div className="pt-2 border-t border-slate-100 font-mono text-[11px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-slate-600">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[9px] uppercase font-sans">Asset Criticality</span>
            <strong className="text-slate-800">{evidence.assetCriticality}</strong>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[9px] uppercase font-sans">Overdue Maintenance</span>
            <strong className={evidence.overdueDays > 20 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
              {evidence.overdueDays} Days
            </strong>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[9px] uppercase font-sans">Maintenance Urgency</span>
            <strong className="text-slate-800">{evidence.maintenanceUrgency}</strong>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[9px] uppercase font-sans">Operational Impact</span>
            <strong className="text-slate-800">{evidence.operationalImpact}</strong>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[9px] uppercase font-sans">Asset Redundancy</span>
            <strong className="text-slate-800">{evidence.assetAvailability}</strong>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PriorityValidationCard;
