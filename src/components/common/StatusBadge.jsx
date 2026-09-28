import React from 'react';
import { 
  FileText, 
  Search, 
  AlertTriangle, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  PauseCircle, 
  XCircle 
} from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = (statusStr) => {
    switch (statusStr) {
      case 'Submitted':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: FileText,
          label: 'Submitted'
        };
      case 'Under Review':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Search,
          label: 'Under Review'
        };
      case 'Conflict Detected':
        return {
          bg: 'bg-red-50 text-[#B91C1C] border-red-200',
          icon: AlertTriangle,
          label: 'Conflict Detected'
        };
      case 'Recommendation Generated':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: Cpu,
          label: 'Recommendation Ready'
        };
      case 'Pending Approval':
        return {
          bg: 'bg-blue-50 text-[#1D4ED8] border-blue-200',
          icon: Clock,
          label: 'Pending Approval'
        };
      case 'Approved':
        return {
          bg: 'bg-emerald-50 text-[#15803D] border-emerald-200 font-bold',
          icon: CheckCircle2,
          label: 'Approved'
        };
      case 'Modified':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: Edit3,
          label: 'Schedule Modified'
        };
      case 'Deferred':
        return {
          bg: 'bg-orange-50 text-[#B45309] border-orange-200',
          icon: PauseCircle,
          label: 'Deferred'
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-[#B91C1C] border-rose-200',
          icon: XCircle,
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: FileText,
          label: statusStr || 'Draft'
        };
    }
  };

  const config = getBadgeConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg}`}>
      <IconComponent className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
