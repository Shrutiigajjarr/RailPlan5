import React from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  ListFilter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Eye, 
  Building2, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

export const PlannerDashboard = () => {
  const { requests, currentUser, generatePlan } = useRailPlan();
  const navigate = useNavigate();

  const totalCount = requests.length;
  const incomingCount = requests.filter(r => r.status === 'Submitted').length;
  const underReviewCount = requests.filter(r => r.status === 'Under Review' || r.status === 'Submitted').length;
  const criticalCount = requests.filter(r => (r.priority || '').toUpperCase() === 'CRITICAL').length;
  const conflictCount = requests.filter(r => r.status === 'Conflict Detected').length;
  const pendingCount = requests.filter(r => r.status === 'Pending Approval' || r.status === 'Recommendation Generated').length;
  const approvedCount = requests.filter(r => r.status === 'Approved' || r.status === 'Modified').length;

  const engCount = requests.filter(r => r.department === 'Engineering').length;
  const stCount = requests.filter(r => r.department === 'S&T').length;
  const trdCount = requests.filter(r => r.department === 'Traction Distribution').length;

  const criticalRequests = requests.filter(r => (r.priority || '').toUpperCase() === 'CRITICAL' && r.status !== 'Approved');
  const recentIncoming = requests.slice(0, 6);
  const upcomingApproved = requests.filter(r => r.status === 'Approved' || r.status === 'Modified').slice(0, 4);

  const handleQuickGenerate = () => {
    generatePlan();
    navigate('/control/planning');
  };

  return (
    <Layout>
      {/* Command Center Banner */}
      <div className="bg-[#12345B] border border-[#12345B] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-200 font-mono text-xs font-semibold mb-1">
            <Cpu className="w-4 h-4" />
            <span>CENTRAL CONTROL & PLANNING COMMAND CENTER</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Maintenance Coordination System
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            {currentUser?.name || 'R. K. Verma'} ({currentUser?.title || 'CTPM'}) • Western Railway Headquarters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickGenerate}
            className="px-5 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Cpu className="w-4 h-4" />
            <span>Generate Planning Engine Slot</span>
          </button>
        </div>
      </div>

      {/* Operational Calculated KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1.5">
            <span>Incoming Requests</span>
            <Clock className="w-3.5 h-3.5 text-[#1D4ED8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1D4ED8]">{incomingCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Awaiting planning</div>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1.5">
            <span>Critical Requests</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#B91C1C]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#B91C1C]">{criticalCount}</div>
          <div className="text-[10px] text-rose-600 mt-1">High-priority safety</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1.5">
            <span>Under Review</span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600">{underReviewCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">In review queue</div>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1.5">
            <span>Conflicts Detected</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#B45309]">{conflictCount}</div>
          <div className="text-[10px] text-[#B45309] mt-1 font-medium">Corridor collisions</div>
        </div>

        <div className="bg-white border border-purple-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1.5">
            <span>Pending Approval</span>
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600">{pendingCount}</div>
          <div className="text-[10px] text-purple-600 mt-1">Slot generated</div>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1.5">
            <span>Approved Blocks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#15803D]">{approvedCount}</div>
          <div className="text-[10px] text-[#15803D] mt-1">Master schedule</div>
        </div>
      </div>

      {/* Critical Requests Alert Banner */}
      {criticalRequests.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-800 text-sm">
                Attention: {criticalRequests.length} Critical Priority Request{criticalRequests.length > 1 ? 's' : ''} Require Coordination
              </div>
              <p className="text-xs text-rose-600 mt-0.5">
                Immediate track safety, rail renewal, or interlocking calibration mandates.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/control/requests')}
            className="px-4 py-2 rounded-xl bg-[#B91C1C] hover:bg-rose-800 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
          >
            Review Critical Queue
          </button>
        </div>
      )}

      {/* Main Grid: Incoming Queue & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incoming Requests Queue (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Recent Incoming Requests</span>
                <span className="text-xs bg-[#1D4ED8]/10 text-[#1D4ED8] border border-[#1D4ED8]/20 px-2 py-0.5 rounded font-mono">
                  All Departments
                </span>
              </h3>
              <p className="text-xs text-slate-500">Incoming maintenance requirements across Ahmedabad Division</p>
            </div>

            <button 
              onClick={() => navigate('/control/requests')}
              className="text-xs text-[#1D4ED8] hover:text-[#1E40AF] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({totalCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">Requested Window</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentIncoming.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#1D4ED8]">{req.id}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        req.department === 'Engineering' ? 'bg-blue-50 text-[#1D4ED8] border-blue-200' :
                        req.department === 'S&T' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        'bg-amber-50 text-[#B45309] border-amber-200'
                      }`}>
                        {req.department}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{req.section}</td>
                    <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                      {req.requestedDate} ({req.requestedStart}–{req.requestedEnd})
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/control/requests/${req.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Decide</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Distribution & Operational Stats */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1D4ED8]" />
              <span>Department Distribution</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#1D4ED8]">Engineering</span>
                  <span className="font-mono text-slate-600">{engCount} requests</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1D4ED8]" style={{ width: `${totalCount > 0 ? (engCount / totalCount) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-teal-600">S&T (Signal & Telecom)</span>
                  <span className="font-mono text-slate-600">{stCount} requests</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600" style={{ width: `${totalCount > 0 ? (stCount / totalCount) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#B45309]">Traction Distribution (TRD)</span>
                  <span className="font-mono text-slate-600">{trdCount} requests</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B45309]" style={{ width: `${totalCount > 0 ? (trdCount / totalCount) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Zap className="w-4 h-4 text-[#1D4ED8]" />
              <span>RailPlan Planning Engine Status</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Deterministic Mode:</span>
                <span className="text-[#15803D] font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>Train Conflict Detection:</span>
                <span className="text-[#15803D]">Continuous</span>
              </div>
              <div className="flex justify-between">
                <span>Cross-Portal Sync:</span>
                <span className="text-[#1D4ED8]">Immediate</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Upcoming Approved Maintenance Schedule */}
      {upcomingApproved.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#15803D] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Upcoming Approved Maintenance Blocks</span>
              </h3>
              <p className="text-xs text-slate-500">Confirmed maintenance windows propagated to departments</p>
            </div>

            <button 
              onClick={() => navigate('/control/approved')}
              className="text-xs text-[#15803D] hover:text-[#166534] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Master Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingApproved.map(req => (
              <div key={req.id} className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-700">{req.id}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-mono font-semibold">
                    {req.decision?.approvedBlockId || 'MB-ASSIGNED'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{req.section} ({req.department})</div>
                <div className="text-[11px] text-slate-700 font-mono">
                  {req.decision?.approvedDate || req.requestedDate} • {req.decision?.approvedStart || req.requestedStart}–{req.decision?.approvedEnd || req.requestedEnd}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{req.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PlannerDashboard;
