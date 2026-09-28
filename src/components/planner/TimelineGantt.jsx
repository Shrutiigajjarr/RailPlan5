import React, { useState } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import { Train, AlertOctagon, CheckCircle2, Clock, Eye, Info, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TimelineGantt = () => {
  const { sections, requests, trains, availableBlocks, integratedBlocks } = useRailPlan();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Convert "HH:MM" to percentage across 24h timeline
  const timeToPercentage = (timeStr) => {
    if (!timeStr) return 0;
    const clean = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr;
    const [h, m] = clean.split(':').map(Number);
    return (((h || 0) * 60 + (m || 0)) / (24 * 60)) * 100;
  };

  const getDeptColor = (dept, isApproved) => {
    if (isApproved) {
      if (dept === 'Engineering') return 'bg-[#1D4ED8] border-[#1E40AF] text-white';
      if (dept === 'S&T') return 'bg-teal-700 border-teal-800 text-white';
      return 'bg-[#B45309] border-[#92400E] text-white';
    }
    if (dept === 'Engineering') return 'bg-blue-600 border-blue-700 text-white';
    if (dept === 'S&T') return 'bg-teal-600 border-teal-700 text-white';
    return 'bg-amber-600 border-amber-700 text-white';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 overflow-x-auto">
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-4 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" />
            <span className="text-slate-600">Available Block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded border-2 border-blue-500 bg-blue-50 inline-block" />
            <span className="text-[#1D4ED8] font-bold">Integrated Block Container</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span className="text-blue-800">Engineering Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-600 inline-block" />
            <span className="text-teal-800">S&T Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-600 inline-block" />
            <span className="text-amber-800">Traction Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 inline-block" />
            <span className="text-rose-800 font-bold">Train Movement</span>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          24-Hour Corridor Schedule
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div className="min-w-[950px] space-y-3">
        
        {/* Timeline Hours Header */}
        <div className="flex items-center border-b border-slate-200 text-[10px] font-mono text-slate-500 pb-2">
          <div className="w-48 font-bold text-slate-900 shrink-0 uppercase tracking-wider">
            Corridor Section
          </div>
          <div className="flex-1 grid grid-cols-24 gap-0 text-center">
            {hours.map(h => (
              <div key={h} className="border-r border-slate-200 font-semibold">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Section Rows */}
        {sections.map(section => {
          const sectionReqs = requests.filter(r => r.section === section.id && r.status !== 'Rejected' && r.status !== 'Deferred');
          const sectionTrains = trains.filter(t => t.section === section.id);
          const sectionBlocks = availableBlocks.filter(b => b.section === section.id);
          const sectionIBs = (integratedBlocks || []).filter(ib => ib.section === section.id);

          return (
            <div key={section.id} className="flex items-center bg-white border border-slate-200 rounded-xl p-2 hover:bg-slate-50 transition-colors relative">
              
              {/* Y-Axis Section Label */}
              <div className="w-48 shrink-0 pr-3">
                <div className="font-bold text-xs text-slate-900 font-mono">{section.id} ({section.code})</div>
                <div className="text-[10px] text-slate-500 truncate">{section.name}</div>
              </div>

              {/* 24-Hour Spans Track */}
              <div className="flex-1 h-24 relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                
                {/* Hourly Vertical Guide Lines */}
                <div className="absolute inset-0 grid grid-cols-24 gap-0 pointer-events-none">
                  {hours.map(h => (
                    <div key={h} className="border-r border-slate-200" />
                  ))}
                </div>

                {/* Available Maintenance Blocks (Base Layer) */}
                {sectionBlocks.map(block => {
                  const leftPct = timeToPercentage(block.availableFrom);
                  const rightPct = timeToPercentage(block.availableUntil);
                  const widthPct = Math.max(rightPct - leftPct, 2);

                  return (
                    <div
                      key={block.blockId}
                      className="absolute top-1 bottom-1 bg-slate-100/80 border border-slate-300/80 rounded flex flex-col justify-start p-1 pointer-events-none z-0"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      <span className="text-[8px] font-mono text-slate-500 truncate">{block.blockId}</span>
                    </div>
                  );
                })}

                {/* Integrated Maintenance Block Enclosing Containers */}
                {sectionIBs.map(ib => {
                  const leftPct = timeToPercentage(ib.start);
                  const rightPct = timeToPercentage(ib.end);
                  const widthPct = Math.max(rightPct - leftPct, 4);

                  return (
                    <div
                      key={ib.id}
                      onMouseEnter={() => setHoveredItem({ type: 'ib', data: ib })}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="absolute top-6 bottom-1 border-2 border-blue-500 bg-blue-50/70 rounded-lg z-15 flex flex-col justify-between p-1 transition-all shadow-sm"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      <div className="flex items-center justify-between text-[8px] font-mono font-bold text-[#1D4ED8] truncate">
                        <span>{ib.id}</span>
                        <span className="hidden sm:inline text-[7px] bg-blue-100 px-1 rounded border border-blue-200">{ib.departments.join('+')}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Train Movements (Layer 1) */}
                {sectionTrains.map(t => {
                  const leftPct = timeToPercentage(t.start);
                  const rightPct = timeToPercentage(t.end);
                  const widthPct = Math.max(rightPct - leftPct, 3.5);

                  return (
                    <div
                      key={t.trainId}
                      onMouseEnter={() => setHoveredItem({ type: 'train', data: t })}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="absolute top-1 h-4 bg-rose-50 border border-rose-300 text-rose-800 text-[8px] font-mono px-1 rounded flex items-center gap-1 overflow-hidden z-10 shadow cursor-help"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      <Train className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                      <span className="truncate">{t.trainId} {t.name} ({t.start}–{t.end})</span>
                    </div>
                  );
                })}

                {/* Maintenance Request Activity Bars (Layer 2) */}
                {sectionReqs.map((req, idx) => {
                  const startTime = req.decision?.approvedStart || req.recommendation?.recommendedStart || req.requestedStart;
                  const endTime = req.decision?.approvedEnd || req.recommendation?.recommendedEnd || req.requestedEnd;
                  
                  const leftPct = timeToPercentage(startTime);
                  const rightPct = timeToPercentage(endTime);
                  let widthPct = rightPct - leftPct;
                  if (widthPct <= 0) widthPct = 5;

                  const isApproved = req.status === 'Approved';
                  const colorClass = getDeptColor(req.department, isApproved);
                  const isPartofIB = req.recommendation?.isIntegrated || req.decision?.isIntegrated;
                  
                  // If part of IB, stagger vertical offset slightly inside the IB container
                  const topOffset = isPartofIB ? 9 + ((idx % 3) * 4) : 9;

                  return (
                    <div
                      key={req.id}
                      onClick={() => navigate(`/control/requests/${req.id}`)}
                      onMouseEnter={() => setHoveredItem({ type: 'request', data: req })}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`absolute ${colorClass} px-1.5 rounded text-[9px] font-mono font-bold flex items-center justify-between cursor-pointer border shadow hover:scale-102 transition-all z-20`}
                      style={{ 
                        left: `${leftPct}%`, 
                        width: `${widthPct}%`, 
                        top: `${topOffset * 2}px`,
                        height: '18px'
                      }}
                    >
                      <span className="truncate">{req.id} ({req.department.slice(0, 3)})</span>
                    </div>
                  );
                })}

              </div>

            </div>
          );
        })}

      </div>

      {/* Hover Tooltip Banner */}
      {hoveredItem && (
        <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs text-slate-700 shadow-lg animate-in fade-in">
          {hoveredItem.type === 'request' ? (
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-[#1D4ED8]">{hoveredItem.data.id}</span>
              <span>Dept: <strong className="text-slate-900">{hoveredItem.data.department}</strong></span>
              <span>Priority: <strong className="text-[#B45309]">{hoveredItem.data.priority}</strong></span>
              <span>Status: <strong className="text-[#15803D]">{hoveredItem.data.status}</strong></span>
              <span>Timing: <strong className="font-mono text-[#1D4ED8]">{hoveredItem.data.requestedStart} – {hoveredItem.data.requestedEnd}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-[#B91C1C]">TRAIN {hoveredItem.data.trainId}</span>
              <span>Name: <strong className="text-slate-900">{hoveredItem.data.name}</strong></span>
              <span>Section: <strong className="text-slate-900">{hoveredItem.data.section}</strong></span>
              <span>Corridor Slot: <strong className="font-mono text-[#B91C1C]">{hoveredItem.data.start} – {hoveredItem.data.end}</strong></span>
            </div>
          )}

          {hoveredItem.type === 'request' && (
            <div className="flex items-center gap-1 text-[11px] text-[#1D4ED8] font-semibold cursor-pointer">
              <span>Click to open decision suite</span>
              <Eye className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineGantt;
