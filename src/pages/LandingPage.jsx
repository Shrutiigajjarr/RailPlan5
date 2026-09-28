import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Train,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Building2,
  GitPullRequest,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'engineering',
      name: 'Engineering Department',
      subtitle: 'P-Way, Track Maintenance & Civil Assets',
      path: '/engineering/login',
      demoUser: 'engineering_demo',
      badge: 'MAINTENANCE DEPT'
    },
    {
      id: 's-and-t',
      name: 'Signal & Telecommunication',
      subtitle: 'Electronic Interlocking, Points & OFC',
      path: '/s-and-t/login',
      demoUser: 'st_demo',
      badge: 'MAINTENANCE DEPT'
    },
    {
      id: 'traction',
      name: 'Traction Distribution',
      subtitle: '25kV Overhead Equipment & Sub-stations',
      path: '/traction/login',
      demoUser: 'traction_demo',
      badge: 'MAINTENANCE DEPT'
    },
    {
      id: 'control',
      name: 'Central Planning & Control',
      subtitle: 'Divisional Corridor Planning Engine',
      path: '/control/login',
      demoUser: 'control_demo',
      badge: 'CENTRAL COORDINATION'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#1D4ED8] selection:text-white">

      {/* Top Govt Strip */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-500 font-mono">WESTERN RAILWAY • AHMEDABAD DIVISION</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full bg-[#F6F8FB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] flex items-center justify-center shadow-sm">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-slate-900 flex items-center gap-2">
              RailPlan
            </h1>
            <p className="text-xs text-slate-500">Railway Maintenance Planning & Coordination System</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/control/login')}
          className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Cpu className="w-4 h-4" />
          <span>Access Central Planning</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-14 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Multi-Department Railway Maintenance Coordination</span>
        </div>

        <h2 className="text-6xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          RailPlan  <br />
          <span className="text-[#333399]">
            Better Coordination | Fewer Disruptions | Smoother Trains.
          </span>
        </h2>

        <p className="mt-4 text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Unifying Engineering, Signal & Telecommunication (S&T), and Traction Distribution departments with Central Control through deterministic constraint planning and real-time schedule propagation.
        </p>
      </section>

      {/* Four Separate Login Access Portals */}
      <section className="py-8 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#1D4ED8]">Departmental Access</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">Portals For Authentication</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {portals.map(portal => (
            <div
              key={portal.id}
              onClick={() => navigate(portal.path)}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#1D4ED8] p-6 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono bg-slate-50 text-slate-600 border-slate-200">
                    {portal.badge}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <h4 className="font-bold text-slate-900 text-base group-hover:text-[#1D4ED8] transition-colors">
                  {portal.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{portal.subtitle}</p>

                <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-500">
                  User ID: <span className="text-[#1D4ED8] font-bold">{portal.demoUser}</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#1D4ED8] font-semibold">
                <span>{portal.id === 'control' ? 'Access Planning System' : 'Access Portal'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complete Request Lifecycle */}
      <section className="py-12 bg-slate-50 border-y border-slate-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600">Operational Workflow</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">End-to-End Decision Flow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Department Submission',
                desc: 'Engineering, S&T, or Traction departments submit requirements with corridor sections, resources, and deadlines.',
                icon: GitPullRequest,
                color: 'border-blue-200 text-blue-600'
              },
              {
                step: '02',
                title: 'Central Registration',
                desc: 'Request is registered in shared divisional state and appears in Central Control planning queue.',
                icon: Layers,
                color: 'border-teal-200 text-teal-600'
              },
              {
                step: '03',
                title: 'Planning Engine',
                desc: 'Evaluates priority sorting, train movements, block constraints, and resource availability with deterministic rules.',
                icon: Cpu,
                color: 'border-purple-200 text-purple-600'
              },
              {
                step: '04',
                title: 'Decision Dispatched',
                desc: 'Central Control approves, modifies, defers, or rejects. Final decision and block slot return to department.',
                icon: CheckCircle2,
                color: 'border-emerald-200 text-emerald-600'
              }
            ].map((item, i) => {
              const IconComp = item.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl relative shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-extrabold font-mono text-slate-300">{item.step}</span>
                    <div className={`p-2 rounded-xl bg-slate-50 border ${item.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer with subtle synthetic data disclosure */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-[#1D4ED8]" />
            <span className="font-mono text-slate-700 font-bold">RailPlan</span>
            <span>• Railway Maintenance Planning System</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Western Railway • Ahmedabad Division • <span className="italic">Synthetic operational data for demonstration</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
