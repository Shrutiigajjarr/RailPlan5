import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  INITIAL_REQUESTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SECTIONS, 
  AVAILABLE_BLOCKS, 
  MOCK_TRAINS, 
  DEPARTMENT_RESOURCES,
  DEPARTMENTS 
} from '../data/mockData';
import { generateNextRequestId } from '../utils/idGenerator';
import { formatISTDateTime, calculateDurationMinutes } from '../utils/dateUtils';
import { 
  runPlanningEngine, 
  checkIntegrationCompatibility, 
  findCompatibleCandidateRequests, 
  buildManualIntegratedBlock 
} from '../utils/planningEngine';
import { evaluatePriorityValidation } from '../utils/priorityValidator';
import { crossTabSync, SYNC_EVENTS } from '../services/crossTabSync';
import { 
  getSessionUser, 
  setSessionUser, 
  clearSessionUser, 
  getStoredRequests, 
  saveStoredRequests, 
  getStoredIntegratedBlocks, 
  saveStoredIntegratedBlocks, 
  getStoredPlanningMetrics, 
  saveStoredPlanningMetrics, 
  getStoredNotifications, 
  saveStoredNotifications, 
  resetSharedCanonicalData 
} from '../services/storageRepository';

const RailPlanContext = createContext(null);

export const PERSONAS = {
  engineering: {
    id: 'engineering',
    username: 'engineering_demo',
    email: 'engineering@railplan.demo',
    name: 'S. K. Sharma',
    role: 'DEPARTMENT',
    department: 'Engineering',
    title: 'Senior Divisional Engineer (Sr. DEN/Co)',
    division: 'Western Railway • Ahmedabad (ADI) Division',
    portalPath: '/engineering',
    badgeColor: 'bg-blue-50 text-[#1D4ED8] border-blue-200'
  },
  's-and-t': {
    id: 's-and-t',
    username: 'st_demo',
    email: 'st@railplan.demo',
    name: 'V. P. Namboodiri',
    role: 'DEPARTMENT',
    department: 'S&T',
    title: 'Senior Divisional Signal & Telecom Engineer (Sr. DSTE)',
    division: 'Western Railway • Ahmedabad (ADI) Division',
    portalPath: '/s-and-t',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  traction: {
    id: 'traction',
    username: 'traction_demo',
    email: 'traction@railplan.demo',
    name: 'A. K. Mehta',
    role: 'DEPARTMENT',
    department: 'Traction Distribution',
    title: 'Senior Divisional Electrical Engineer (Sr. DEE/TRD)',
    division: 'Western Railway • Vadodara (BRC) Division',
    portalPath: '/traction',
    badgeColor: 'bg-amber-50 text-[#B45309] border-amber-200'
  },
  control: {
    id: 'control',
    username: 'control_demo',
    email: 'control@railplan.demo',
    name: 'R. K. Verma',
    role: 'CONTROL',
    department: 'Central Control',
    title: 'Chief Transport Planning Manager (CTPM)',
    division: 'Western Railway Headquarters',
    portalPath: '/control',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  }
};

export const RailPlanProvider = ({ children }) => {
  // 1. Tab-Isolated Authentication via sessionStorage
  const [currentUser, setCurrentUser] = useState(() => {
    return getSessionUser();
  });

  // 2. Canonical Shared Application Data via localStorage
  const [requests, setRequests] = useState(() => {
    return getStoredRequests();
  });

  const [integratedBlocks, setIntegratedBlocks] = useState(() => {
    return getStoredIntegratedBlocks();
  });

  const [planningMetrics, setPlanningMetrics] = useState(() => {
    return getStoredPlanningMetrics();
  });

  const [notifications, setNotifications] = useState(() => {
    return getStoredNotifications();
  });

  // 3. Live Real-time Toasts
  const [toasts, setToasts] = useState([]);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [availableBlocks] = useState(AVAILABLE_BLOCKS);
  const [trains] = useState(MOCK_TRAINS);
  const [sections] = useState(INITIAL_SECTIONS);

  // Toast Management
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type, title, message, meta, duration = 4500 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, type, title, message, meta };
    setToasts(prev => [newToast, ...prev.slice(0, 3)]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Handle incoming cross-tab broadcast notifications
  const handleCrossTabEvent = useCallback((event) => {
    if (!event || !event.type) return;

    // Refresh React states with canonical data from storage (Single Source of Truth)
    const freshRequests = getStoredRequests();
    const freshBlocks = getStoredIntegratedBlocks();
    const freshMetrics = getStoredPlanningMetrics();
    const freshNotifs = getStoredNotifications();

    setRequests(freshRequests);
    setIntegratedBlocks(freshBlocks);
    setPlanningMetrics(freshMetrics);
    setNotifications(freshNotifs);

    const user = currentUserRef.current;

    // Trigger context-aware live toasts
    switch (event.type) {
      case SYNC_EVENTS.REQUEST_CREATED: {
        const isControl = user?.role === 'CONTROL';
        const dept = event.meta?.department || 'Department';
        const reqId = event.meta?.requestId || event.entityId || 'New Request';
        const section = event.meta?.section || '';
        const priority = event.meta?.priority || '';

        if (isControl) {
          addToast({
            type: SYNC_EVENTS.REQUEST_CREATED,
            title: `Incoming ${dept} Request`,
            message: `${dept} submitted ${reqId} on ${section}. Queue updated live.`,
            meta: { requestId: reqId, department: dept, priority }
          });
        } else if (user?.department !== dept) {
          addToast({
            type: SYNC_EVENTS.REQUEST_CREATED,
            title: 'New Maintenance Request Logged',
            message: `${dept} submitted request ${reqId} (${section}).`,
            meta: { requestId: reqId, department: dept, priority }
          });
        }
        break;
      }

      case SYNC_EVENTS.PLAN_APPROVED: {
        const reqId = event.entityId;
        const targetDept = event.targetDept;
        const blockId = event.meta?.blockId;

        if (user?.department === targetDept) {
          addToast({
            type: SYNC_EVENTS.PLAN_APPROVED,
            title: 'Maintenance Block Approved!',
            message: `Central Control APPROVED ${reqId}${blockId ? ` (Block ${blockId})` : ''}. Schedule confirmed.`,
            meta: { requestId: reqId, department: targetDept }
          });
        } else if (user?.role === 'CONTROL') {
          addToast({
            type: SYNC_EVENTS.PLAN_APPROVED,
            title: 'Decision Synchronized',
            message: `Approval for ${reqId} dispatched and synchronized.`,
            meta: { requestId: reqId }
          });
        }
        break;
      }

      case SYNC_EVENTS.INTEGRATED_BLOCK_CREATED: {
        const ibId = event.entityId;
        const section = event.meta?.section || 'Corridor';
        const depts = event.meta?.departments || [];

        if (user?.role === 'CONTROL' || (user?.department && depts.includes(user.department))) {
          addToast({
            type: SYNC_EVENTS.INTEGRATED_BLOCK_CREATED,
            title: 'Integrated Block Available',
            message: `Integrated Maintenance Block ${ibId} (${section}) coordinated for ${depts.join(' + ')}.`,
            meta: { requestId: ibId }
          });
        }
        break;
      }

      case SYNC_EVENTS.PLAN_GENERATED: {
        if (user?.role === 'CONTROL') {
          addToast({
            type: SYNC_EVENTS.PLAN_GENERATED,
            title: 'Coordinated Plan Generated',
            message: `Planning Engine scheduled ${event.meta?.totalScheduled || 'all'} requests across corridor sections.`
          });
        }
        break;
      }

      case SYNC_EVENTS.PLAN_MODIFIED: {
        if (user?.department === event.targetDept) {
          addToast({
            type: SYNC_EVENTS.PLAN_MODIFIED,
            title: 'Maintenance Window Adjusted',
            message: `Central Control modified schedule timing for ${event.entityId}.`,
            meta: { requestId: event.entityId }
          });
        }
        break;
      }

      case SYNC_EVENTS.REQUEST_DEFERRED: {
        if (user?.department === event.targetDept) {
          addToast({
            type: SYNC_EVENTS.REQUEST_DEFERRED,
            title: 'Request Deferred',
            message: `Request ${event.entityId} was deferred by Central Control.`,
            meta: { requestId: event.entityId }
          });
        }
        break;
      }

      case SYNC_EVENTS.REQUEST_REJECTED: {
        if (user?.department === event.targetDept) {
          addToast({
            type: SYNC_EVENTS.REQUEST_REJECTED,
            title: 'Request Rejected',
            message: `Request ${event.entityId} was rejected by Central Control.`,
            meta: { requestId: event.entityId }
          });
        }
        break;
      }

      case SYNC_EVENTS.DEMO_DATA_RESET: {
        addToast({
          type: SYNC_EVENTS.DEMO_DATA_RESET,
          title: 'Prototype Reset',
          message: 'All prototype maintenance requests and plans reset to initial demo state.'
        });
        break;
      }

      default:
        break;
    }
  }, [addToast]);

  // Subscribe to Cross-Tab synchronization events on mount
  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe(handleCrossTabEvent);
    return () => {
      unsubscribe();
    };
  }, [handleCrossTabEvent]);

  // ================= TAB-ISOLATED AUTH ACTIONS =================
  const login = (personaKey) => {
    if (PERSONAS[personaKey]) {
      const user = PERSONAS[personaKey];
      setSessionUser(user);
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    clearSessionUser();
    setCurrentUser(null);
  };

  const switchUser = (personaKey) => {
    return login(personaKey);
  };

  // ================= NOTIFICATION HELPERS =================
  const addNotification = (notifData) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetDept: notifData.targetDept,
      requestId: notifData.requestId,
      type: notifData.type,
      title: notifData.title,
      message: notifData.message,
      timestamp: formatISTDateTime(),
      read: false
    };

    const currentNotifs = getStoredNotifications();
    const updated = [newNotif, ...currentNotifs];
    saveStoredNotifications(updated);
    setNotifications(updated);
    return newNotif;
  };

  const markNotificationRead = (id) => {
    const currentNotifs = getStoredNotifications();
    const updated = currentNotifs.map(n => n.id === id ? { ...n, read: true } : n);
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const currentNotifs = getStoredNotifications();
    const updated = currentNotifs.map(n => ({ ...n, read: true }));
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  // ================= CANONICAL SHARED MUTATION ACTIONS =================

  // 1. Submit New Maintenance Request (Originating Department)
  const submitRequest = (formData) => {
    const currentStoredRequests = getStoredRequests();
    const newId = generateNextRequestId(currentStoredRequests);
    const nowStamp = formatISTDateTime();
    const duration = formData.estimatedDurationMinutes || calculateDurationMinutes(formData.requestedStart, formData.requestedEnd) || 120;
    const userDept = currentUser?.department || 'Engineering';

    const reqPriority = (formData.priority || 'MEDIUM').toUpperCase();
    const priorityEvidence = formData.priorityEvidence || {
      assetCriticality: formData.assetCriticality || (reqPriority === 'CRITICAL' ? 'CRITICAL' : reqPriority === 'HIGH' ? 'HIGH' : 'MEDIUM'),
      overdueDays: formData.overdueDays !== undefined ? formData.overdueDays : 10,
      maintenanceUrgency: formData.maintenanceUrgency || (reqPriority === 'CRITICAL' ? 'SAFETY_MANDATE' : 'PREVENTIVE'),
      operationalImpact: formData.operationalImpact || 'HIGH_TRAFFIC_CORRIDOR',
      assetAvailability: formData.assetAvailability || 'PARTIAL_REDUNDANCY'
    };

    const initialEval = evaluatePriorityValidation({
      requestedPriority: reqPriority,
      priority: reqPriority,
      priorityEvidence
    });

    const newRequest = {
      id: newId,
      title: formData.title || `${formData.maintenanceType} on ${formData.section}`,
      department: userDept,
      submittedBy: `${currentUser?.name || 'Department Officer'} (${currentUser?.title || 'Engineer'})`,
      location: formData.location,
      section: formData.section,
      blockOrTrack: formData.blockOrTrack || formData.trackLine || 'Up Line',
      resourceKey: formData.resourceKey || 'ENG_TRACK_TEAM_1',
      maintenanceType: formData.maintenanceType,
      description: formData.description,
      priority: reqPriority,
      requestedPriority: reqPriority,
      systemAssessedPriority: initialEval.systemAssessedPriority,
      approvedPriority: initialEval.approvedPriority,
      priorityEvidence,
      requestedDate: formData.requestedDate || new Date().toISOString().split('T')[0],
      requestedStart: formData.requestedStart,
      requestedEnd: formData.requestedEnd,
      estimatedDurationMinutes: duration,
      deadline: formData.deadline || `${formData.requestedDate || '2026-08-31'} 18:00`,
      operationalNotes: formData.operationalNotes || '',
      status: 'Submitted',
      safetyRequirements: formData.safetyRequirements || ['Speed Restriction 30 km/h', 'Lookout Men Deployed'],
      conflicts: [],
      recommendation: null,
      decision: null,
      activityLog: [
        { timestamp: nowStamp, text: `Request ${newId} submitted by ${userDept} Department.` },
        { timestamp: nowStamp, text: `Ingested into Central Planning System. Initial Priority Validation: ${initialEval.validationStatus}.` }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to canonical localStorage and update local React state
    const updatedRequests = [newRequest, ...currentStoredRequests];
    saveStoredRequests(updatedRequests);
    setRequests(updatedRequests);

    // Add Central Control notification
    addNotification({
      targetDept: 'Central Control',
      requestId: newId,
      type: 'new_request',
      title: `New ${userDept} Request Received`,
      message: `${userDept} submitted request ${newId} for ${formData.section} (${formData.requestedStart}–${formData.requestedEnd}).`
    });

    // Broadcast change across all other browser tabs
    crossTabSync.publish({
      type: SYNC_EVENTS.REQUEST_CREATED,
      entityId: newId,
      targetDept: 'Central Control',
      meta: {
        requestId: newId,
        department: userDept,
        priority: newRequest.priority,
        section: newRequest.section
      }
    });

    return newRequest;
  };

  // 2. Generate Plan via Deterministic Planning Engine (Central Control - Automatic Mode)
  const generatePlan = () => {
    const nowStamp = formatISTDateTime();
    const currentStoredRequests = getStoredRequests();
    const { requests: updatedReqs, integratedBlocks: newIBs, metrics } = runPlanningEngine(currentStoredRequests, trains, availableBlocks);

    // Preserve any existing manual integrated blocks
    const existingManualIBs = getStoredIntegratedBlocks().filter(ib => ib.creationMode === 'MANUAL');
    const combinedIBs = [...existingManualIBs, ...newIBs];

    const finalRequests = updatedReqs.map(r => {
      const existing = currentStoredRequests.find(old => old.id === r.id);
      if (!existing || existing.status === r.status) {
        return { ...r, updatedAt: new Date().toISOString() };
      }

      let logText = '';
      if (r.recommendation?.isIntegrated) {
        logText = `Planning Engine grouped into Integrated Block ${r.recommendation.integratedBlockId} on ${r.section} (Block ${r.recommendation.recommendedBlockId}, ${r.recommendation.recommendedStart}–${r.recommendation.recommendedEnd}) alongside ${r.recommendation.coordinatedDepartments?.join(', ')}.`;
      } else if (r.conflicts?.length > 0) {
        logText = `Planning Engine flagged conflict: ${r.conflicts[0].description}. Recommended shifted Block ${r.recommendation?.recommendedBlockId || 'slot'}.`;
      } else {
        logText = `Planning Engine validated clear individual window on ${r.section} (Block ${r.recommendation?.recommendedBlockId}). Status: ${r.status}.`;
      }

      return {
        ...r,
        updatedAt: new Date().toISOString(),
        activityLog: [
          ...r.activityLog,
          { timestamp: nowStamp, text: logText }
        ]
      };
    });

    const finalMetrics = {
      ...metrics,
      integratedBlocksCreated: combinedIBs.length,
      lastGeneratedAt: nowStamp
    };

    // Save all to canonical localStorage
    saveStoredRequests(finalRequests);
    saveStoredIntegratedBlocks(combinedIBs);
    saveStoredPlanningMetrics(finalMetrics);

    // Update local React state
    setRequests(finalRequests);
    setIntegratedBlocks(combinedIBs);
    setPlanningMetrics(finalMetrics);

    // Add Central Notification
    addNotification({
      targetDept: 'Central Control',
      type: 'plan_generated',
      title: 'Coordinated Maintenance Plan Generated',
      message: `Planning Engine scheduled ${metrics.totalScheduled}/${metrics.totalEvaluated} requests: created ${combinedIBs.length} Integrated Blocks (${metrics.separateBlocksAvoided} separate blocks avoided).`
    });

    // Broadcast across tabs
    crossTabSync.publish({
      type: SYNC_EVENTS.PLAN_GENERATED,
      meta: {
        totalScheduled: metrics.totalScheduled,
        integratedBlocksCreated: combinedIBs.length
      }
    });

    return { requests: finalRequests, integratedBlocks: combinedIBs, metrics: finalMetrics };
  };

  // 3. Reset Generated Plan
  const resetPlan = () => {
    const currentStoredRequests = getStoredRequests();
    const updated = currentStoredRequests.map(r => {
      if (r.status === 'Approved' || r.status === 'Rejected' || r.status === 'Deferred') return r;
      return {
        ...r,
        status: 'Submitted',
        conflicts: [],
        recommendation: null,
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredRequests(updated);
    saveStoredIntegratedBlocks([]);
    saveStoredPlanningMetrics(null);

    setRequests(updated);
    setIntegratedBlocks([]);
    setPlanningMetrics(null);

    crossTabSync.publish({
      type: SYNC_EVENTS.REFRESH_SHARED_STATE
    });
  };

  // 4. Create Manual Integrated Block (Manual Block Builder Mode)
  const createManualIntegratedBlock = ({ selectedRequests, chosenBlockOption, customIbId }) => {
    const nowStamp = formatISTDateTime();
    const currentStoredBlocks = getStoredIntegratedBlocks();
    const currentStoredRequests = getStoredRequests();

    // Determine next sequential manual IB ID
    let maxIbNum = 0;
    currentStoredBlocks.forEach(ib => {
      if (ib.id && (ib.id.startsWith('IB-') || ib.id.startsWith('IB-M'))) {
        const numPart = parseInt(ib.id.replace('IB-M', '').replace('IB-', ''), 10);
        if (!isNaN(numPart) && numPart > maxIbNum) maxIbNum = numPart;
      }
    });

    const nextIbId = customIbId || `IB-${String(maxIbNum + 1).padStart(3, '0')}`;
    const newIb = buildManualIntegratedBlock(selectedRequests, chosenBlockOption, nextIbId);

    const updatedBlocks = [newIb, ...currentStoredBlocks.filter(b => b.id !== nextIbId)];

    // Update included requests in canonical requests
    const updatedRequests = currentStoredRequests.map(req => {
      const isSelected = selectedRequests.some(sr => sr.id === req.id);
      if (!isSelected) return req;

      const otherDepts = newIb.departments.filter(d => d !== req.department);
      const otherReqIds = newIb.requestIds.filter(id => id !== req.id);

      const recommendation = {
        isIntegrated: true,
        integratedBlockId: newIb.id,
        coordinatedDepartments: otherDepts,
        coordinatedRequests: otherReqIds,
        recommendedSection: newIb.section,
        recommendedBlockId: newIb.blockId,
        recommendedDate: newIb.date,
        recommendedStart: newIb.start,
        recommendedEnd: newIb.end,
        status: 'OPTIMAL',
        score: 98,
        factors: newIb.factors,
        explanation: newIb.explanation
      };

      const updatedActivityLog = [
        ...req.activityLog,
        { timestamp: nowStamp, text: `Central Planner manually grouped into Integrated Maintenance Block ${newIb.id} on ${newIb.section} (${newIb.start}–${newIb.end}) in Block ${newIb.blockId}.` }
      ];

      return {
        ...req,
        status: 'Pending Approval',
        conflicts: [],
        recommendation,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    // Save to storage and React state
    saveStoredIntegratedBlocks(updatedBlocks);
    saveStoredRequests(updatedRequests);
    setIntegratedBlocks(updatedBlocks);
    setRequests(updatedRequests);

    // Notify Central Control
    addNotification({
      targetDept: 'Central Control',
      type: 'plan_generated',
      title: `Manual Integrated Block Created (${newIb.id})`,
      message: `Grouped ${selectedRequests.length} requests (${newIb.departments.join(', ')}) on ${newIb.section} into Block ${newIb.blockId} (${newIb.start}–${newIb.end}).`
    });

    // Broadcast across tabs
    crossTabSync.publish({
      type: SYNC_EVENTS.INTEGRATED_BLOCK_CREATED,
      entityId: newIb.id,
      meta: {
        integratedBlockId: newIb.id,
        section: newIb.section,
        departments: newIb.departments,
        start: newIb.start,
        end: newIb.end
      }
    });

    return newIb;
  };

  // 5. Remove a request from a draft Integrated Block
  const removeRequestFromIntegratedBlock = (ibId, requestId) => {
    const nowStamp = formatISTDateTime();
    const currentStoredBlocks = getStoredIntegratedBlocks();
    const currentStoredRequests = getStoredRequests();
    const targetIB = currentStoredBlocks.find(ib => ib.id === ibId);
    if (!targetIB) return;

    const remainingReqIds = targetIB.requestIds.filter(id => id !== requestId);
    const remainingRequests = currentStoredRequests.filter(r => remainingReqIds.includes(r.id));

    let updatedBlocks = [];

    if (remainingRequests.length < 2) {
      // Less than 2 requests left -> disband the integrated block
      updatedBlocks = currentStoredBlocks.filter(ib => ib.id !== ibId);
    } else {
      // Re-evaluate compatibility and recalculate duration for remaining requests
      const validation = checkIntegrationCompatibility(remainingRequests, availableBlocks, trains);
      const chosenBlock = validation.availableBlockOptions.find(b => b.blockId === targetIB.blockId) || validation.recommendedBlock || validation.availableBlockOptions[0] || {};
      const updatedIB = buildManualIntegratedBlock(remainingRequests, chosenBlock, ibId);
      updatedBlocks = currentStoredBlocks.map(ib => ib.id === ibId ? updatedIB : ib);
    }

    // Update requests: revert removed request back to Submitted, update remaining requests
    const updatedRequests = currentStoredRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Submitted',
          recommendation: null,
          activityLog: [
            ...req.activityLog,
            { timestamp: nowStamp, text: `Removed from Integrated Block ${ibId} by Central Planner.` }
          ],
          updatedAt: new Date().toISOString()
        };
      }

      if (remainingReqIds.includes(req.id)) {
        if (remainingRequests.length < 2) {
          // Block disbanded
          return {
            ...req,
            status: 'Submitted',
            recommendation: null,
            activityLog: [
              ...req.activityLog,
              { timestamp: nowStamp, text: `Integrated Block ${ibId} disbanded due to insufficient constituent requests.` }
            ],
            updatedAt: new Date().toISOString()
          };
        } else {
          // Update recommendation for remaining requests
          const otherDepts = Array.from(new Set(remainingRequests.map(r => r.department))).filter(d => d !== req.department);
          const otherIds = remainingReqIds.filter(id => id !== req.id);
          return {
            ...req,
            recommendation: {
              ...req.recommendation,
              coordinatedDepartments: otherDepts,
              coordinatedRequests: otherIds
            },
            updatedAt: new Date().toISOString()
          };
        }
      }

      return req;
    });

    saveStoredIntegratedBlocks(updatedBlocks);
    saveStoredRequests(updatedRequests);
    setIntegratedBlocks(updatedBlocks);
    setRequests(updatedRequests);

    crossTabSync.publish({
      type: SYNC_EVENTS.REFRESH_SHARED_STATE
    });
  };

  // 6. Add a compatible request to an existing draft Integrated Block
  const addRequestToIntegratedBlock = (ibId, requestToAdd) => {
    const nowStamp = formatISTDateTime();
    const currentStoredBlocks = getStoredIntegratedBlocks();
    const currentStoredRequests = getStoredRequests();
    const targetIB = currentStoredBlocks.find(ib => ib.id === ibId);
    if (!targetIB || !requestToAdd) return { success: false, reason: 'Block or request not found.' };

    const currentIncludedRequests = currentStoredRequests.filter(r => targetIB.requestIds.includes(r.id));
    const combinedRequests = [...currentIncludedRequests, requestToAdd];

    // Validate compatibility of the combined group
    const validation = checkIntegrationCompatibility(combinedRequests, availableBlocks, trains);
    if (!validation.isCompatible) {
      return { success: false, reasons: validation.incompatibleReasons };
    }

    const chosenBlock = validation.availableBlockOptions.find(b => b.blockId === targetIB.blockId) || validation.recommendedBlock || validation.availableBlockOptions[0] || {};
    const updatedIB = buildManualIntegratedBlock(combinedRequests, chosenBlock, ibId);

    const updatedBlocks = currentStoredBlocks.map(ib => ib.id === ibId ? updatedIB : ib);

    const updatedRequests = currentStoredRequests.map(req => {
      const isIncluded = updatedIB.requestIds.includes(req.id);
      if (!isIncluded) return req;

      const otherDepts = updatedIB.departments.filter(d => d !== req.department);
      const otherIds = updatedIB.requestIds.filter(id => id !== req.id);

      const recommendation = {
        isIntegrated: true,
        integratedBlockId: updatedIB.id,
        coordinatedDepartments: otherDepts,
        coordinatedRequests: otherIds,
        recommendedSection: updatedIB.section,
        recommendedBlockId: updatedIB.blockId,
        recommendedDate: updatedIB.date,
        recommendedStart: updatedIB.start,
        recommendedEnd: updatedIB.end,
        status: 'OPTIMAL',
        score: 98,
        factors: updatedIB.factors,
        explanation: updatedIB.explanation
      };

      const updatedActivityLog = [
        ...req.activityLog,
        { timestamp: nowStamp, text: `Synchronized into Integrated Maintenance Block ${updatedIB.id} (${updatedIB.start}–${updatedIB.end}).` }
      ];

      return {
        ...req,
        status: 'Pending Approval',
        conflicts: [],
        recommendation,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredIntegratedBlocks(updatedBlocks);
    saveStoredRequests(updatedRequests);
    setIntegratedBlocks(updatedBlocks);
    setRequests(updatedRequests);

    crossTabSync.publish({
      type: SYNC_EVENTS.REFRESH_SHARED_STATE
    });

    return { success: true, block: updatedIB };
  };

  // 7. Cancel / Discard a draft Integrated Block
  const cancelIntegratedBlock = (ibId) => {
    const nowStamp = formatISTDateTime();
    const currentStoredBlocks = getStoredIntegratedBlocks();
    const currentStoredRequests = getStoredRequests();
    const targetIB = currentStoredBlocks.find(ib => ib.id === ibId);
    if (!targetIB) return;

    const updatedBlocks = currentStoredBlocks.filter(ib => ib.id !== ibId);

    const updatedRequests = currentStoredRequests.map(req => {
      if (!targetIB.requestIds.includes(req.id)) return req;

      return {
        ...req,
        status: 'Submitted',
        recommendation: null,
        activityLog: [
          ...req.activityLog,
          { timestamp: nowStamp, text: `Draft Integrated Block ${ibId} cancelled by Central Planner.` }
        ],
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredIntegratedBlocks(updatedBlocks);
    saveStoredRequests(updatedRequests);
    setIntegratedBlocks(updatedBlocks);
    setRequests(updatedRequests);

    crossTabSync.publish({
      type: SYNC_EVENTS.REFRESH_SHARED_STATE
    });
  };

  // 8. Central Control Approval for Integrated Maintenance Block (Universal for Auto & Manual)
  const approveIntegratedBlock = (integratedBlockId, customWindow = null) => {
    const nowStamp = formatISTDateTime();
    const currentBlocks = getStoredIntegratedBlocks();
    const targetIB = currentBlocks.find(ib => ib.id === integratedBlockId);
    if (!targetIB) return;

    const approvedStart = customWindow?.approvedStart || targetIB.start;
    const approvedEnd = customWindow?.approvedEnd || targetIB.end;
    const approvedBlockId = customWindow?.approvedBlockId || targetIB.blockId;
    const approvedDate = customWindow?.approvedDate || targetIB.date;

    const updatedBlocks = currentBlocks.map(ib => {
      if (ib.id !== integratedBlockId) return ib;
      return {
        ...ib,
        status: 'Approved',
        start: approvedStart,
        end: approvedEnd,
        blockId: approvedBlockId,
        date: approvedDate,
        updatedAt: new Date().toISOString()
      };
    });

    const currentRequests = getStoredRequests();
    const updatedRequests = currentRequests.map(req => {
      if (!targetIB.requestIds.includes(req.id)) return req;

      const otherDepts = targetIB.departments.filter(d => d !== req.department);

      const decision = {
        action: 'Approved',
        approvedBlockId,
        approvedDate,
        approvedStart,
        approvedEnd,
        isIntegrated: true,
        integratedBlockId: targetIB.id,
        coordinatedDepartments: otherDepts,
        reason: `Approved as part of Integrated Maintenance Block ${targetIB.id} (${approvedStart}–${approvedEnd}) on ${targetIB.section}. Coordinated alongside ${otherDepts.join(', ')}.`,
        decidedBy: `${currentUser?.name || 'R. K. Verma'} (${currentUser?.title || 'Central Planning'})`,
        decidedAt: new Date().toISOString()
      };

      const updatedActivityLog = [
        ...req.activityLog,
        { timestamp: nowStamp, text: `Central Control APPROVED Integrated Maintenance Block ${targetIB.id} (${approvedStart}–${approvedEnd}) in Block ${approvedBlockId}. Coordinated with ${otherDepts.join(', ')}.` }
      ];

      addNotification({
        targetDept: req.department,
        requestId: req.id,
        type: 'approval',
        title: `Integrated Maintenance Block Approved (${req.id})`,
        message: `Your request ${req.id} was approved as part of Integrated Block ${targetIB.id} on ${targetIB.section} (${approvedStart}–${approvedEnd}) alongside ${otherDepts.join(', ')}.`
      });

      return {
        ...req,
        status: 'Approved',
        decision,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    // Save to storage and React state
    saveStoredIntegratedBlocks(updatedBlocks);
    saveStoredRequests(updatedRequests);
    setIntegratedBlocks(updatedBlocks);
    setRequests(updatedRequests);

    // Broadcast live event to all tabs
    crossTabSync.publish({
      type: SYNC_EVENTS.INTEGRATED_BLOCK_CREATED,
      entityId: integratedBlockId,
      meta: {
        integratedBlockId,
        section: targetIB.section,
        departments: targetIB.departments,
        start: approvedStart,
        end: approvedEnd
      }
    });

    crossTabSync.publish({
      type: SYNC_EVENTS.PLAN_APPROVED,
      entityId: integratedBlockId,
      meta: {
        integratedBlockId,
        departments: targetIB.departments
      }
    });
  };

  // 9. Central Control Individual Approval
  const approveRequest = (requestId, customWindow = null) => {
    const nowStamp = formatISTDateTime();
    const currentRequests = getStoredRequests();
    let targetReq = null;

    const updatedRequests = currentRequests.map(req => {
      if (req.id !== requestId) return req;
      targetReq = req;

      const appStart = customWindow?.approvedStart || req.recommendation?.recommendedStart || req.requestedStart;
      const appEnd = customWindow?.approvedEnd || req.recommendation?.recommendedEnd || req.requestedEnd;
      const appDate = customWindow?.approvedDate || req.recommendation?.recommendedDate || req.requestedDate;
      const appBlockId = customWindow?.approvedBlockId || req.recommendation?.recommendedBlockId || 'MB-204';
      const appReason = customWindow?.reason || (req.recommendation?.status === 'RESCHEDULED' ? 'Approved with rescheduled window to clear train corridor traffic.' : 'Approved as requested by Central Planning.');

      const decision = {
        action: 'Approved',
        approvedBlockId: appBlockId,
        approvedDate: appDate,
        approvedStart: appStart,
        approvedEnd: appEnd,
        isIntegrated: req.recommendation?.isIntegrated || false,
        integratedBlockId: req.recommendation?.integratedBlockId || null,
        coordinatedDepartments: req.recommendation?.coordinatedDepartments || [],
        reason: appReason,
        decidedBy: `${currentUser?.name || 'R. K. Verma'} (${currentUser?.title || 'Central Planning'})`,
        decidedAt: new Date().toISOString()
      };

      const updatedActivityLog = [
        ...req.activityLog,
        { timestamp: nowStamp, text: `Central Control APPROVED maintenance block ${appBlockId} (${appStart}–${appEnd}). Decision dispatched to ${req.department}.` }
      ];

      addNotification({
        targetDept: req.department,
        requestId: req.id,
        type: 'approval',
        title: `Maintenance Block Approved (${req.id})`,
        message: `Central Control APPROVED ${req.id} for ${appDate} (${appStart}–${appEnd}) in Block ${appBlockId}.`
      });

      return {
        ...req,
        status: 'Approved',
        decision,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredRequests(updatedRequests);
    setRequests(updatedRequests);

    crossTabSync.publish({
      type: SYNC_EVENTS.PLAN_APPROVED,
      entityId: requestId,
      targetDept: targetReq?.department,
      meta: {
        requestId,
        department: targetReq?.department,
        blockId: customWindow?.approvedBlockId || targetReq?.recommendation?.recommendedBlockId || 'MB-204'
      }
    });
  };

  // 9b. Update Approved Priority (COA Officer Priority Reassessment)
  const updateApprovedPriority = (requestId, newApprovedPriority, officerRemarks) => {
    const nowStamp = formatISTDateTime();
    const currentRequests = getStoredRequests();
    let targetReq = null;

    const updatedRequests = currentRequests.map(req => {
      if (req.id !== requestId) return req;
      targetReq = req;

      const updatedActivityLog = [
        ...req.activityLog,
        { 
          timestamp: nowStamp, 
          text: `COA Officer reassessed & confirmed Approved Priority as ${newApprovedPriority}.${officerRemarks ? ` Remarks: ${officerRemarks}` : ''}` 
        }
      ];

      return {
        ...req,
        approvedPriority: newApprovedPriority,
        priority: newApprovedPriority,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredRequests(updatedRequests);
    setRequests(updatedRequests);

    addNotification({
      targetDept: targetReq?.department || 'Central Control',
      requestId: requestId,
      type: 'priority_update',
      title: `Priority Reassessed (${requestId})`,
      message: `COA Officer set Approved Priority for ${requestId} to ${newApprovedPriority}.`
    });

    crossTabSync.publish({
      type: SYNC_EVENTS.REFRESH_SHARED_STATE
    });
  };

  // 10. Central Control Modification
  const modifyRequest = (requestId, { approvedDate, approvedStart, approvedEnd, approvedBlockId, reason }) => {
    const nowStamp = formatISTDateTime();
    const currentRequests = getStoredRequests();
    let targetReq = null;

    const updatedRequests = currentRequests.map(req => {
      if (req.id !== requestId) return req;
      targetReq = req;

      const decision = {
        action: 'Modified',
        approvedBlockId: approvedBlockId || 'MB-CUSTOM',
        approvedDate,
        approvedStart,
        approvedEnd,
        reason: reason || 'Schedule modified by Central Control to resolve corridor bottleneck.',
        decidedBy: `${currentUser?.name || 'R. K. Verma'} (${currentUser?.title || 'Central Planning'})`,
        decidedAt: new Date().toISOString()
      };

      const updatedActivityLog = [
        ...req.activityLog,
        { timestamp: nowStamp, text: `Central Control MODIFIED schedule window to ${approvedStart}–${approvedEnd}. Reason: ${reason}` }
      ];

      addNotification({
        targetDept: req.department,
        requestId: req.id,
        type: 'modification',
        title: `Maintenance Window Modified (${req.id})`,
        message: `Approved with schedule timing adjustment: ${approvedDate} (${approvedStart}–${approvedEnd}).`
      });

      return {
        ...req,
        status: 'Modified',
        decision,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredRequests(updatedRequests);
    setRequests(updatedRequests);

    crossTabSync.publish({
      type: SYNC_EVENTS.PLAN_MODIFIED,
      entityId: requestId,
      targetDept: targetReq?.department,
      meta: {
        requestId,
        department: targetReq?.department
      }
    });
  };

  // 11. Central Control Defer
  const deferRequest = (requestId, reason) => {
    const nowStamp = formatISTDateTime();
    const currentRequests = getStoredRequests();
    let targetReq = null;

    const updatedRequests = currentRequests.map(req => {
      if (req.id !== requestId) return req;
      targetReq = req;

      const decision = {
        action: 'Deferred',
        approvedBlockId: null,
        approvedDate: null,
        approvedStart: null,
        approvedEnd: null,
        reason: reason || 'Deferred due to operational track saturation.',
        decidedBy: `${currentUser?.name || 'R. K. Verma'} (${currentUser?.title || 'Central Planning'})`,
        decidedAt: new Date().toISOString()
      };

      const updatedActivityLog = [
        ...req.activityLog,
        { timestamp: nowStamp, text: `Central Control DEFERRED request. Reason: ${reason}` }
      ];

      addNotification({
        targetDept: req.department,
        requestId: req.id,
        type: 'deferral',
        title: `Request Deferred (${req.id})`,
        message: `Your maintenance request was deferred by Central Control. Reason: ${reason}`
      });

      return {
        ...req,
        status: 'Deferred',
        decision,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredRequests(updatedRequests);
    setRequests(updatedRequests);

    crossTabSync.publish({
      type: SYNC_EVENTS.REQUEST_DEFERRED,
      entityId: requestId,
      targetDept: targetReq?.department,
      meta: { requestId, reason }
    });
  };

  // 12. Central Control Reject
  const rejectRequest = (requestId, reason) => {
    const nowStamp = formatISTDateTime();
    const currentRequests = getStoredRequests();
    let targetReq = null;

    const updatedRequests = currentRequests.map(req => {
      if (req.id !== requestId) return req;
      targetReq = req;

      const decision = {
        action: 'Rejected',
        approvedBlockId: null,
        approvedDate: null,
        approvedStart: null,
        approvedEnd: null,
        reason: reason || 'Request rejected due to severe safety/train conflict.',
        decidedBy: `${currentUser?.name || 'R. K. Verma'} (${currentUser?.title || 'Central Planning'})`,
        decidedAt: new Date().toISOString()
      };

      const updatedActivityLog = [
        ...req.activityLog,
        { timestamp: nowStamp, text: `Central Control REJECTED request. Reason: ${reason}` }
      ];

      addNotification({
        targetDept: req.department,
        requestId: req.id,
        type: 'rejection',
        title: `Request Rejected (${req.id})`,
        message: `Your maintenance request was rejected by Central Control. Reason: ${reason}`
      });

      return {
        ...req,
        status: 'Rejected',
        decision,
        activityLog: updatedActivityLog,
        updatedAt: new Date().toISOString()
      };
    });

    saveStoredRequests(updatedRequests);
    setRequests(updatedRequests);

    crossTabSync.publish({
      type: SYNC_EVENTS.REQUEST_REJECTED,
      entityId: requestId,
      targetDept: targetReq?.department,
      meta: { requestId, reason }
    });
  };

  // 13. Reset Demo Data
  const resetDemoData = () => {
    resetSharedCanonicalData();
    setRequests(INITIAL_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setIntegratedBlocks([]);
    setPlanningMetrics(null);

    crossTabSync.publish({
      type: SYNC_EVENTS.DEMO_DATA_RESET
    });
  };

  return (
    <RailPlanContext.Provider value={{
      currentUser,
      login,
      logout,
      switchUser,
      personas: PERSONAS,
      departments: DEPARTMENTS,
      requests,
      sections,
      availableBlocks,
      trains,
      resources: DEPARTMENT_RESOURCES,
      notifications,
      integratedBlocks,
      planningMetrics,
      toasts,
      addToast,
      removeToast,
      submitRequest,
      generatePlan,
      resetPlan,
      createManualIntegratedBlock,
      removeRequestFromIntegratedBlock,
      addRequestToIntegratedBlock,
      cancelIntegratedBlock,
      approveIntegratedBlock,
      approveRequest,
      updateApprovedPriority,
      modifyRequest,
      deferRequest,
      rejectRequest,
      markNotificationRead,
      markAllNotificationsRead,
      resetDemoData
    }}>
      {children}
    </RailPlanContext.Provider>
  );
};

export const useRailPlan = () => {
  const context = useContext(RailPlanContext);
  if (!context) {
    throw new Error('useRailPlan must be used within a RailPlanProvider');
  }
  return context;
};

export default RailPlanContext;
