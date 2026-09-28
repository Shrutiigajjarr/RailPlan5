// Canonical Storage Repository for RailPlan
// Manages system-wide shared data in localStorage & tab-isolated auth in sessionStorage

import { 
  INITIAL_REQUESTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SECTIONS, 
  AVAILABLE_BLOCKS, 
  MOCK_TRAINS, 
  DEPARTMENT_RESOURCES,
  DEPARTMENTS 
} from '../data/mockData';

export const STORAGE_KEYS = {
  REQUESTS: 'railplan_requests_v3',
  INTEGRATED_BLOCKS: 'railplan_integrated_blocks_v3',
  PLANNING_METRICS: 'railplan_planning_metrics_v3',
  NOTIFICATIONS: 'railplan_notifications_v3',
  REQUEST_SEQ: 'railplan_request_seq_v3',
  SYNC_PULSE: 'railplan_sync_pulse_v3'
};

export const SESSION_KEYS = {
  CURRENT_USER: 'railplan_session_user_v3'
};

/**
 * Migrate legacy auth from localStorage to sessionStorage if present,
 * ensuring each browser tab keeps its own authenticated identity without wiping shared data.
 */
export const migrateAuthFromLocalStorage = () => {
  if (typeof window === 'undefined') return null;

  try {
    const sessionUser = sessionStorage.getItem(SESSION_KEYS.CURRENT_USER);
    if (sessionUser) {
      return JSON.parse(sessionUser);
    }

    // Check old localStorage auth
    const legacyLocal = localStorage.getItem('railplan_current_user_v3');
    if (legacyLocal) {
      const parsed = JSON.parse(legacyLocal);
      sessionStorage.setItem(SESSION_KEYS.CURRENT_USER, JSON.stringify(parsed));
      // Remove from localStorage so it no longer interferes with multi-tab sessions
      localStorage.removeItem('railplan_current_user_v3');
      return parsed;
    }
  } catch (err) {
    console.error('RailPlan: Error during auth migration', err);
  }
  return null;
};

// ================= TAB-ISOLATED AUTH (sessionStorage) =================

export const getSessionUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem(SESSION_KEYS.CURRENT_USER);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return migrateAuthFromLocalStorage();
};

export const setSessionUser = (user) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      sessionStorage.setItem(SESSION_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEYS.CURRENT_USER);
    }
  } catch (e) {}
};

export const clearSessionUser = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_KEYS.CURRENT_USER);
  } catch (e) {}
};

// ================= CANONICAL SHARED DATA (localStorage) =================

export const getStoredRequests = () => {
  if (typeof window === 'undefined') return INITIAL_REQUESTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  // Initialize default if not present
  saveStoredRequests(INITIAL_REQUESTS);
  return INITIAL_REQUESTS;
};

export const saveStoredRequests = (requests) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  } catch (e) {}
};

export const getStoredIntegratedBlocks = () => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.INTEGRATED_BLOCKS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

export const saveStoredIntegratedBlocks = (blocks) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.INTEGRATED_BLOCKS, JSON.stringify(blocks));
  } catch (e) {}
};

export const getStoredPlanningMetrics = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANNING_METRICS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
};

export const saveStoredPlanningMetrics = (metrics) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLANNING_METRICS, JSON.stringify(metrics));
  } catch (e) {}
};

export const getStoredNotifications = () => {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  saveStoredNotifications(INITIAL_NOTIFICATIONS);
  return INITIAL_NOTIFICATIONS;
};

export const saveStoredNotifications = (notifications) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {}
};

/**
 * Resets shared canonical data back to initial mock datasets
 */
export const resetSharedCanonicalData = () => {
  saveStoredRequests(INITIAL_REQUESTS);
  saveStoredNotifications(INITIAL_NOTIFICATIONS);
  saveStoredIntegratedBlocks([]);
  saveStoredPlanningMetrics(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.REQUEST_SEQ);
  }
};
