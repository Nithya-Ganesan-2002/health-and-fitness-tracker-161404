import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { createWaterApi } from './api';

/**
 * PUBLIC_INTERFACE
 * WaterContext provides state and actions for hydration logs across the app.
 * Each log represents an intake event (in milliliters) with a timestamp.
 * Exposes daily totals, quick-add actions, and CRUD ready for backend.
 */
export const WaterContext = createContext({
  logs: [],
  loading: false,
  error: null,
  dailyTotalMl: 0,
  dailyGoalMl: 2000,
  // Actions
  listLogs: async () => {},
  addLog: async (_log) => {},
  updateLog: async (_id, _updates) => {},
  deleteLog: async (_id) => {},
  setDailyGoal: (_ml) => {},
  quickAdd: async (_ml) => {},
});

/**
 * PUBLIC_INTERFACE
 * WaterProvider wraps children and provides hydration tracking state and actions.
 * Dev mode persists to window memory and localStorage; production uses backend when REACT_APP_API_BASE_URL is set.
 */
export function WaterProvider({ children }) {
  const api = useMemo(() => createWaterApi(), []);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dailyGoalMl, setDailyGoalMl] = useState(() => {
    try {
      const v = localStorage.getItem('ft_water_goal_ml');
      return v ? Number(v) : 2000;
    } catch {
      return 2000;
    }
  });

  useEffect(() => {
    listLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ft_water_goal_ml', String(dailyGoalMl));
    } catch {
      // ignore
    }
  }, [dailyGoalMl]);

  // Helpers
  const isToday = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const dailyTotalMl = useMemo(
    () => logs.filter((l) => isToday(l.dateTime)).reduce((acc, l) => acc + (Number(l.amountMl) || 0), 0),
    [logs]
  );

  // PUBLIC_INTERFACE
  const listLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listLogs();
      setLogs(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      setError(e?.message || 'Failed to load water logs');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // PUBLIC_INTERFACE
  const addLog = useCallback(
    async (log) => {
      setLoading(true);
      setError(null);
      try {
        const created = await api.addLog(log);
        setLogs((prev) => [created, ...prev]);
        return created;
      } catch (e) {
        setError(e?.message || 'Failed to add water log');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  // PUBLIC_INTERFACE
  const updateLog = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await api.updateLog(id, updates);
        setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
        return updated;
      } catch (e) {
        setError(e?.message || 'Failed to update water log');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  // PUBLIC_INTERFACE
  const deleteLog = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await api.deleteLog(id);
        setLogs((prev) => prev.filter((l) => l.id !== id));
      } catch (e) {
        setError(e?.message || 'Failed to delete water log');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  // PUBLIC_INTERFACE
  const setDailyGoal = useCallback((ml) => {
    const value = Number(ml);
    if (!Number.isFinite(value) || value <= 0) return;
    setDailyGoalMl(value);
  }, []);

  // PUBLIC_INTERFACE
  const quickAdd = useCallback(
    async (ml) => {
      const amount = Number(ml);
      if (!Number.isFinite(amount) || amount <= 0) return;
      const nowIso = new Date().toISOString().slice(0, 16);
      await addLog({ amountMl: amount, dateTime: nowIso });
    },
    [addLog]
  );

  const value = useMemo(
    () => ({
      logs,
      loading,
      error,
      dailyTotalMl,
      dailyGoalMl,
      listLogs,
      addLog,
      updateLog,
      deleteLog,
      setDailyGoal,
      quickAdd,
    }),
    [
      logs,
      loading,
      error,
      dailyTotalMl,
      dailyGoalMl,
      listLogs,
      addLog,
      updateLog,
      deleteLog,
      setDailyGoal,
      quickAdd,
    ]
  );

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>;
}
