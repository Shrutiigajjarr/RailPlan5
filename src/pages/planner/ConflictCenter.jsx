import React from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import ConflictAlertCard from '../../components/planner/ConflictAlertCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Eye, ArrowRight } from 'lucide-react';

export const ConflictCenter = () => {
  const { requests } = useRailPlan();
  const navigate = useNavigate();

  const conflictRequests = requests.filter(r => r.conflicts && r.conflicts.length > 0);

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#B45309] mb-1">
              <AlertOctagon className="w-4 h-4" />
              <span>CENTRAL CONFLICT ANALYSIS</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Corridor Conflict Review</h2>
            <p className="text-xs text-slate-500 mt-1">
              Review maintenance requests with detected train movement or block capacity overlap
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-right font-mono text-xs">
            <span className="text-[10px] text-amber-700 block uppercase">Active Alerts</span>
            <span className="font-extrabold text-amber-900 text-lg">{conflictRequests.length}</span>
          </div>
        </div>

        {/* Conflict Items Grid */}
        {conflictRequests.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-emerald-700 text-xs font-semibold shadow-sm">
            Zero active corridor conflicts in system. All maintenance windows clear.
          </div>
        ) : (
          <div className="space-y-6">
            {conflictRequests.map(req => (
              <div key={req.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-[#1D4ED8]">{req.id}</span>
                      <span className="text-xs font-bold text-slate-700">({req.department})</span>
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{req.section} - {req.location}</h3>
                  </div>

                  <button
                    onClick={() => navigate(`/control/requests/${req.id}`)}
                    className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Inspect & Decide</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <ConflictAlertCard conflicts={req.conflicts} />

                {req.recommendation && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-[#1D4ED8]">Planning Engine Resolution Proposal:</div>
                    <div className="font-mono text-slate-900">
                      Recommended Shift: {req.recommendation.recommendedStart} – {req.recommendation.recommendedEnd} (Block: {req.recommendation.recommendedBlockId || 'MB-204'})
                    </div>
                    <p className="text-slate-700 pt-1">{req.recommendation.explanation}</p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ConflictCenter;
