// Centralized Cross-Tab Synchronization Service for RailPlan Prototype
// Uses browser BroadcastChannel API with window storage event fallback

const CHANNEL_NAME = 'railplan-sync';

// Supported Sync Event Types
export const SYNC_EVENTS = {
  REQUEST_CREATED: 'REQUEST_CREATED',
  REQUEST_UPDATED: 'REQUEST_UPDATED',
  REQUEST_STATUS_CHANGED: 'REQUEST_STATUS_CHANGED',
  PLAN_GENERATED: 'PLAN_GENERATED',
  INTEGRATED_BLOCK_CREATED: 'INTEGRATED_BLOCK_CREATED',
  PLAN_APPROVED: 'PLAN_APPROVED',
  PLAN_MODIFIED: 'PLAN_MODIFIED',
  REQUEST_DEFERRED: 'REQUEST_DEFERRED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  DEMO_DATA_RESET: 'DEMO_DATA_RESET',
  REFRESH_SHARED_STATE: 'REFRESH_SHARED_STATE'
};

class CrossTabSyncService {
  constructor() {
    this.channel = null;
    this.subscribers = new Set();
    this.storageListener = null;
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // Initialize BroadcastChannel if supported
    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event && event.data) {
            // Ignore messages originating from the same tab instance
            if (event.data.originTabId === this.tabId) return;
            this.notifySubscribers(event.data);
          }
        };
      } catch (err) {
        console.warn('RailPlan: BroadcastChannel initialization failed, falling back to storage events.', err);
      }
    }

    // Storage event listener fallback (fires in other same-origin tabs when localStorage changes)
    this.storageListener = (e) => {
      if (e.key && e.key.startsWith('railplan_') && e.key !== 'railplan_session_user_v3') {
        // If storage event fired and it's our sync pulse or canonical data key
        if (e.key === 'railplan_sync_pulse_v3' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed.originTabId === this.tabId) return;
            this.notifySubscribers(parsed);
            return;
          } catch (err) {
            // fallback below
          }
        }

        // Generic storage key update fallback
        this.notifySubscribers({
          type: SYNC_EVENTS.REFRESH_SHARED_STATE,
          key: e.key,
          timestamp: Date.now(),
          originTabId: 'storage_event'
        });
      }
    };

    window.addEventListener('storage', this.storageListener);
  }

  notifySubscribers(eventData) {
    this.subscribers.forEach((callback) => {
      try {
        callback(eventData);
      } catch (err) {
        console.error('RailPlan: Error in cross-tab subscriber callback', err);
      }
    });
  }

  /**
   * Publish an operational change event across tabs
   * @param {Object} event
   * @param {string} event.type - Event type from SYNC_EVENTS
   * @param {string} [event.entityId] - ID of modified request or integrated block
   * @param {string} [event.targetDept] - Targeted department if applicable
   * @param {Object} [event.meta] - Additional metadata for toast/context
   */
  publish(event) {
    if (!event || !event.type) return;

    const payload = {
      ...event,
      originTabId: this.tabId,
      timestamp: Date.now()
    };

    // 1. Post to BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('RailPlan: Error posting to BroadcastChannel', err);
      }
    }

    // 2. Pulse localStorage for cross-browser / storage-event fallback
    try {
      localStorage.setItem('railplan_sync_pulse_v3', JSON.stringify({
        ...payload,
        _pulse: Date.now()
      }));
    } catch (e) {
      // Storage quota or private browsing safety
    }
  }

  /**
   * Subscribe to cross-tab events
   * @param {Function} callback - (eventData) => void
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') return () => {};
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Cleanup channel and listeners
   */
  close() {
    this.subscribers.clear();
    if (this.channel) {
      try {
        this.channel.close();
      } catch (e) {}
      this.channel = null;
    }
    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  }
}

export const crossTabSync = new CrossTabSyncService();
export default crossTabSync;
