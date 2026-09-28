import React, { useState, useEffect } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import { formatISTDateTime } from '../../utils/dateUtils';
import NotificationPanel from '../common/NotificationPanel';
import { 
  Train, 
  Bell, 
  ChevronDown, 
  Shield, 
  Building2, 
  Cpu, 
  Clock, 
  LogOut,
  User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const { currentUser, notifications, logout } = useRailPlan();
  const [timeStr, setTimeStr] = useState(formatISTDateTime());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTimeStr(formatISTDateTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifs = notifications.filter(n => {
    if (!currentUser) return false;
    if (currentUser.role === 'CONTROL') return !n.read;
    return (n.targetDept === currentUser.department || n.targetDept === 'All') && !n.read;
  }).length;

  const handleLogout = () => {
    const currentDept = currentUser?.department;
    logout();
    if (currentDept === 'Engineering') navigate('/engineering/login');
    else if (currentDept === 'S&T') navigate('/s-and-t/login');
    else if (currentDept === 'Traction Distribution') navigate('/traction/login');
    else navigate('/control/login');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-sm">
        {/* Top Government Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              INDIAN RAILWAYS • WESTERN RAILWAY (AHMEDABAD DIVISION)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-slate-600 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo & Platform Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              if (currentUser?.role === 'CONTROL') navigate('/control');
              else if (currentUser?.department === 'Engineering') navigate('/engineering');
              else if (currentUser?.department === 'S&T') navigate('/s-and-t');
              else if (currentUser?.department === 'Traction Distribution') navigate('/traction');
              else navigate('/');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center shadow-sm">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-mono">RailPlan</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                  currentUser?.role === 'CONTROL' 
                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                    : 'bg-blue-50 text-[#1D4ED8] border-blue-200'
                }`}>
                  {currentUser?.department ? currentUser.department.toUpperCase() : 'PORTAL'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Railway Maintenance Planning & Coordination System
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Current User Profile & Logout */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'CONTROL' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-blue-100 text-[#1D4ED8] border-blue-200'
                  }`}>
                    {currentUser.role === 'CONTROL' ? <Cpu className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>

                  <div className="hidden sm:block min-w-[120px]">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>{currentUser.department}</span>
                    </div>
                  </div>

                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in">
                    <div className="p-3 bg-slate-50">
                      <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500">{currentUser.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">{currentUser.division}</div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-red-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

export default Header;
