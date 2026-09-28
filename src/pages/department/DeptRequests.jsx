import React, { useState, useEffect } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertTriangle
} from 'lucide-react';

export const DeptRequests = () => {
  const { currentUser, requests } = useRailPlan();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const activeDept = currentUser?.department || 'Engineering';
  const deptPrefix = currentUser?.portalPath || '/engineering';

  const deptRequests = requests.filter(r => r.department === activeDept);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    if (highlightId) {
      const match = deptRequests.find(r => r.id === highlightId);
      if (match) setSelectedReq(match);
    }
  }, [highlightId, deptRequests]);

  const filteredRequests = deptRequests.filter(req => {
    const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.maintenanceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (req.title || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || (req.priority || '').toUpperCase() === priorityFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1D4ED8] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{activeDept.toUpperCase()} REQUEST LOG</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Department Maintenance Requests</h2>
            <p className="text-xs text-slate-500 mt-1">
              All maintenance requirements submitted by {activeDept} with synchronized Central Planning decisions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`${deptPrefix}/requests/new`)}
              className="px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Request</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search ID, section, location, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Conflict Detected">Conflict Detected</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Modified">Modified</option>
              <option value="Deferred">Deferred</option>
              <option value="Rejected">Rejected</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-slate-600 ml-2">
              <span>Priority:</span>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching maintenance requests found for {activeDept}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Section / Location</th>
                    <th className="py-3 px-4">Work Scope</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Requested Timing</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequests.map(req => (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-slate-50 transition-colors ${
                        highlightId === req.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-[#1D4ED8]">{req.id}</div>
                        {req.decision?.isIntegrated && (
                          <span className="inline-block mt-0.5 text-[9px] bg-blue-100 text-[#1D4ED8] border border-blue-300 px-1.5 py-0.5 rounded font-bold">
                            {req.decision.integratedBlockId || 'IB-001'} INTEGRATED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{req.section} ({req.blockOrTrack || 'Up Line'})</div>
                        <div className="text-[11px] text-slate-500">{req.location}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700">{req.maintenanceType}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{req.description}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">{req.resourceKey}</td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800">{req.requestedDate}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{req.requestedStart} – {req.requestedEnd} ({req.estimatedDurationMinutes}m)</div>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
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

        {/* Inspect Modal */}
        {selectedReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
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

              {/* Progress Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Request Lifecycle Progression</h4>
                <Timeline status={selectedReq.status} />
              </div>

              {/* Decision Callout */}
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
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
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

              {/* Recommendation if not yet decided */}
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

              {/* Work Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Section & Track:</span>
                  <span className="text-slate-900 font-semibold">{selectedReq.section} ({selectedReq.blockOrTrack})</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Resource:</span>
                  <span className="text-slate-900 font-mono">{selectedReq.resourceKey}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Priority & Deadline:</span>
                  <span className="text-amber-700 font-bold">{selectedReq.priority} • {selectedReq.deadline}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Location:</span>
                  <span className="text-slate-900">{selectedReq.location}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Work Description</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedReq.description}
                </p>
              </div>

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
      </div>
    </Layout>
  );
};

export default DeptRequests;
