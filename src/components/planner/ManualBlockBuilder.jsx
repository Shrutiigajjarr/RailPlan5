import React, { useState, useMemo, useEffect } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { 
  checkIntegrationCompatibility, 
  findCompatibleCandidateRequests 
} from '../../utils/planningEngine';
import { 
  IntegratedBlockSuccessModal, 
  IntegratedBlockErrorModal 
} from './IntegratedBlockSuccessModal';
import TrainImpactAnalysisCard from './TrainImpactAnalysisCard';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Plus, 
  X, 
  Search, 
  Filter, 
  Building2, 
  Cpu, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  Calendar,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const ManualBlockBuilder = ({ initialSelectedIds = [] }) => {
  const { 
    requests, 
    sections, 
    availableBlocks, 
    trains, 
    integratedBlocks, 
    createManualIntegratedBlock, 
    approveIntegratedBlock, 
    removeRequestFromIntegratedBlock, 
    addRequestToIntegratedBlock, 
    cancelIntegratedBlock 
  } = useRailPlan();

  // Selected Request IDs
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Validation & Modal State
  const [validationResult, setValidationResult] = useState(null);
  const [selectedBlockOption, setSelectedBlockOption] = useState(null);
  const [createdBlock, setCreatedBlock] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [addRequestModalOpen, setAddRequestModalOpen] = useState(false);
  const [activeDraftIbId, setActiveDraftIbId] = useState(null);

  // Success / Error Modals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalBlock, setSuccessModalBlock] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Selected request objects
  const selectedRequests = useMemo(() => {
    return requests.filter(r => selectedIds.includes(r.id));
  }, [requests, selectedIds]);

  // First selected request (used for intelligent section / candidate hinting)
  const primarySelectedReq = selectedRequests[0] || null;

  // Compute smart candidate hints when 1st request is selected
  const candidateHints = useMemo(() => {
    if (!primarySelectedReq) return new Map();
    const hints = findCompatibleCandidateRequests(primarySelectedReq, requests, availableBlocks, trains);
    const map = new Map();
    hints.forEach(h => map.set(h.request.id, h));
    return map;
  }, [primarySelectedReq, requests, availableBlocks, trains]);

  // Filter eligible requests for the table
  const eligibleRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.maintenanceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (req.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (req.resourceKey || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = deptFilter === 'ALL' || req.department === deptFilter;
      const matchesPriority = priorityFilter === 'ALL' || (req.priority || '').toUpperCase() === priorityFilter.toUpperCase();
      const matchesSection = sectionFilter === 'ALL' || req.section === sectionFilter;
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

      return matchesSearch && matchesDept && matchesPriority && matchesSection && matchesStatus;
    });
  }, [requests, searchTerm, deptFilter, priorityFilter, sectionFilter, statusFilter]);

  // Toggle selection of a request
  const handleToggleSelect = (reqId) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(reqId);
      const next = isSelected ? prev.filter(id => id !== reqId) : [...prev, reqId];
      return next;
    });
    // Reset previous validation and block choice when selection changes
    setValidationResult(null);
    setSelectedBlockOption(null);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setValidationResult(null);
    setSelectedBlockOption(null);
    setCreatedBlock(null);
  };

  const handleRemoveSingle = (reqId) => {
    setSelectedIds(prev => prev.filter(id => id !== reqId));
    setValidationResult(null);
    setSelectedBlockOption(null);
  };

  // Run Compatibility Check
  const handleCheckCompatibility = () => {
    if (selectedRequests.length < 2) return;
    const result = checkIntegrationCompatibility(selectedRequests, availableBlocks, trains);
    setValidationResult(result);
    if (result.isCompatible && result.availableBlockOptions.length > 0) {
      setSelectedBlockOption(result.recommendedBlock || result.availableBlockOptions[0]);
    } else {
      setSelectedBlockOption(null);
    }
  };

  // Create Manual Integrated Block with Success / Error Modal
  const handleCreateBlock = () => {
    if (!validationResult || !validationResult.isCompatible || !selectedBlockOption) {
      setErrorMessage(
        (validationResult?.incompatibleReasons && validationResult.incompatibleReasons.join(' ')) ||
        'Please ensure at least 2 compatible requests are selected and a valid maintenance block option is chosen.'
      );
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const newIb = createManualIntegratedBlock({
        selectedRequests,
        chosenBlockOption: selectedBlockOption
      });

      if (newIb && newIb.id) {
        setCreatedBlock(newIb);
        setActiveDraftIbId(newIb.id);
        setSuccessModalBlock(newIb);
        setIsSuccessModalOpen(true);
        setActionNotice(`Integrated Maintenance Block ${newIb.id} successfully created! Ready for review & approval.`);
        setTimeout(() => setActionNotice(null), 6000);
      } else {
        setErrorMessage('Unable to persist the integrated block proposal. Please check that no selected request has been modified.');
        setIsErrorModalOpen(true);
      }
    } catch (err) {
      console.error('RailPlan: Error creating manual integrated block', err);
      setErrorMessage(err.message || 'An unexpected error occurred while creating the integrated block proposal.');
      setIsErrorModalOpen(true);
    }
  };

  // Modal Action Handlers
  const handleReviewFromModal = () => {
    setIsSuccessModalOpen(false);
    setTimeout(() => {
      const reviewElement = document.getElementById('draft-block-review-section');
      if (reviewElement) {
        reviewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleCreateAnotherFromModal = () => {
    setIsSuccessModalOpen(false);
    handleClearSelection();
  };

  // Approve Draft Block
  const handleApproveDraft = (ibId) => {
    approveIntegratedBlock(ibId);
    setActionNotice(`Integrated Maintenance Block ${ibId} APPROVED! All constituent department requests confirmed.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Remove request from active draft
  const handleRemoveFromDraft = (ibId, reqId) => {
    removeRequestFromIntegratedBlock(ibId, reqId);
    setSelectedIds(prev => prev.filter(id => id !== reqId));
    setActionNotice(`Removed ${reqId} from Integrated Block ${ibId}.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Add request to active draft
  const handleAddCandidateToDraft = (ibId, candReq) => {
    const res = addRequestToIntegratedBlock(ibId, candReq);
    if (res.success) {
      setSelectedIds(prev => [...prev, candReq.id]);
      setAddRequestModalOpen(false);
      setActionNotice(`Added ${candReq.id} to Integrated Block ${ibId}.`);
    } else {
      setErrorMessage(res.reasons ? res.reasons.join(' ') : (res.reason || 'Cannot add request to block.'));
      setIsErrorModalOpen(true);
    }
  };

  // Cancel draft block
  const handleCancelDraft = (ibId) => {
    cancelIntegratedBlock(ibId);
    setCreatedBlock(null);
    setActiveDraftIbId(null);
    setActionNotice(`Draft Integrated Block ${ibId} cancelled.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Banner */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Manual Block Builder Intro Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1D4ED8] mb-1">
            <Layers className="w-4 h-4" />
            <span>MANUAL INTEGRATED BLOCK BUILDER</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Build Integrated Block</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Select 2 or more maintenance requests from different departments that you want to coordinate within a common maintenance block, and validate cross-departmental compatibility.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl font-mono text-xs text-[#1D4ED8] shrink-0">
          <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Active Selection</span>
          <span className="font-bold text-sm">{selectedIds.length} Requests Selected</span>
        </div>
      </div>

      {/* Draft Manual Block Review Card (if draft exists) */}
      {createdBlock && (
        <div 
          id="draft-block-review-section"
          className="bg-white border-2 border-[#1D4ED8] rounded-2xl p-6 shadow-md space-y-5 animate-in fade-in"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-mono font-bold border border-purple-200 uppercase font-sans">
                  MANUAL COORDINATION
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-mono font-bold border border-amber-200 uppercase font-sans">
                  {createdBlock.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                {createdBlock.id} • Section {createdBlock.section}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Block {createdBlock.blockId} ({createdBlock.date} • {createdBlock.start}–{createdBlock.end}) • {createdBlock.durationMinutes} min parallel duration
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddRequestModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Request</span>
              </button>

              <button
                onClick={() => handleCancelDraft(createdBlock.id)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Draft</span>
              </button>

              <button
                onClick={() => handleApproveDraft(createdBlock.id)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Approve Integrated Block</span>
              </button>
            </div>
          </div>

          {/* Constituent Requests in Draft */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-600 mb-3">
              Included Department Activities ({createdBlock.requestIds.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {createdBlock.activities.map(act => (
                <div key={act.requestId} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2 relative group">
                  <button
                    onClick={() => handleRemoveFromDraft(createdBlock.id, act.requestId)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove from block"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1D4ED8]">{act.requestId}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200">
                      {act.department}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-800">{act.maintenanceType}</div>
                  <div className="text-[11px] text-slate-500 font-mono">Resource: {act.resourceKey}</div>
                  <div className="text-[11px] text-slate-600">Duration: {act.durationMinutes} min</div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefit Statistics */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Requests Merged</span>
              <span className="text-xl font-bold font-mono text-slate-900">{createdBlock.requestIds.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Separate Required</span>
              <span className="text-xl font-bold font-mono text-slate-900">{createdBlock.requestIds.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Integrated Needed</span>
              <span className="text-xl font-bold font-mono text-emerald-600">1 Block</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Blocks Avoided</span>
              <span className="text-xl font-bold font-mono text-[#1D4ED8]">
                {createdBlock.separateBlocksAvoided} Blocks Saved
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search ID, Section, Resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Sections</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.id} ({s.code})</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Conflict Detected">Conflict Detected</option>
          </select>
        </div>
      </div>

      {/* Eligible Requests Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-700">
              Eligible Maintenance Requests
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-mono text-[11px]">
              {eligibleRequests.length} available
            </span>
          </div>

          {primarySelectedReq && (
            <div className="text-xs font-mono text-slate-500 hidden sm:block">
              Base Section: <strong className="text-[#1D4ED8]">{primarySelectedReq.section}</strong>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px] font-mono uppercase">
                <th className="p-3 text-center w-12">Select</th>
                <th className="p-3">Request ID</th>
                <th className="p-3">Department</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Section & Track</th>
                <th className="p-3">Work Title & Resource</th>
                <th className="p-3">Requested Window</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eligibleRequests.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    No matching maintenance requests found.
                  </td>
                </tr>
              ) : (
                eligibleRequests.map(req => {
                  const isSelected = selectedIds.includes(req.id);
                  const isLocked = req.status === 'Approved' || req.status === 'Rejected' || req.status === 'Completed';
                  const hint = candidateHints.get(req.id);

                  // Row highlight if selected or candidate
                  let rowBg = isSelected ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50/80';
                  if (primarySelectedReq && !isSelected) {
                    if (req.section !== primarySelectedReq.section) {
                      rowBg += ' opacity-60';
                    }
                  }

                  return (
                    <tr key={req.id} className={`${rowBg} transition-colors`}>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox"
                          disabled={isLocked}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(req.id)}
                          className="w-4 h-4 text-[#1D4ED8] rounded border-slate-300 focus:ring-[#1D4ED8] cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{req.id}</span>
                          {hint && hint.matchBadge === 'Optimal Candidate' && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-sans font-bold">
                              Compatible
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                          req.department === 'Engineering' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          req.department === 'S&T' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                          'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {req.department}
                        </span>
                      </td>

                      <td className="p-3">
                        <PriorityBadge priority={req.priority} />
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-800">{req.section}</div>
                        <div className="text-[10px] text-slate-500">{req.blockOrTrack || 'Up Line'}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[200px]">{req.title || req.maintenanceType}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{req.resourceKey}</div>
                      </td>

                      <td className="p-3 font-mono text-slate-700">
                        <div>{req.requestedDate}</div>
                        <div className="text-[11px] text-slate-500">{req.requestedStart} – {req.requestedEnd}</div>
                      </td>

                      <td className="p-3 font-mono text-slate-700">
                        {req.estimatedDurationMinutes || 120}m
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {req.deadline || '18:00'}
                      </td>

                      <td className="p-3">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Selection & Action Bar */}
      <div className="sticky bottom-4 z-30 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-white text-sm">{selectedIds.length} Requests Selected</strong>
          </div>

          {/* Department breakdown of selection */}
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from(new Set(selectedRequests.map(r => r.department))).map(dept => (
              <span key={dept} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-mono border border-slate-700">
                {dept}
              </span>
            ))}
          </div>

          {/* Selected ID pills */}
          <div className="hidden lg:flex items-center gap-1">
            {selectedRequests.map(r => (
              <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1D4ED8]/40 border border-[#1D4ED8] text-blue-200 font-mono text-[10px]">
                <span>{r.id}</span>
                <button onClick={() => handleRemoveSingle(r.id)} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {selectedIds.length > 0 && (
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          )}

          <button
            onClick={handleCheckCompatibility}
            disabled={selectedIds.length < 2}
            className="px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-slate-700 disabled:text-slate-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Check Compatibility ({selectedIds.length}/2 min)</span>
          </button>
        </div>
      </div>

      {/* Validation Result Panel */}
      {validationResult && (
        <div className={`bg-white border rounded-2xl p-6 shadow-sm space-y-6 ${
          validationResult.isCompatible ? 'border-emerald-300' : 'border-rose-300'
        }`}>
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                validationResult.isCompatible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {validationResult.isCompatible ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {validationResult.isCompatible ? 'Integration Validation Passed' : 'Integration Not Possible'}
                </h3>
                <p className="text-xs text-slate-500">
                  {validationResult.isCompatible 
                    ? `Selected ${validationResult.requests.length} requests can execute in parallel within a single maintenance block on ${validationResult.section}.`
                    : 'The selected requests violate corridor constraints and cannot be combined.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                validationResult.isCompatible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {validationResult.isCompatible ? 'COMPATIBLE FOR BLOCK' : 'INCOMPATIBLE'}
              </span>
            </div>
          </div>

          {/* Diagnostic Checks Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-600">
                Constraint Diagnostic Verification
              </h4>
              <div className="space-y-2">
                {validationResult.passChecks.map((chk, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{chk.name}</span>
                      <span className="text-[11px] text-slate-500">{chk.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incompatible Reasons (if any) or Benefits Box */}
            <div>
              {validationResult.incompatibleReasons.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-rose-700">
                    Failed Constraints & Conflicts
                  </h4>
                  <div className="space-y-2">
                    {validationResult.incompatibleReasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block mb-0.5">Constraint Violation</span>
                          <span className="text-[11px] leading-relaxed">{reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-600">
                    Operational Block Benefits
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase">Requests Merged</span>
                        <span className="text-lg font-bold font-mono text-slate-900">{validationResult.benefits?.requestsCombined}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase">Separate Avoided</span>
                        <span className="text-lg font-bold font-mono text-[#1D4ED8]">
                          {validationResult.benefits?.separateBlocksAvoided} Blocks
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      💡 Combining these {validationResult.requests.length} department activities eliminates {validationResult.benefits?.separateBlocksAvoided} individual corridor possession windows and saves {validationResult.benefits?.trackPossessionHoursSaved} hours of track possession time.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Available Maintenance Block Options (Radio Selection) */}
          {validationResult.isCompatible && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Select Available Maintenance Block Window
                  </h4>
                  <p className="text-xs text-slate-500">
                    Choose which corridor slot to assign for this integrated maintenance block:
                  </p>
                </div>

                <span className="text-xs font-mono text-slate-500">
                  {validationResult.availableBlockOptions.length} Feasible Options
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {validationResult.availableBlockOptions.map(opt => {
                  const isSelected = selectedBlockOption && 
                    selectedBlockOption.blockId === opt.blockId && 
                    selectedBlockOption.start === opt.start;

                  return (
                    <div 
                      key={`${opt.blockId}-${opt.start}`}
                      onClick={() => setSelectedBlockOption(opt)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'border-[#1D4ED8] bg-blue-50/50 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {opt.isRecommended && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider border border-emerald-200">
                          ⭐ Recommended
                        </span>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          name="block_option" 
                          checked={isSelected}
                          onChange={() => setSelectedBlockOption(opt)}
                          className="text-[#1D4ED8] focus:ring-[#1D4ED8]"
                        />
                        <span className="font-mono font-bold text-sm text-slate-900">{opt.blockId}</span>
                      </div>

                      <div className="font-bold text-base text-[#1D4ED8] font-mono">
                        {opt.start} – {opt.end}
                      </div>

                      <div className="text-xs text-slate-600 mt-1">
                        {opt.blockName} • {opt.date}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{opt.reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Critical Request Warning if delayed */}
              {selectedBlockOption?.criticalDelayMinutes > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Priority Window Note</span>
                    A CRITICAL priority request in this selection is adjusted by {selectedBlockOption.criticalDelayMinutes} minutes compared to its initial requested start. All deadlines remain verified safe.
                  </div>
                </div>
              )}

              {/* Feature 2: Real-time Train Impact Analysis for Selected Option */}
              {selectedBlockOption && (
                <div className="pt-2">
                  <TrainImpactAnalysisCard
                    proposedBlock={{
                      section: validationResult.section,
                      start: selectedBlockOption.start,
                      end: selectedBlockOption.end,
                      date: selectedBlockOption.date || '2026-08-31',
                      blockId: selectedBlockOption.blockId
                    }}
                    trains={trains}
                    availableBlocks={availableBlocks}
                  />
                </div>
              )}

              {/* Why This Merge Works Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Why can these requests share this block?</span>
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  {validationResult.explanation.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Create Block Final Action */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  onClick={handleCreateBlock}
                  disabled={!selectedBlockOption}
                  className="px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-blue-300 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Create Integrated Block ({selectedBlockOption ? `${selectedBlockOption.blockId} • ${selectedBlockOption.start}–${selectedBlockOption.end}` : 'Choose Block'})</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Add Request Modal (for existing draft) */}
      {addRequestModalOpen && createdBlock && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1D4ED8]" />
                <span>Add Compatible Request to {createdBlock.id}</span>
              </h3>
              <button onClick={() => setAddRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Only requests on section <strong className="text-slate-800">{createdBlock.section}</strong> with independent resources can be added to this block:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {requests
                .filter(r => r.section === createdBlock.section && !createdBlock.requestIds.includes(r.id) && r.status !== 'Approved')
                .map(cand => (
                  <div key={cand.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1D4ED8]">{cand.id}</span>
                        <span className="font-semibold text-slate-700">{cand.department}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({cand.resourceKey})</span>
                      </div>
                      <div className="text-slate-600 mt-0.5">{cand.title || cand.maintenanceType}</div>
                    </div>

                    <button
                      onClick={() => handleAddCandidateToDraft(createdBlock.id, cand)}
                      className="px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      <IntegratedBlockSuccessModal
        isOpen={isSuccessModalOpen}
        block={successModalBlock}
        onClose={handleCloseSuccessModal}
        onReview={handleReviewFromModal}
        onCreateAnother={handleCreateAnotherFromModal}
      />

      {/* Error Popup Modal */}
      <IntegratedBlockErrorModal
        isOpen={isErrorModalOpen}
        errorReason={errorMessage}
        onClose={() => setIsErrorModalOpen(false)}
      />

    </div>
  );
};

export default ManualBlockBuilder;
