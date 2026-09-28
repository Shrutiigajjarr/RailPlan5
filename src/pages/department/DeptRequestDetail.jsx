import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import { ArrowLeft, CheckCircle2, Building2, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import PriorityValidationCard from '../../components/planner/PriorityValidationCard';

export const DeptRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, currentUser } = useRailPlan();

  const deptPrefix = currentUser?.portalPath || '/engineering';
  const request = requests.find(r => r.id === id);

  if (!request) {
    return (
      <Layout>
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-600 space-y-3 shadow-sm">
          <p className="text-base font-semibold">Request {id} not found.</p>
          <button 
            onClick={() => navigate(`${deptPrefix}/requests`)}
            className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Back to My Requests
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(`${deptPrefix}/requests`)}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Requests</span>
          </button>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Main Banner */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1D4ED8] mb-1">
              <Building2 className="w-4 h-4" />
              <span>DEPARTMENT: {request.department.toUpperCase()}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-mono">{request.id}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {request.title || request.maintenanceType} • Section: <span className="text-slate-900 font-semibold">{request.section}</span> ({request.blockOrTrack})
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl font-mono text-xs text-right">
            <span className="text-[10px] text-slate-500 block uppercase">Requested Window</span>
            <span className="font-bold text-[#1D4ED8]">{request.requestedDate}</span>
            <div className="text-slate-900">{request.requestedStart} – {request.requestedEnd} ({request.estimatedDurationMinutes}m)</div>
          </div>
        </div>

        {/* Lifecycle Progression */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <h4 className="text-xs font-semibold text-slate-600 mb-2">Request Lifecycle Progression</h4>
          <Timeline status={request.status} />
        </div>

        {/* Feature 1: Priority Validation Card */}
        <PriorityValidationCard 
          request={request}
          isControlOfficer={false}
        />

        {/* Decision Banner (If Approved) */}
        {request.decision && (
          <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  {request.decision.isIntegrated 
                    ? `MAINTENANCE BLOCK APPROVED (INTEGRATED ${request.decision.integratedBlockId || 'IB-001'})`
                    : 'MAINTENANCE BLOCK APPROVED'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded border border-emerald-300">
                Assigned Block: {request.decision.approvedBlockId || 'MB-204'}
              </span>
            </div>

            {request.decision.isIntegrated && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs space-y-1">
                <div className="font-bold text-[#1D4ED8] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                  <span>Coordination: Integrated Multi-Department Maintenance Block</span>
                </div>
                <div className="text-slate-700 font-mono">
                  Working alongside: <strong className="text-slate-900">{request.decision.coordinatedDepartments?.join(', ') || 'Peer Departments'}</strong> (Integrated Block: {request.decision.integratedBlockId})
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-xl border border-emerald-200 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Requested Window</span>
                <span className="text-slate-900">{request.requestedStart} – {request.requestedEnd}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Approved Window</span>
                <span className="text-emerald-700 font-bold">{request.decision.approvedStart} – {request.decision.approvedEnd}</span>
              </div>
            </div>

            <div className="text-xs text-slate-700">
              <span className="font-semibold text-emerald-800">Reason / Planning Rationale:</span> {request.decision.reason}
            </div>

            <div className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200">
              Approved By: <strong>{request.decision.decidedBy || 'Central Planning'}</strong> • Decided: {request.decision.decidedAt}
            </div>
          </div>
        )}

        {/* Recommendation (If available and not decided) */}
        {!request.decision && request.recommendation && (
          <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl space-y-2 text-xs shadow-sm">
            <div className="font-bold text-purple-700 flex items-center justify-between">
              <span>Planning Engine Proposed Recommendation</span>
              <span className="font-mono text-purple-600">{request.recommendation.status}</span>
            </div>
            <div className="font-mono text-slate-900">
              Recommended Window: {request.recommendation.recommendedStart} – {request.recommendation.recommendedEnd} (Block: {request.recommendation.recommendedBlockId || 'Pending'})
            </div>
            <p className="text-slate-700 leading-relaxed">{request.recommendation.explanation}</p>
          </div>
        )}

        {/* Operational Scope & Safety */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2">
              Work Description & Scope
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200">
              {request.description}
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500">Resource Allocated:</span>
                <p className="text-slate-900 font-mono font-medium mt-0.5">{request.resourceKey}</p>
              </div>
              <div>
                <span className="text-slate-500">Location:</span>
                <p className="text-slate-900 font-medium mt-0.5">{request.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2">
              Safety & Operational Notes
            </h3>

            <div className="space-y-2">
              {request.safetyRequirements?.map((saf, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saf}</span>
                </div>
              ))}
            </div>

            {request.operationalNotes && (
              <div className="text-xs text-slate-600 pt-2">
                <span className="font-semibold text-slate-900">Operational Notes:</span> {request.operationalNotes}
              </div>
            )}
          </div>
        </div>

        {/* Activity Audit Log */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
            Activity Audit History
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {request.activityLog?.map((log, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-start gap-3 text-slate-700">
                <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                <span>• {log.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default DeptRequestDetail;
