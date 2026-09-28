import React, { useState, useEffect } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import TimelineGantt from '../../components/planner/TimelineGantt';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ManualBlockBuilder from '../../components/planner/ManualBlockBuilder';
import TrainImpactAnalysisCard from '../../components/planner/TrainImpactAnalysisCard';
import PriorityValidationCard from '../../components/planner/PriorityValidationCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ArrowRight, 
  Eye, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  TrendingDown, 
  Users, 
  Info, 
  Calendar, 
  X, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp,
  GitPullRequest
} from 'lucide-react';

export const PlanningBoard = () => {
  const { 
    requests, 
    sections, 
    availableBlocks, 
    trains, 
    integratedBlocks, 
    planningMetrics, 
    generatePlan, 
    resetPlan, 
    approveIntegratedBlock, 
    approveRequest,
    updateApprovedPriority
  } = useRailPlan();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params for pre-selection and tab
  const tabParam = searchParams.get('tab');
  const idsParam = searchParams.get('ids');
  const initialSelectedIds = idsParam ? idsParam.split(',').filter(Boolean) : [];

  const [activeTab, setActiveTab] = useState(tabParam === 'manual' || initialSelectedIds.length > 0 ? 'manual' : 'auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIB, setSelectedIB] = useState(null);
  const [expandedWhyIB, setExpandedWhyIB] = useState({});
  const [approvalBanner, setApprovalBanner] = useState(null);

  useEffect(() => {
    if (tabParam === 'manual') {
      setActiveTab('manual');
    }
  }, [tabParam]);

  // Live input counts
  const pendingRequests = requests.filter(r => r.status !== 'Approved' && r.status !== 'Rejected' && r.status !== 'Deferred');
  const criticalCount = pendingRequests.filter(r => (r.priority || r.requestedPriority || '').toUpperCase() === 'CRITICAL').length;
  const engCount = requests.filter(r => r.department === 'Engineering').length;
  const stCount = requests.filter(r => r.department === 'S&T').length;
  const trdCount = requests.filter(r => r.department === 'Traction Distribution').length;

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generatePlan();
      setIsGenerating(false);
    }, 400);
  };

  const handleApproveIB = (ibId) => {
    approveIntegratedBlock(ibId);
    setApprovalBanner(`Integrated Maintenance Block ${ibId} APPROVED! All constituent department requests updated and persisted.`);
    setTimeout(() => setApprovalBanner(null), 5000);
  };

  const handleQuickApproveIndividual = (reqId) => {
    approveRequest(reqId);
    setApprovalBanner(`Request ${reqId} APPROVED! Decision dispatched to originating department.`);
    setTimeout(() => setApprovalBanner(null), 5000);
  };

  const toggleWhy = (ibId) => {
    setExpandedWhyIB(prev => ({ ...prev, [ibId]: !prev[ibId] }));
  };

  // Filter individual scheduled requests (scheduled but not in integrated blocks)
  const individualScheduledRequests = requests.filter(r => 
    r.recommendation && 
    !r.recommendation.isIntegrated && 
    r.recommendation.status !== 'UNSCHEDULED' && 
    r.status !== 'Approved' && 
    r.status !== 'Rejected' && 
    r.status !== 'Deferred'
  );

  // Filter unscheduled requests
  const unscheduledRequests = requests.filter(r => 
    r.recommendation?.status === 'UNSCHEDULED'
  );

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Planning Page Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1D4ED8] mb-1">
              <Cpu className="w-4 h-4" />
              <span>RAILPLAN MULTI-DEPARTMENT PLANNING ENGINE</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Maintenance Planning</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Generate coordinated maintenance schedules automatically or manually assemble multi-department integrated blocks with real-time constraint validation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {planningMetrics && activeTab === 'auto' && (
              <button
                onClick={resetPlan}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset generated plan back to unassigned state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Plan</span>
              </button>
            )}

            {activeTab === 'auto' && (
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-blue-300 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Coordinated Plan...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Generate Coordinated Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Planning Modes Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-xs">
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'auto'
                ? 'bg-[#1D4ED8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Automatic Planning</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-[#1D4ED8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Manual Block Builder</span>
            {initialSelectedIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1D4ED8] text-[10px] font-mono font-bold">
                {initialSelectedIds.length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: MANUAL BLOCK BUILDER TAB */}
        {/* ========================================================================= */}
        {activeTab === 'manual' ? (
          <ManualBlockBuilder initialSelectedIds={initialSelectedIds} />
        ) : (
          /* ========================================================================= */
          /* MODE 2: AUTOMATIC PLANNING TAB (PRESERVED COMPLETE ENGINE WORKFLOW) */
          /* ========================================================================= */
          <div className="space-y-6">
            
            {/* Planning Inputs Summary & Department Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span>Planning Input Parameters</span>
                </h3>
                {planningMetrics?.lastGeneratedAt && (
                  <span className="text-[11px] font-mono text-slate-500">
                    Last generated: <strong className="text-slate-700">{planningMetrics.lastGeneratedAt}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Pending Requests</span>
                  <span className="text-lg font-extrabold text-slate-900">{pendingRequests.length}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Critical Requests</span>
                  <span className="text-lg font-extrabold text-rose-600">{criticalCount}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Available Blocks</span>
                  <span className="text-lg font-extrabold text-blue-700">{availableBlocks.length}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Train Movements</span>
                  <span className="text-lg font-extrabold text-amber-700">{trains.length}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Corridor Sections</span>
                  <span className="text-lg font-extrabold text-slate-900">{sections.length}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Active Departments</span>
                  <span className="text-lg font-extrabold text-purple-700">3</span>
                </div>
              </div>

              {/* Department Breakdown Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="text-slate-500 text-[11px] font-medium">Department Demand:</span>
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                  <span className="font-semibold text-blue-900">Engineering:</span>
                  <strong className="font-mono text-[#1D4ED8]">{engCount} requests</strong>
                </div>
                <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  <span className="font-semibold text-teal-900">S&T:</span>
                  <strong className="font-mono text-teal-700">{stCount} requests</strong>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                  <span className="font-semibold text-amber-900">Traction Distribution:</span>
                  <strong className="font-mono text-[#B45309]">{trdCount} requests</strong>
                </div>
              </div>
            </div>

            {/* Global Notification Banner */}
            {approvalBanner && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{approvalBanner}</span>
                </div>
                <button onClick={() => setApprovalBanner(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Plan Summary Banner */}
            {planningMetrics && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold uppercase">
                      FEASIBLE & COORDINATED
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Deterministic Coordinated Plan Summary</h3>
                  </div>
                  <div className="text-[11px] font-mono text-blue-900 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300">
                    Departments Coordinated: <strong>{planningMetrics.departmentsCoordinated?.join(' + ') || 'Engineering + S&T + Traction'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Total Evaluated</span>
                    <span className="text-base font-extrabold text-slate-900">{planningMetrics.totalEvaluated}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Total Scheduled</span>
                    <span className="text-base font-extrabold text-emerald-600">{planningMetrics.totalScheduled}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Integrated Work</span>
                    <span className="text-base font-extrabold text-[#1D4ED8]">{planningMetrics.totalIntegratedRequests} reqs</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Individual Work</span>
                    <span className="text-base font-extrabold text-slate-700">{planningMetrics.totalIndividualRequests} reqs</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Rescheduled</span>
                    <span className="text-base font-extrabold text-amber-600">{planningMetrics.totalRescheduled}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Integrated Blocks</span>
                    <span className="text-base font-extrabold text-[#1D4ED8]">{planningMetrics.integratedBlocksCreated} blocks</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300">
                    <span className="text-emerald-800 block text-[10px] font-bold">Blocks Avoided</span>
                    <span className="text-base font-extrabold text-emerald-700">+{planningMetrics.separateBlocksAvoided} saved</span>
                  </div>
                </div>
              </div>
            )}

            {/* Integrated Maintenance Blocks Section */}
            {integratedBlocks && integratedBlocks.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Integrated Maintenance Blocks</span>
                      <span className="text-xs bg-blue-100 text-[#1D4ED8] border border-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                        {integratedBlocks.length} Coordinated Blocks
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Multiple compatible departments performing parallel maintenance inside single shared corridor windows
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-800">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span>Total Separate Blocks Avoided: <strong>{integratedBlocks.reduce((s, b) => s + (b.separateBlocksAvoided || 0), 0)}</strong></span>
                  </div>
                </div>

                {/* Integrated Blocks Cards List */}
                <div className="space-y-4">
                  {integratedBlocks.map(ib => {
                    const isApproved = ib.status === 'Approved';
                    const isWhyOpen = expandedWhyIB[ib.id];

                    return (
                      <div 
                        key={ib.id} 
                        className="bg-white border-2 border-blue-200 rounded-xl p-5 space-y-4 hover:border-blue-400 transition-colors shadow-sm"
                      >
                        {/* Card Top Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 font-mono">
                              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-[#1D4ED8] font-extrabold text-sm border border-blue-300">
                                {ib.id}
                              </span>

                              {ib.creationMode === 'MANUAL' ? (
                                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 uppercase font-sans">
                                  MANUAL COORDINATION
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase font-sans">
                                  AUTO COORDINATED
                                </span>
                              )}

                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {ib.section}
                              </span>
                              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Available Block: <strong className="text-slate-900">{ib.blockId}</strong>
                              </span>
                              <span className="text-xs font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                Scheduled: {ib.start} – {ib.end} ({ib.durationMinutes} min)
                              </span>
                            </div>
                          </div>

                          {/* Department Tags & Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isApproved ? (
                              <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Approved (Dispatched)</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApproveIB(ib.id)}
                                className="px-4 py-2 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve Integrated Block</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedIB(ib)}
                              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </div>
                        </div>

                        {/* Included Activities Breakdown */}
                        <div className="space-y-2">
                          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                            Coordinated Activities ({(ib.activities || []).length} Work Streams):
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(ib.activities || []).map(act => (
                              <div 
                                key={act.requestId} 
                                className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-[#1D4ED8]">{act.requestId}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                    act.department === 'Engineering' ? 'bg-blue-100 text-[#1D4ED8]' :
                                    act.department === 'S&T' ? 'bg-teal-100 text-teal-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {act.department}
                                  </span>
                                </div>
                                <div className="font-semibold text-slate-900 truncate">{act.maintenanceType}</div>
                                <div className="text-[11px] text-slate-600 line-clamp-2">{act.description}</div>
                                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                                  <span>Duration: <strong>{act.durationMinutes}m</strong></span>
                                  <span>Resource: <strong>{act.resourceKey}</strong></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Operational Benefit & "Why were these requests combined?" */}
                        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3 font-mono text-[11px]">
                              <span className="text-slate-700">Requests Combined: <strong className="text-slate-900">{(ib.activities || []).length}</strong></span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-700">Blocks Used: <strong className="text-[#1D4ED8]">1</strong></span>
                              <span className="text-slate-400">•</span>
                              <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                Separate Blocks Avoided: +{ib.separateBlocksAvoided || 0}
                              </span>
                            </div>

                            <button
                              onClick={() => toggleWhy(ib.id)}
                              className="text-[#1D4ED8] hover:text-[#1E40AF] font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isWhyOpen ? 'Hide Rationale' : 'Why were these combined?'}</span>
                              {isWhyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Expandable Why Combined Details */}
                          {isWhyOpen && (
                            <div className="pt-2 border-t border-blue-200 space-y-2 animate-in fade-in">
                              <p className="text-slate-800 leading-relaxed font-sans">
                                {ib.explanation}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                                {(ib.factors || []).map((f, fIdx) => (
                                  <div key={fIdx} className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span><strong>{f.name}:</strong> {f.detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Schedule Timeline (Corridor Gantt) */}
            <TimelineGantt />

            {/* Individual Maintenance Assignments Section */}
            {individualScheduledRequests.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Individual Maintenance Assignments</span>
                    <span className="text-xs bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-mono">
                      {individualScheduledRequests.length} Single Requests
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Requests scheduled individually where multi-department integration was not applicable
                  </p>
                </div>

                <div className="space-y-3">
                  {individualScheduledRequests.map(req => (
                    <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900">{req.id}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{req.department}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{req.section}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={req.priority} />
                          <StatusBadge status={req.status} />
                          <button
                            onClick={() => handleQuickApproveIndividual(req.id)}
                            className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">Work Type:</span>
                          <span className="font-semibold text-slate-800">{req.title || req.maintenanceType}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Assigned Block & Time:</span>
                          <span className="font-mono font-bold text-[#1D4ED8]">
                            {req.recommendation?.recommendedBlockId} ({req.recommendation?.recommendedStart} – {req.recommendation?.recommendedEnd})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Resource:</span>
                          <span className="font-mono text-slate-700">{req.resourceKey}</span>
                        </div>
                      </div>

                      {req.recommendation?.explanation && (
                        <p className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 leading-relaxed">
                          {req.recommendation.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unscheduled Requests Section */}
            {unscheduledRequests.length > 0 && (
              <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-rose-100 pb-3">
                  <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>Unscheduled Maintenance Requests ({unscheduledRequests.length})</span>
                  </h3>
                  <p className="text-xs text-rose-700">
                    These requests could not be automatically placed in predefined maintenance blocks before deadline due to high train corridor saturation. Manual intervention is required.
                  </p>
                </div>

                <div className="space-y-3">
                  {unscheduledRequests.map(req => (
                    <div key={req.id} className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-rose-900">{req.id} ({req.department})</span>
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <div className="text-xs text-slate-700 font-medium">{req.title}</div>
                      <p className="text-[11px] text-rose-800 leading-relaxed font-mono">
                        {req.recommendation?.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Integrated Block Inspection Modal */}
      {selectedIB && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden p-6 space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2.5 py-0.5 rounded bg-[#1D4ED8] text-white font-extrabold text-sm">
                    {selectedIB.id}
                  </span>
                  <span className="text-[#1D4ED8] font-bold text-sm">Integrated Block Detailed Review</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Section: {selectedIB.section} • Block: {selectedIB.blockId} ({selectedIB.start}–{selectedIB.end})
                </p>
              </div>

              <button 
                onClick={() => setSelectedIB(null)}
                className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feature 2: Train Impact Analysis for the Integrated Block Window */}
            <TrainImpactAnalysisCard
              proposedBlock={{
                section: selectedIB.section,
                start: selectedIB.start,
                end: selectedIB.end,
                date: selectedIB.date || '2026-08-31',
                blockId: selectedIB.blockId
              }}
              trains={trains}
              availableBlocks={availableBlocks}
            />

            {/* Included Requests with Priority Validation Cards */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-700">
                Constituent Department Requests ({selectedIB.requestIds.length})
              </h4>

              {(selectedIB.requestIds || []).map(reqId => {
                const req = requests.find(r => r.id === reqId);
                if (!req) return null;

                return (
                  <div key={reqId} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900">{req.id} ({req.department})</span>
                      <span className="text-slate-600 font-semibold">{req.maintenanceType}</span>
                    </div>

                    {/* Feature 1: Priority Validation Card for each request */}
                    <PriorityValidationCard
                      request={req}
                      onUpdateApprovedPriority={updateApprovedPriority}
                      isControlOfficer={true}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedIB(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white font-bold text-xs shadow-sm hover:bg-[#1E40AF] cursor-pointer"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PlanningBoard;
