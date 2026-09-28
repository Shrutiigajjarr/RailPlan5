import React, { useState } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import { RotateCcw, Check } from 'lucide-react';

export const DemoResetButton = () => {
  const { resetDemoData } = useRailPlan();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <button
      onClick={handleReset}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
        resetSuccess 
          ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600'
      }`}
      title="Reset prototype state back to default SIH demo requests"
    >
      {resetSuccess ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Demo Reset!</span>
        </>
      ) : (
        <>
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Demo Data</span>
        </>
      )}
    </button>
  );
};

export default DemoResetButton;
