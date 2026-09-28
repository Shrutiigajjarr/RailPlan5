import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRailPlan, PERSONAS } from '../../context/RailPlanContext';
import { Train, ShieldCheck, ArrowRight, Building2, Cpu, Lock, User, ShieldAlert } from 'lucide-react';

const PORTAL_CONFIG = {
  engineering: {
    personaKey: 'engineering',
    systemName: 'RailPlan',
    departmentLabel: 'ENGINEERING DEPARTMENT',
    portalSubtitle: 'Railway Maintenance Planning System',
    expectedUsername: 'engineering_demo',
    redirectPath: '/engineering',
    themeColor: 'blue',
    icon: Building2,
    badge: 'P-WAY & CIVIL INFRASTRUCTURE'
  },
  's-and-t': {
    personaKey: 's-and-t',
    systemName: 'RailPlan',
    departmentLabel: 'SIGNAL & TELECOMMUNICATION',
    portalSubtitle: 'Railway Maintenance Planning System',
    expectedUsername: 'st_demo',
    redirectPath: '/s-and-t',
    themeColor: 'teal',
    icon: Building2,
    badge: 'ELECTRONIC INTERLOCKING & TELECOM'
  },
  traction: {
    personaKey: 'traction',
    systemName: 'RailPlan',
    departmentLabel: 'TRACTION DISTRIBUTION',
    portalSubtitle: 'Railway Maintenance Planning System',
    expectedUsername: 'traction_demo',
    redirectPath: '/traction',
    themeColor: 'amber',
    icon: Building2,
    badge: '25kV OVERHEAD ELECTRIFICATION'
  },
  control: {
    personaKey: 'control',
    systemName: 'RailPlan',
    departmentLabel: 'CENTRAL PLANNING & CONTROL',
    portalSubtitle: 'Railway Maintenance Planning & Coordination System',
    expectedUsername: 'control_demo',
    redirectPath: '/control',
    themeColor: 'purple',
    icon: Cpu,
    badge: 'DIVISIONAL CORRIDOR COMMAND'
  }
};

export const DepartmentLoginPage = ({ portalType = 'engineering' }) => {
  const navigate = useNavigate();
  const { login } = useRailPlan();
  
  const config = PORTAL_CONFIG[portalType] || PORTAL_CONFIG.engineering;
  const persona = PERSONAS[config.personaKey];

  const [username, setUsername] = useState(config.expectedUsername);
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    login(config.personaKey);
    navigate(config.redirectPath, { replace: true });
  };

  const getBorderColor = () => {
    switch (config.themeColor) {
      case 'teal': return 'border-teal-200';
      case 'amber': return 'border-amber-200';
      case 'purple': return 'border-purple-200';
      default: return 'border-blue-200';
    }
  };

  const getButtonColor = () => {
    switch (config.themeColor) {
      case 'teal': return 'bg-teal-600 hover:bg-teal-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      default: return 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex flex-col justify-between font-sans antialiased selection:bg-[#1D4ED8] selection:text-white">
      
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span className="font-semibold text-slate-700 tracking-wide">
            GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-500 font-mono hidden sm:inline">WESTERN RAILWAY • AHMEDABAD DIVISION</span>
        </div>
        <Link to="/" className="text-xs text-[#1D4ED8] hover:text-[#1E40AF] font-mono font-bold transition-colors">
          ← Portal Directory
        </Link>
      </div>

      {/* Main Login Box */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md bg-white border ${getBorderColor()} rounded-2xl shadow-lg overflow-hidden`}>
          
          {/* Card Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Train className="w-6 h-6 text-white" />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 mb-2 inline-block">
              {config.badge}
            </span>

            <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {config.systemName}
            </h1>

            <h2 className="text-sm font-extrabold tracking-widest text-slate-700 uppercase mt-1">
              {config.departmentLabel}
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              {config.portalSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Username</span>
              </label>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Password</span>
              </label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl ${getButtonColor()} font-bold text-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer shadow-sm`}
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Small helper info */}
            <div className="pt-2 text-center text-[11px] text-slate-500">
              <span>Authorized personnel: </span>
              <span className="font-semibold text-slate-700">{persona.name}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">({persona.title})</span>
            </div>
          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 font-mono">
        Western Railway • Railway Maintenance Planning & Coordination System
      </div>
    </div>
  );
};

export default DepartmentLoginPage;
