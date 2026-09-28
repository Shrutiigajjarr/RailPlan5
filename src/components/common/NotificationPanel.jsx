import React from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, currentUser } = useRailPlan();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Filter notifications for current user's department or Central Control role
  const relevantNotifs = notifications.filter(n => {
    if (!currentUser) return false;
    if (currentUser.role === 'CONTROL') return true;
    return n.targetDept === currentUser.department || n.targetDept === 'All';
  });

  const unreadCount = relevantNotifs.filter(n => !n.read).length;

  const handleNotifClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.requestId) {
      if (currentUser?.role === 'CONTROL') {
        navigate(`/control/requests/${notif.requestId}`);
      } else {
        const portal = currentUser?.portalPath || '/engineering';
        navigate(`${portal}/requests?id=${notif.requestId}`);
      }
      onClose();
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'approval': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'conflict': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'modification': return <Info className="w-5 h-5 text-sky-400" />;
      case 'rejection':
      case 'deferral': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default: return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Panel Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-950 text-blue-400 rounded-lg border border-blue-800/50">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Operational Notifications</h3>
              <p className="text-xs text-slate-400">{unreadCount} unread system alert{unreadCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {relevantNotifs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No recent notifications</p>
            </div>
          ) : (
            relevantNotifs.map(notif => (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.read 
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400' 
                    : 'bg-slate-800/90 border-blue-500/40 hover:border-blue-500 text-slate-200 shadow-md ring-1 ring-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-100 truncate">{notif.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    {notif.requestId && (
                      <span className="inline-block mt-2 text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-blue-400 font-semibold">
                        {notif.requestId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
