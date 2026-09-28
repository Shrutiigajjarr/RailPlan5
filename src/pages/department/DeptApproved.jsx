import React from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import { Building2, CheckCircle2, Calendar, ShieldCheck, Clock, Download } from 'lucide-react';

export const DeptApproved = () => {
  const { currentUser, requests } = useRailPlan();

  const approvedBlocks = requests.filter(
    r => r.department === currentUser.department && (r.status === 'Approved' || r.status === 'Modified')
  );

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>APPROVED MAINTENANCE BLOCKS</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Confirmed Department Work Schedule</h2>
            <p className="text-xs text-slate-400 mt-1">
              Finalized maintenance windows issued by Central Planning System
            </p>
          </div>

          <button 
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Official Schedule</span>
          </button>
        </div>

        {/* Schedule List */}
        {approvedBlocks.length === 0 ? (
          <div className="bg-slate-950/90 border border-slate-800 p-12 text-center rounded-2xl text-slate-500 text-xs">
            No approved maintenance blocks found for {currentUser.department} department yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {approvedBlocks.map(block => (
              <div key={block.id} className="bg-slate-950/90 border border-emerald-500/40 p-5 rounded-2xl shadow-xl space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-emerald-400">{block.id}</span>
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-700 font-mono font-bold">
                        {block.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{block.section} ({block.trackLine})</h3>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs text-right">
                    <div className="text-slate-400 text-[10px]">Approved Maintenance Window</div>
                    <div className="font-bold text-emerald-300">
                      {block.decision?.approvedDate || block.requestedDate} • {block.decision?.approvedStart || block.requestedStart} – {block.decision?.approvedEnd || block.requestedEnd}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Location / Yard:</span>
                    <span className="font-medium text-slate-200">{block.location}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">Work Description:</span>
                    <span className="text-slate-300">{block.description}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">Assigned Resources:</span>
                    <span className="text-slate-300">{block.resourceRequirements}</span>
                  </div>
                </div>

                {/* Safety Precautions Box */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block mb-1">Mandatory Field Safety Precautions:</span>
                    <div className="flex flex-wrap gap-2">
                      {block.safetyRequirements.map((s, idx) => (
                        <span key={idx} className="bg-slate-950 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default DeptApproved;
