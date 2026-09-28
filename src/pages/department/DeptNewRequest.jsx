import React, { useState } from 'react';
import { useRailPlan } from '../../context/RailPlanContext';
import Layout from '../../components/layout/Layout';
import { generateNextRequestId } from '../../utils/idGenerator';
import { calculateDurationMinutes, formatDurationString } from '../../utils/dateUtils';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PlusCircle, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  ShieldAlert, 
  Clock, 
  Cpu,
  Calendar,
  Layers,
  Wrench,
  AlertCircle
} from 'lucide-react';

export const DeptNewRequest = () => {
  const { currentUser, sections, submitRequest, requests, resources } = useRailPlan();
  const navigate = useNavigate();
  const location = useLocation();

  const userDept = currentUser?.department || 'Engineering';
  const deptPrefix = currentUser?.portalPath || '/engineering';
  const availableResources = resources[userDept] || [];

  const previewId = generateNextRequestId(requests);

  const defaultType = userDept === 'S&T' ? 'Signal Interlocking' :
                      userDept === 'Traction Distribution' ? 'OHE Maintenance' : 'Track Renewal';

  const [formData, setFormData] = useState({
    title: '',
    section: sections[0]?.id || 'SEC-01',
    blockOrTrack: 'Up Line',
    location: 'Km 114/2 - Viramgam Outer',
    resourceKey: availableResources[0]?.key || 'ENG_TRACK_TEAM_1',
    maintenanceType: defaultType,
    description: '',
    priority: 'CRITICAL',
    requestedDate: '2026-08-31',
    requestedStart: '10:00',
    requestedEnd: '12:00',
    estimatedDurationMinutes: 120,
    deadline: '2026-08-31 18:00',
    operationalNotes: 'Caution order required during execution.',
    safetyRequirements: ['Speed Restriction 30 km/h', 'Lookout Men Deployed']
  });

  const [submittedReq, setSubmittedReq] = useState(null);
  const [errors, setErrors] = useState({});

  const duration = calculateDurationMinutes(formData.requestedStart, formData.requestedEnd);

  const availableSafetyOptions = [
    '25kV Power Block Mandatory',
    'Speed Restriction 30 km/h',
    'Speed Restriction 20 km/h',
    'Lookout Men Deployed',
    'Earthing Rods Installed',
    'Signal Neutral Section Active',
    'Station Master Point Lock'
  ];

  const handleSafetyToggle = (opt) => {
    setFormData(prev => {
      const exists = prev.safetyRequirements.includes(opt);
      if (exists) {
        return { ...prev, safetyRequirements: prev.safetyRequirements.filter(s => s !== opt) };
      } else {
        return { ...prev, safetyRequirements: [...prev.safetyRequirements, opt] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setErrors({ description: 'Work description is mandatory.' });
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim() || `${formData.maintenanceType} on ${formData.section}`,
      estimatedDurationMinutes: duration
    };

    const created = submitRequest(payload);
    setSubmittedReq(created);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1D4ED8] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{userDept.toUpperCase()} DEPARTMENT MAINTENANCE PORTAL</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Create New Maintenance Request</h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit maintenance block requirement for Central Control analysis and slot recommendation
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-right font-mono shrink-0">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Dynamic Request ID</span>
            <span className="text-sm font-bold text-[#1D4ED8]">{previewId}</span>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          
          {/* Section 1: Department & Request Scope */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                1. Department & Basic Scope
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Department: {userDept} (Derived from Login)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Title / Subject</label>
                <input 
                  type="text"
                  placeholder="e.g. Critical Track De-stressing & Sleeper Renewal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Type</label>
                <select 
                  value={formData.maintenanceType}
                  onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                >
                  {userDept === 'Engineering' && (
                    <>
                      <option>Track Renewal</option>
                      <option>Track Maintenance</option>
                      <option>Bridge Repair</option>
                      <option>Level Crossing Work</option>
                      <option>Deep Ballast Screening</option>
                    </>
                  )}
                  {userDept === 'S&T' && (
                    <>
                      <option>Signal Interlocking</option>
                      <option>Signal Maintenance</option>
                      <option>Axle Counter Tuning</option>
                      <option>OFC & Telecom Work</option>
                      <option>Point Machine Calibration</option>
                    </>
                  )}
                  {userDept === 'Traction Distribution' && (
                    <>
                      <option>OHE Inspection</option>
                      <option>OHE Maintenance</option>
                      <option>Power-related Maintenance</option>
                      <option>Traction Substation Testing</option>
                      <option>Overhead Wire Tuning</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Route & Asset Identification */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2 mb-4">
              2. Route, Location & Resource
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corridor Section</label>
                <select 
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                >
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.id} ({sec.code} - {sec.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Track / Block Line</label>
                <select 
                  value={formData.blockOrTrack}
                  onChange={(e) => setFormData({ ...formData, blockOrTrack: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                >
                  <option>Up Line</option>
                  <option>Down Line</option>
                  <option>Both Lines</option>
                  <option>Yard Siding</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designated Resource (Team/Machinery)</label>
                <select 
                  value={formData.resourceKey}
                  onChange={(e) => setFormData({ ...formData, resourceKey: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none font-mono"
                >
                  {availableResources.map(res => (
                    <option key={res.key} value={res.key}>
                      {res.key} - {res.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Location / Yard / KM Post</label>
              <input 
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Km 114/2 - Viramgam Outer"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Requested Window & Priority */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2 mb-4">
              3. Window Timing, Priority & Deadline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Date</label>
                <input 
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Start</label>
                <input 
                  type="time"
                  value={formData.requestedStart}
                  onChange={(e) => setFormData({ ...formData, requestedStart: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred End</label>
                <input 
                  type="time"
                  value={formData.requestedEnd}
                  onChange={(e) => setFormData({ ...formData, requestedEnd: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Emergency / Safety Hazard)</option>
                  <option value="HIGH">HIGH (Pre-audit / Monsoon Mandate)</option>
                  <option value="MEDIUM">MEDIUM (Scheduled Maintenance)</option>
                  <option value="LOW">LOW (Preventive Inspection)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hard Completion Deadline</label>
                <input 
                  type="text"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="e.g. 2026-08-31 18:00"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end pt-5">
                <span className="text-xs font-mono text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl">
                  Calculated Duration: {formatDurationString(duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Detailed Description & Notes */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2 mb-4">
              4. Work Description & Operational Notes
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Scope of Maintenance Work <span className="text-red-600">*</span>
                </label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) setErrors({});
                  }}
                  placeholder="Describe track assets, machinery deployed, and technical justification..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                />
                {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operational & Traffic Regulation Notes</label>
                <input 
                  type="text"
                  value={formData.operationalNotes}
                  onChange={(e) => setFormData({ ...formData, operationalNotes: e.target.value })}
                  placeholder="e.g. Caution order 30 km/h; freight regulation at outer siding."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Safety Precautions</label>
                <div className="flex flex-wrap gap-2">
                  {availableSafetyOptions.map(opt => {
                    const isChecked = formData.safetyRequirements.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSafetyToggle(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50 text-blue-800 border-[#1D4ED8] shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}{opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(deptPrefix)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Request to Central Control</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submission Success Confirmation Modal */}
      {submittedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-xl">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Maintenance Request Submitted</h3>
              <p className="text-xs text-slate-500">
                Successfully logged in Central Planning System canonical store.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Generated Request ID:</span>
                <span className="font-bold text-[#1D4ED8]">{submittedReq.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Originating Department:</span>
                <span className="text-slate-900 font-bold">{submittedReq.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Corridor Section:</span>
                <span className="text-slate-900">{submittedReq.section} ({submittedReq.blockOrTrack})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Resource:</span>
                <span className="text-slate-900">{submittedReq.resourceKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Timing:</span>
                <span className="text-slate-900">{submittedReq.requestedDate} ({submittedReq.requestedStart} – {submittedReq.requestedEnd})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority & Deadline:</span>
                <span className="font-bold text-amber-700">{submittedReq.priority} • Deadline: {submittedReq.deadline}</span>
              </div>
            </div>

            {/* Cross-Portal Connectivity Banner */}
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl flex items-start gap-3">
              <Cpu className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 leading-relaxed">
                <span className="font-bold block mb-0.5">Instant Central Planning Ingestion</span>
                This request is now visible in the Central Control queue under <span className="font-mono text-blue-900 font-bold">{submittedReq.id}</span> ready for conflict analysis and planning engine slot generation.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => navigate(`${deptPrefix}/requests`)}
                className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View in My Requests</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DeptNewRequest;
