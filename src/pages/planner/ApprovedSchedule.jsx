import React from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import { CheckSquare, Download, CheckCircle2, Building2, Cpu, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ApprovedSchedule = () => {
  const { requests } = useRailPlan();
  const navigate = useNavigate();

  const approvedRequests = requests.filter(r => r.status === 'Approved' || r.status === 'Modified');

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 mb-1">
              <CheckSquare className="w-4 h-4" />
              <span>CENTRAL CONTROL MASTER SCHEDULE</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Approved Maintenance Schedule</h2>
            <p className="text-xs text-slate-500 mt-1">
              Finalized master maintenance corridor allocations across Ahmedabad Division
            </p>
          </div>

          <button 
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Official Schedule</span>
          </button>
        </div>

        {/* Master Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {approvedRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No approved maintenance blocks in master schedule yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Section / Line</th>
                    <th className="py-3 px-4">Assigned Block</th>
                    <th className="py-3 px-4">Approved Timing</th>
                    <th className="py-3 px-4">Work Scope</th>
                    <th className="py-3 px-4">Authorized By</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {approvedRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{req.id}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                          req.department === 'Engineering' ? 'bg-blue-50 text-[#1D4ED8] border-blue-200' :
                          req.department === 'S&T' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                          'bg-amber-50 text-[#B45309] border-amber-200'
                        }`}>
                          {req.department}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{req.section} ({req.blockOrTrack || 'Up Line'})</div>
                        <div className="text-[11px] text-slate-500">{req.location}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1D4ED8]">
                        {req.decision?.approvedBlockId || req.recommendation?.recommendedBlockId || 'MB-204'}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                        <div>{req.decision?.approvedDate || req.requestedDate}</div>
                        <div>{req.decision?.approvedStart || req.requestedStart} – {req.decision?.approvedEnd || req.requestedEnd}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{req.description}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">{req.decision?.decidedBy || 'Central Planning'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/control/requests/${req.id}`)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default ApprovedSchedule;
