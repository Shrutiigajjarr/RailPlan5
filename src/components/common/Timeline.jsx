import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileText, Cpu, Check, X } from 'lucide-react';

export const Timeline = ({ status }) => {
  const steps = [
    { key: 'Submitted', label: 'Submitted', desc: 'Request logged by department' },
    { key: 'Under Review', label: 'Central Ingestion', desc: 'Ingested into planning pipeline' },
    { key: 'Conflict Analysis', label: 'Conflict Engine', desc: 'Train & resource overlap check' },
    { key: 'Recommendation Generated', label: 'Planning Recommendation', desc: 'Optimal block calculation' },
    { key: 'Pending Approval', label: 'Planner Review', desc: 'Awaiting human sign-off' },
    { key: 'Approved', label: 'Final Decision', desc: 'Block confirmed & dispatched' }
  ];

  // Calculate current active step index based on status
  const getActiveStepIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Conflict Detected': return 2;
      case 'Recommendation Generated': return 3;
      case 'Pending Approval': return 4;
      case 'Approved':
      case 'Modified':
      case 'Deferred':
      case 'Rejected':
        return 5;
      default: return 0;
    }
  };

  const activeIdx = getActiveStepIndex(status);

  const getStepStatus = (idx) => {
    if (status === 'Rejected' && idx === 5) return 'rejected';
    if (status === 'Deferred' && idx === 5) return 'deferred';
    if (idx < activeIdx) return 'completed';
    if (idx === activeIdx) {
      if (status === 'Conflict Detected') return 'conflict';
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connector Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-0" />
        
        {/* Active Progress Connector */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#1D4ED8] transition-all duration-500 -z-0" 
          style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const stepState = getStepStatus(idx);

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 group">
              {/* Circle Icon */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                stepState === 'completed' ? 'bg-[#15803D] border-[#15803D] text-white' :
                stepState === 'active' ? 'bg-[#1D4ED8] border-[#1E40AF] text-white ring-4 ring-blue-100' :
                stepState === 'conflict' ? 'bg-[#B91C1C] border-[#991B1B] text-white ring-4 ring-red-100 animate-pulse' :
                stepState === 'rejected' ? 'bg-[#B91C1C] border-[#991B1B] text-white' :
                stepState === 'deferred' ? 'bg-[#B45309] border-[#92400E] text-white' :
                'bg-slate-100 border-slate-300 text-slate-500'
              }`}>
                {stepState === 'completed' && <Check className="w-5 h-5" />}
                {stepState === 'active' && <Clock className="w-4 h-4 animate-spin-slow" />}
                {stepState === 'conflict' && <AlertTriangle className="w-4 h-4" />}
                {stepState === 'rejected' && <X className="w-5 h-5" />}
                {stepState === 'deferred' && <Clock className="w-5 h-5" />}
                {stepState === 'pending' && <span className="text-xs font-bold">{idx + 1}</span>}
              </div>

              {/* Step Labels */}
              <div className="mt-2 text-center max-w-[100px]">
                <div className={`text-xs font-semibold ${
                  stepState === 'active' || stepState === 'completed' ? 'text-slate-900' : 
                  stepState === 'conflict' ? 'text-[#B91C1C]' :
                  stepState === 'rejected' ? 'text-[#B91C1C]' : 'text-slate-500'
                }`}>
                  {stepState === 'rejected' && idx === 5 ? 'Rejected' :
                   stepState === 'deferred' && idx === 5 ? 'Deferred' :
                   status === 'Modified' && idx === 5 ? 'Modified' : step.label}
                </div>
                <div className="text-[10px] text-slate-500 hidden md:block mt-0.5 leading-tight">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
