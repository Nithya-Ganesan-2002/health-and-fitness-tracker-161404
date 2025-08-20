import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Reminder types supported by the app.
 */
export const REMINDER_TYPES = {
  workout: 'workout',
  hydration: 'hydration',
  meal: 'meal',
};

/**
 * PUBLIC_INTERFACE
 * RemindersContext provides state and actions to manage user reminders.
 * - Persists reminders in localStorage (dev/demo mode), ready for backend sync.
 * - Integrates with browser Notification API and fallback tab title alerts.
 * - Schedules triggers using setTimeout for near-future reminders and an interval tick for robustness.
 */
export const RemindersContext = createContext({
  reminders: [],
  loading: false,
  error: null,
  // Actions
  listReminders: async () => {},
  addReminder: async (_reminder) => {},
  updateReminder: async (_id, _updates) => {},
  deleteReminder: async (_id) => {},
  requestNotificationPermission: async () => {},
});

/**
 * Helpers for localStorage persistence
 */
const STORAGE_KEY = 'ft_reminders_v1';
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota/storage errors
  }
}

// PUBLIC_INTERFACE
export function RemindersProvider({ children }) {
  const [reminders, setReminders] = useState(() => loadFromStorage());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map of id -> timeout id for scheduled notifications (in-memory only)
  const timeoutsRef = useRef(new Map());

  // Persist reminders
  useEffect(() => {
    saveToStorage(reminders);
    // Reschedule when reminders change
    rescheduleAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  // Periodic tick to catch any missed triggers (e.g., device sleep)
  useEffect(() => {
    const tick = setInterval(() => {
      checkDueReminders();
    }, 60 * 1000); // every minute
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Request browser Notification permission.
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try {
      const res = await Notification.requestPermission();
      return res;
    } catch {
      return Notification.permission;
    }
  }, []);

  /**
   * Show a notification using Notification API, with fallback to title flash.
   */
  const showNotification = useCallback(async (title, body) => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted' && 'Notification' in window) {
      try {
        const n = new Notification(title, { body, icon: undefined });
        setTimeout(() => n.close?.(), 5000);
      } catch {
        // ignore
      }
    } else {
      const original = document.title;
      document.title = `🔔 ${title}`;
      setTimeout(() => {
        document.title = original;
      }, 2500);
      // Optionally, toast UI can be added here
    }
  }, [requestNotificationPermission]);

  /**
   * Trigger a reminder notification and mark it as lastTriggeredAt.
   */
  const triggerReminder = useCallback(
    (rem) => {
      const titleMap = {
        [REMINDER_TYPES.workout]: 'Workout reminder',
        [REMINDER_TYPES.hydration]: 'Hydration reminder',
        [REMINDER_TYPES.meal]: 'Meal reminder',
      };
      const title = titleMap[rem.type] || 'Reminder';
      const timeLabel = new Date(rem.dateTime).toLocaleString();
      const body = rem.message ? `${rem.message} • ${timeLabel}` : `It's time! • ${timeLabel}`;
      showNotification(title, body);

      // mark last triggered
      setReminders((prev) =>
        prev.map((r) => (r.id === rem.id ? { ...r, lastTriggeredAt: new Date().toISOString() } : r))
      );
    },
    [showNotification]
  );

  /**
   * Schedule a single reminder using setTimeout if within ~24h; otherwise rely on interval tick.
   */
  const scheduleReminder = useCallback(
    (rem) => {
      const timers = timeoutsRef.current;
      // clear existing
      if (timers.has(rem.id)) {
        clearTimeout(timers.get(rem.id));
        timers.delete(rem.id);
      }
      const when = new Date(rem.dateTime).getTime();
      const now = Date.now();
      const delay = when - now;

      if (delay <= 0) {
        // Past due - trigger immediately (once)
        if (!rem.lastTriggeredAt) triggerReminder(rem);
        return;
      }
      // For long delays, cap scheduling and rely on tick; schedule only up to 24h
      const aDay = 24 * 60 * 60 * 1000;
      if (delay > aDay) {
        return;
      }
      const tid = setTimeout(() => {
        triggerReminder(rem);
        timers.delete(rem.id);
      }, delay);
      timers.set(rem.id, tid);
    },
    [triggerReminder]
  );

  const clearAllSchedules = useCallback(() => {
    const timers = timeoutsRef.current;
    timers.forEach((tid) => clearTimeout(tid));
    timers.clear();
  }, []);

  const rescheduleAll = useCallback(() => {
    clearAllSchedules();
    reminders
      .filter((r) => r.enabled !== false) // enabled by default
      .forEach((r) => scheduleReminder(r));
  }, [reminders, scheduleReminder, clearAllSchedules]);

  const checkDueReminders = useCallback(() => {
    const now = Date.now();
    reminders
      .filter((r) => r.enabled !== false)
      .forEach((r) => {
        const when = new Date(r.dateTime).getTime();
        if (when <= now && !r.lastTriggeredAt) {
          triggerReminder(r);
        }
      });
  }, [reminders, triggerReminder]);

  /**
   * PUBLIC_INTERFACE
   * List reminders (no-op in dev as state is in memory synced to storage)
   */
  const listReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In backend-connected mode, replace with API call.
      return reminders;
    } catch (e) {
      setError(e?.message || 'Failed to load reminders');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [reminders]);

  /**
   * PUBLIC_INTERFACE
   * Add a reminder. Shape:
   * { type: 'workout'|'hydration'|'meal', dateTime: ISO string, message?: string, enabled?: boolean }
   */
  const addReminder = useCallback(async (rem) => {
    setLoading(true);
    setError(null);
    try {
      const created = {
        id: `rem-${Math.random().toString(36).slice(2, 10)}`,
        type: rem.type,
        dateTime: rem.dateTime,
        message: rem.message || '',
        enabled: rem.enabled !== false,
        createdAt: new Date().toISOString(),
        lastTriggeredAt: null,
      };
      setReminders((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      setError(e?.message || 'Failed to add reminder');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Update a reminder by id.
   */
  const updateReminder = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      let next = null;
      setReminders((prev) => {
        const updated = prev.map((r) => {
          if (r.id !== id) return r;
          next = { ...r, ...updates };
          // If date/time changed, reset lastTriggeredAt to allow retrigger
          if (updates.dateTime && updates.dateTime !== r.dateTime) {
            next.lastTriggeredAt = null;
          }
          return next;
        });
        return updated;
      });
      return next;
    } catch (e) {
      setError(e?.message || 'Failed to update reminder');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Delete a reminder by id.
   */
  const deleteReminder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      // Clear scheduled timeout if exists
      const timers = timeoutsRef.current;
      if (timers.has(id)) {
        clearTimeout(timers.get(id));
        timers.delete(id);
      }
      return { success: true };
    } catch (e) {
      setError(e?.message || 'Failed to delete reminder');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      reminders,
      loading,
      error,
      listReminders,
      addReminder,
      updateReminder,
      deleteReminder,
      requestNotificationPermission,
    }),
    [
      reminders,
      loading,
      error,
      listReminders,
      addReminder,
      updateReminder,
      deleteReminder,
      requestNotificationPermission,
    ]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}
