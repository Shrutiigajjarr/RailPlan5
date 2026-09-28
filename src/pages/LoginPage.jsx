import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRailPlan } from '../context/RailPlanContext';
import { Train, ShieldCheck, Key, ArrowRight, Building2, Cpu, Check } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { switchUser, personas } = useRailPlan();
  const [selectedPersona, setSelectedPersona] = useState('engineering');
  const [division, setDivision] = useState('Ahmedabad (ADI)');
  const [password, setPassword] = useState('demo123');

  const handleLogin = (e) => {
    e.preventDefault();
    switchUser(selectedPersona);
    if (selectedPersona === 'planner') {
      navigate('/planner/dashboard');
    } else {
      navigate('/department/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
        </span>
        <span className="font-mono text-emerald-400">SIH 2026 OFFICIAL PROTOTYPE</span>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-6 bg-slate-950/80 border-b border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-900/40">
              <Train className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold font-mono text-white">RailPlan Portal Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">Railway Maintenance Planning & Coordination System</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-6">
            
            {/* Quick Demo Persona Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Persona Account (Demo Credentials)
              </label>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(personas).map(([key, p]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPersona(key)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      selectedPersona === key
                        ? 'bg-blue-950/90 border-blue-500 text-white ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {p.role === 'PLANNER' ? <Cpu className="w-4 h-4 text-purple-400" /> : <Building2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-100">{p.department}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email & Role display */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address</label>
                <input 
                  type="email"
                  readOnly
                  value={personas[selectedPersona].email}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Railway Division</label>
                  <select 
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option>Ahmedabad (ADI)</option>
                    <option>Vadodara (BRC)</option>
                    <option>Mumbai Central (BCT)</option>
                    <option>Rajkot (RJT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sign in CTA */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Access {personas[selectedPersona].department} Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        Western Railway • Centralized Railway Maintenance System
      </div>
    </div>
  );
};

export default LoginPage;
