import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import ExplainableCard from '../../components/planner/ExplainableCard';
import ConflictAlertCard from '../../components/planner/ConflictAlertCard';
import ApprovalModal from '../../components/planner/ApprovalModal';
import PriorityValidationCard from '../../components/planner/PriorityValidationCard';
import TrainImpactAnalysisCard from '../../components/planner/TrainImpactAnalysisCard';
import { 
  Cpu, 
  ArrowLeft, 
  CheckCircle2, 
  Edit3, 
  PauseCircle, 
  XCircle, 
  Train, 
  Clock, 
  ShieldCheck, 
  Building2,
  ArrowRight,
  Layers
} from 'lucide-react';

export const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    requests, 
    integratedBlocks,
    trains,
    availableBlocks,
    approveRequest, 
    updateApprovedPriority,
    modifyRequest, 
    deferRequest, 
    rejectRequest
  } = useRailPlan();

  const [modalType, setModalType] = useState(null); // 'modify' | 'defer' | 'reject' | null
  const [successNotice, setSuccessNotice] = useState(null);

  const request = requests.find(r => r.id === id);

  if (!request) {
    return (
      <Layout>
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-600 space-y-3 shadow-sm">
          <p className="text-base font-semibold">Request {id} not found in central repository.</p>
          <button 
            onClick={() => navigate('/control/requests')}
            className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
          >
            Return to Requests Queue
          </button>
        </div>
      </Layout>
    );
  }

  const parentIb = integratedBlocks.find(ib => 
    ib.requestIds?.includes(request.id) || 
    ib.id === request.recommendation?.integratedBlockId || 
    ib.id === request.decision?.integratedBlockId
  );

  const handleApproveDirect = () => {
    approveRequest(request.id);
    setSuccessNotice(`Request ${request.id} APPROVED! Maintenance block assigned and decision dispatched to ${request.department} Portal.`);
  };

  const handleModalSubmit = (payload) => {
    if (modalType === 'modify') {
      modifyRequest(request.id, payload);
      setSuccessNotice(`Schedule MODIFIED for ${request.id}. Decision propagated to ${request.department} Portal.`);
    } else if (modalType === 'defer') {
      deferRequest(request.id, payload.reason);
      setSuccessNotice(`Request ${request.id} DEFERRED. Notification dispatched to ${request.department}.`);
    } else if (modalType === 'reject') {
      rejectRequest(request.id, payload.reason);
      setSuccessNotice(`Request ${request.id} REJECTED. Notification dispatched to ${request.department}.`);
    }
    setModalType(null);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/control/requests')}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Incoming Queue</span>
          </button>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Success Action Notification Banner */}
        {successNotice && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successNotice}</span>
            </div>
          </div>
        )}

        {/* Main Request Header Banner */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1D4ED8] mb-1">
              <Building2 className="w-4 h-4" />
              <span>ORIGINATING DEPARTMENT: {request.department.toUpperCase()}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-mono">{request.id}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {request.title} • Section: <span className="text-slate-900 font-semibold">{request.section}</span> • Line: {request.blockOrTrack || 'Up Line'} • Resource: <span className="font-mono text-[#1D4ED8]">{request.resourceKey}</span>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl font-mono text-xs text-right">
            <span className="text-[10px] text-slate-500 block uppercase">Requested Window</span>
            <span className="font-bold text-[#1D4ED8]">{request.requestedDate}</span>
            <div className="text-slate-900">{request.requestedStart} – {request.requestedEnd} ({request.estimatedDurationMinutes}m)</div>
          </div>
        </div>

        {/* Request Lifecycle Timeline */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <h4 className="text-xs font-semibold text-slate-600 mb-2">Request Lifecycle Progression</h4>
          <Timeline status={request.status} />
        </div>

        {/* FEATURE 1: Priority Validation & Reassessment Card */}
        <PriorityValidationCard 
          request={request}
          onUpdateApprovedPriority={updateApprovedPriority}
          isControlOfficer={true}
        />

        {/* FEATURE 2: Train Impact Analysis Card for Proposed Block */}
        <TrainImpactAnalysisCard
          proposedBlock={{
            section: request.recommendation?.recommendedSection || request.section,
            start: request.decision?.approvedStart || request.recommendation?.recommendedStart || request.requestedStart,
            end: request.decision?.approvedEnd || request.recommendation?.recommendedEnd || request.requestedEnd,
            date: request.decision?.approvedDate || request.recommendation?.recommendedDate || request.requestedDate || '2026-08-31',
            blockId: request.decision?.approvedBlockId || request.recommendation?.recommendedBlockId || 'MB-PROP'
          }}
          trains={trains}
          availableBlocks={availableBlocks}
        />

        {/* Integrated Block Banner if request is part of an Integrated Block */}
        {(request.recommendation?.isIntegrated || request.decision?.isIntegrated || parentIb) && (
          <div className="bg-blue-50 border-2 border-blue-300 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-200 pb-2.5">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2.5 py-0.5 rounded bg-[#1D4ED8] text-white font-extrabold text-xs">
                  {request.decision?.integratedBlockId || request.recommendation?.integratedBlockId || parentIb?.id || 'IB-001'}
                </span>
                <span className="text-sm font-bold text-slate-900 font-sans">Coordinated Integrated Maintenance Block</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded border border-purple-300 uppercase">
                  {parentIb?.creationMode === 'MANUAL' ? 'Manual Coordination' : 'Automatic Planning Engine'}
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-300">
                  Parallel Execution
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-white p-3 rounded-xl border border-blue-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Coordinated Departments:</span>
                <span className="text-[#1D4ED8] font-bold">
                  {(request.decision?.coordinatedDepartments || request.recommendation?.coordinatedDepartments || parentIb?.departments || []).join(', ') || 'S&T, Traction Distribution'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Assigned Maintenance Block:</span>
                <span className="text-slate-900 font-bold">
                  {request.decision?.approvedBlockId || request.recommendation?.recommendedBlockId || parentIb?.blockId} ({request.section})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Coordinated Time Window:</span>
                <span className="text-[#1D4ED8] font-bold">
                  {request.decision?.approvedStart || request.recommendation?.recommendedStart || parentIb?.start} – {request.decision?.approvedEnd || request.recommendation?.recommendedEnd || parentIb?.end}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              <strong className="text-[#1D4ED8]">Why Combined?</strong> {request.recommendation?.explanation || parentIb?.explanation}
            </p>
          </div>
        )}

        {/* Central Control Decision Suite */}
        <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#1D4ED8]" />
              <h3 className="font-bold text-slate-900 text-sm">Central Control Decision Suite</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Authorized Role: Central Planning & Coordination
            </span>
          </div>

          {/* Decision Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <button
              onClick={handleApproveDirect}
              className="py-3 px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Slot</span>
            </button>

            <button
              onClick={() => setModalType('modify')}
              className="py-3 px-4 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modify Schedule</span>
            </button>

            <button
              onClick={() => setModalType('defer')}
              className="py-3 px-4 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Defer Request</span>
            </button>

            <button
              onClick={() => setModalType('reject')}
              className="py-3 px-4 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Request</span>
            </button>
          </div>
        </div>

        {/* Explainability Engine Card */}
        {request.recommendation && (
          <ExplainableCard recommendation={request.recommendation} request={request} />
        )}

        {/* Conflicts Alert Card */}
        {request.conflicts && request.conflicts.length > 0 && (
          <ConflictAlertCard conflicts={request.conflicts} />
        )}

        {/* Request Specifications Detail Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            Full Maintenance Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Location / Milepost:</span>
              <span className="font-semibold text-slate-800">{request.location}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Submitted By Officer:</span>
              <span className="font-semibold text-slate-800">{request.submittedBy}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Operational Deadline:</span>
              <span className="font-mono font-bold text-amber-700">{request.deadline}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Assigned Resource Gang:</span>
              <span className="font-mono font-semibold text-slate-800">{request.resourceKey}</span>
            </div>

            <div className="md:col-span-2 space-y-1">
              <span className="text-slate-500 block">Detailed Scope & Description:</span>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-sans">
                {request.description}
              </p>
            </div>

            {request.operationalNotes && (
              <div className="md:col-span-2 space-y-1">
                <span className="text-slate-500 block">Operational Notes / Speed Restrictions:</span>
                <p className="text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200 leading-relaxed font-sans">
                  {request.operationalNotes}
                </p>
              </div>
            )}

            <div className="md:col-span-2 space-y-1">
              <span className="text-slate-500 block mb-1">Mandatory Field Safety Protocols:</span>
              <div className="flex flex-wrap gap-2">
                {request.safetyRequirements?.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {modalType && (
          <ApprovalModal
            type={modalType}
            request={request}
            onClose={() => setModalType(null)}
            onSubmit={handleModalSubmit}
          />
        )}

      </div>
    </Layout>
  );
};

export default RequestDetail;
