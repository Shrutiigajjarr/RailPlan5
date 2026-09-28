import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  X, 
  Info,
  GitPullRequest,
  Building2
} from 'lucide-react';

export const LiveToastContainer = ({ toasts = [], onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'REQUEST_CREATED':
        return <GitPullRequest className="w-4 h-4 text-[#1D4ED8]" />;
      case 'PLAN_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'INTEGRATED_BLOCK_CREATED':
      case 'INTEGRATED_BLOCK_APPROVED':
        return <Layers className="w-4 h-4 text-purple-600" />;
      case 'PLAN_GENERATED':
        return <Cpu className="w-4 h-4 text-[#1D4ED8]" />;
      case 'REQUEST_MODIFIED':
        return <Info className="w-4 h-4 text-amber-600" />;
      case 'REQUEST_DEFERRED':
      case 'REQUEST_REJECTED':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#1D4ED8]" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'PLAN_APPROVED':
        return 'border-emerald-200 bg-emerald-50/95 text-emerald-950';
      case 'REQUEST_DEFERRED':
      case 'REQUEST_REJECTED':
        return 'border-rose-200 bg-rose-50/95 text-rose-950';
      case 'PLAN_MODIFIED':
        return 'border-amber-200 bg-amber-50/95 text-amber-950';
      case 'INTEGRATED_BLOCK_CREATED':
        return 'border-purple-200 bg-purple-50/95 text-purple-950';
      default:
        return 'border-blue-200 bg-white/95 text-slate-900';
    }
  };

  return (
    <aside aria-label="System notifications" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto border rounded-xl p-3.5 shadow-lg backdrop-blur-sm transition-all duration-300 flex items-start gap-3 animate-in slide-in-from-bottom-5 ${getBorderColor(toast.type)}`}
        >
          <div className="mt-0.5 p-1 rounded-lg bg-white shadow-xs shrink-0 border border-slate-100">
            {getToastIcon(toast.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold font-mono tracking-tight text-slate-900">
                {toast.title || 'Live Sync Update'}
              </span>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              {toast.message}
            </p>

            {toast.meta && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
                {toast.meta.requestId && (
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-bold text-[#1D4ED8]">
                    {toast.meta.requestId}
                  </span>
                )}
                {toast.meta.department && (
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                    {toast.meta.department}
                  </span>
                )}
                {toast.meta.priority && (
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    (toast.meta.priority || '').toUpperCase() === 'CRITICAL' 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {toast.meta.priority}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default LiveToastContainer;
