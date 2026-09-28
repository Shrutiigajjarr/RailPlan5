import React, { useState } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  ArrowRight,
  Eye,
  ShieldCheck,
  Calendar,
  X,
  Bell
} from 'lucide-react';

export const DeptDashboard = ({ department = null }) => {
  const { currentUser, requests, notifications } = useRailPlan();
  const navigate = useNavigate();
  const [selectedReq, setSelectedReq] = useState(null);

  const activeDept = department || currentUser?.department || 'Engineering';
  const deptPrefix = currentUser?.portalPath || '/engineering';

  // Dynamic filter for current department
  const deptRequests = requests.filter(r => r.department === activeDept);
  
  const totalCount = deptRequests.length;
  const underReviewCount = deptRequests.filter(r => r.status === 'Submitted' || r.status === 'Under Review' || r.status === 'Pending Approval' || r.status === 'Recommendation Generated').length;
  const approvedCount = deptRequests.filter(r => r.status === 'Approved' || r.status === 'Modified').length;
  const criticalCount = deptRequests.filter(r => (r.priority || '').toUpperCase() === 'CRITICAL').length;
  const conflictCount = deptRequests.filter(r => r.status === 'Conflict Detected').length;

  const recentRequests = deptRequests.slice(0, 5);
  const approvedBlocks = deptRequests.filter(r => r.status === 'Approved' || r.status === 'Modified');
  const deptNotifs = notifications.filter(n => n.targetDept === activeDept).slice(0, 3);

  return (
    <Layout>
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1D4ED8] font-mono text-xs font-semibold mb-1">
            <Building2 className="w-4 h-4" />
            <span>{activeDept.toUpperCase()} DEPARTMENT MAINTENANCE PORTAL</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {currentUser?.name || activeDept}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {currentUser?.title || 'Departmental Engineer'} • {currentUser?.division || 'Western Railway ADI'}
          </p>
        </div>

        <button
          onClick={() => navigate(`${deptPrefix}/requests/new`)}
          className="px-5 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Maintenance Request</span>
        </button>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Requests</span>
            <FileText className="w-4 h-4 text-[#1D4ED8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged in shared state</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Under Review / Planning</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-700">{underReviewCount}</div>
          <div className="text-[11px] text-purple-600/80 mt-1 font-medium">In Central Planning queue</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Approved Blocks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1 font-medium">Confirmed for execution</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Critical Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700">{criticalCount}</div>
          <div className="text-[11px] text-rose-600/80 mt-1 font-medium">Safety/Urgent category</div>
        </div>
      </div>

      {/* Notifications & Recent Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Requests Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Recent Requests</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-normal">
                  {totalCount} total
                </span>
              </h3>
              <p className="text-xs text-slate-500">Live request status and Central Control decisions</p>
            </div>

            <button 
              onClick={() => navigate(`${deptPrefix}/requests`)}
              className="text-xs text-[#1D4ED8] hover:text-[#1E40AF] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No maintenance requests logged yet for {activeDept}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Section / Location</th>
                    <th className="py-2.5 px-3">Work Type</th>
                    <th className="py-2.5 px-3">Requested Window</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#1D4ED8]">{req.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{req.section}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{req.location}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{req.maintenanceType}</td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800">{req.requestedDate}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{req.requestedStart} – {req.requestedEnd} ({req.estimatedDurationMinutes}m)</div>
                      </td>
                      <td className="py-3 px-3">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notifications & System Updates Side Card */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1D4ED8]" />
              <span>Department Notifications</span>
            </h3>

            {deptNotifs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No recent departmental alerts.</p>
            ) : (
              <div className="space-y-3">
                {deptNotifs.map(n => (
                  <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Upcoming Approved Maintenance Blocks */}
      {approvedBlocks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Upcoming Approved Maintenance</span>
              </h3>
              <p className="text-xs text-slate-500">Confirmed maintenance windows issued by Central Control</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedBlocks.map(block => (
              <div key={block.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-700">{block.id}</span>
                    {block.decision?.isIntegrated && (
                      <span className="text-[10px] bg-blue-100 text-[#1D4ED8] border border-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                        {block.decision.integratedBlockId || 'IB-001'} INTEGRATED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                    BLOCK {block.decision?.approvedBlockId || block.recommendation?.recommendedBlockId || 'MB-CONFIRMED'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{block.section} ({block.blockOrTrack || 'Up Line'})</div>
                <div className="text-xs text-slate-600 font-mono">
                  Approved Window: <strong className="text-emerald-700">{block.decision?.approvedDate || block.requestedDate} ({block.decision?.approvedStart || block.requestedStart} – {block.decision?.approvedEnd || block.requestedEnd})</strong>
                </div>
                
                {block.decision?.isIntegrated && (
                  <div className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-100 font-mono">
                    Working alongside: <strong>{block.decision.coordinatedDepartments?.join(', ') || 'Peer Departments'}</strong>
                  </div>
                )}

                <p className="text-xs text-slate-500">{block.description}</p>
                {block.decision?.reason && (
                  <p className="text-xs text-slate-600 border-t border-slate-100 pt-1.5 mt-1">
                    <span className="text-slate-400">Remarks:</span> {block.decision.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#1D4ED8]">{selectedReq.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedReq.title || selectedReq.section}</h3>
              </div>
              <button 
                onClick={() => setSelectedReq(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Progress */}
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Request Lifecycle Progression</div>
              <Timeline status={selectedReq.status} />
            </div>

            {/* Decision Callout if decided */}
            {selectedReq.decision && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {selectedReq.decision.isIntegrated 
                        ? `MAINTENANCE BLOCK APPROVED (${selectedReq.decision.integratedBlockId || 'IB-001'})`
                        : 'MAINTENANCE BLOCK APPROVED'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    Block: {selectedReq.decision.approvedBlockId || 'MB-204'}
                  </span>
                </div>

                {selectedReq.decision.isIntegrated && (
                  <div className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-100 font-mono">
                    Working alongside: <strong>{selectedReq.decision.coordinatedDepartments?.join(', ') || 'Peer Departments'}</strong> (Integrated Block: {selectedReq.decision.integratedBlockId})
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500">Original Window:</span>
                    <div className="text-slate-800">{selectedReq.requestedStart} – {selectedReq.requestedEnd}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Approved Window:</span>
                    <div className="text-emerald-700 font-bold">{selectedReq.decision.approvedStart} – {selectedReq.decision.approvedEnd}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 pt-1">
                  <span className="font-semibold text-emerald-700">Reason:</span> {selectedReq.decision.reason}
                </div>
                <div className="text-[10px] text-slate-500">
                  Approved By: {selectedReq.decision.decidedBy || 'Central Planning'}
                </div>
              </div>
            )}

            {/* Recommendation if available */}
            {!selectedReq.decision && selectedReq.recommendation && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-purple-700 flex items-center justify-between">
                  <span>Planning Engine Recommendation</span>
                  <span className="font-mono text-purple-600">{selectedReq.recommendation.status}</span>
                </div>
                <div className="font-mono text-slate-800">
                  Recommended Slot: {selectedReq.recommendation.recommendedStart} – {selectedReq.recommendation.recommendedEnd} (Block {selectedReq.recommendation.recommendedBlockId || 'Pending'})
                </div>
                <p className="text-slate-600 leading-relaxed">{selectedReq.recommendation.explanation}</p>
              </div>
            )}

            {/* Activity History */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2">Activity Audit History</h4>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                {selectedReq.activityLog?.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-slate-700">
                    <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                    <span>• {log.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DeptDashboard;
