import React, { useState } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { useNavigate } from 'react-router-dom';
import { Cpu, Search, Filter, Eye, Building2, CheckCircle2, AlertTriangle, Layers, ArrowRight, X } from 'lucide-react';

import { evaluatePriorityValidation, VALIDATION_STATUS } from '../../utils/priorityValidator';

export const PlannerRequests = () => {
  const { requests } = useRailPlan();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.maintenanceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (req.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (req.resourceKey || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || req.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || (req.priority || '').toUpperCase() === priorityFilter.toUpperCase();

    return matchesSearch && matchesDept && matchesStatus && matchesPriority;
  });

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenManualBuilder = () => {
    if (selectedIds.length === 0) return;
    navigate(`/control/planning?tab=manual&ids=${selectedIds.join(',')}`);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1D4ED8] mb-1">
              <Cpu className="w-4 h-4" />
              <span>CENTRAL PLANNING REQUEST REPOSITORY</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Incoming Department Maintenance Requests</h2>
            <p className="text-xs text-slate-500 mt-1">
              Unified cross-department queue for Engineering, S&T, and Traction Distribution
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/control/planning?tab=manual')}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Manual Block Builder</span>
            </button>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs text-slate-600 font-mono">
              Total: <span className="font-bold text-[#1D4ED8]">{requests.length}</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search ID, Section, Resource, Keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5" />
              <span>Dept:</span>
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="S&T">S&T</option>
              <option value="Traction Distribution">Traction Distribution</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-slate-600 ml-2">
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
              No matching maintenance requests found in central repository.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-3 px-4 text-center w-10">Select</th>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Section / Location</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Requested Timing</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequests.map(req => {
                    const isSelected = selectedIds.includes(req.id);
                    const isLocked = req.status === 'Approved' || req.status === 'Rejected';

                    return (
                      <tr key={req.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="py-3 px-4 text-center">
                          <input 
                            type="checkbox"
                            disabled={isLocked}
                            checked={isSelected}
                            onChange={() => handleToggleSelect(req.id)}
                            className="w-4 h-4 text-[#1D4ED8] rounded border-slate-300 focus:ring-[#1D4ED8] cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1D4ED8]">{req.id}</td>
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
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">{req.resourceKey}</td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          <div>{req.requestedDate}</div>
                          <div className="text-[11px] text-slate-500">{req.requestedStart} – {req.requestedEnd} ({req.estimatedDurationMinutes}m)</div>
                        </td>
                        <td className="py-3 px-4 space-y-1">
                          <PriorityBadge priority={req.approvedPriority || req.priority} />
                          {(() => {
                            const val = evaluatePriorityValidation(req);
                            if (val.validationStatus === VALIDATION_STATUS.OVERSTATED) {
                              return (
                                <span className="block text-[9px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 w-fit" title={val.explanation}>
                                  ⚠️ Overstated
                                </span>
                              );
                            }
                            if (val.validationStatus === VALIDATION_STATUS.UNDERSTATED) {
                              return (
                                <span className="block text-[9px] font-mono font-bold text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-300 w-fit" title={val.explanation}>
                                  ⚡ Understated
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/control/requests/${req.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Floating Quick-Action Bar for Selected Requests */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 animate-in slide-in-from-bottom-6">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong>{selectedIds.length} Requests Selected</strong>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={handleOpenManualBuilder}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Create Integrated Block (Open Builder)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default PlannerRequests;
