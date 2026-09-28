import React from 'react';
import { AlertCircle, ShieldAlert, Clock, ArrowDown, HelpCircle } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const getConfig = (p) => {
    if (p === null || p === undefined || p === '') {
      return {
        bg: 'bg-slate-100 text-slate-500 border-slate-300',
        icon: HelpCircle,
        label: 'NOT SET'
      };
    }

    const norm = String(p).toUpperCase().trim();
    switch (norm) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 text-[#B91C1C] border-red-200',
          icon: ShieldAlert,
          label: 'CRITICAL'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-50 text-[#B45309] border-amber-200',
          icon: AlertCircle,
          label: 'HIGH'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-blue-50 text-[#1D4ED8] border-blue-200',
          icon: Clock,
          label: 'MEDIUM'
        };
      case 'LOW':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: ArrowDown,
          label: 'LOW'
        };
      default:
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: HelpCircle,
          label: norm
        };
    }
  };

  const config = getConfig(priority);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border tracking-wider ${config.bg}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default PriorityBadge;

