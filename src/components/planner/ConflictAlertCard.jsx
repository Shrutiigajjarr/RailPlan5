import React from 'react';
import { AlertOctagon, Train, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export const ConflictAlertCard = ({ conflicts = [] }) => {
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
        <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold block">No Operational Conflicts Detected</span>
          Requested corridor slot is clear of train schedule overlaps and adjacent maintenance activities.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#92400E] font-bold text-sm">
          <AlertOctagon className="w-5 h-5 text-[#B45309] animate-pulse" />
          <span>Operational Conflict Detected ({conflicts.length})</span>
        </div>
        <span className="bg-white text-[#B45309] text-[10px] px-2 py-0.5 rounded border border-amber-300 font-mono font-bold shadow-sm">
          REQUIRES PLANNER ATTENTION
        </span>
      </div>

      <div className="space-y-2">
        {conflicts.map((conflict, idx) => (
          <div key={idx} className="bg-white border border-amber-200 p-3 rounded-xl text-xs space-y-1 shadow-sm">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-amber-900 flex items-center gap-1.5">
                <Train className="w-4 h-4 text-amber-600" />
                {conflict.type}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                conflict.severity === 'High' ? 'bg-red-50 text-[#B91C1C] border border-red-200' : 'bg-amber-100 text-amber-800'
              }`}>
                {conflict.severity} Severity
              </span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              {conflict.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConflictAlertCard;
