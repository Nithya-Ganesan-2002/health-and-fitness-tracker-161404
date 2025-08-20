import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { createWorkoutApi } from './api';

/**
 * PUBLIC_INTERFACE
 * WorkoutContext provides state and actions for workout sessions across the app.
 * Stores a list of sessions and exposes CRUD operations ready to connect to backend APIs.
 */
export const WorkoutContext = createContext({
  sessions: [],
  loading: false,
  error: null,
  // Actions
  listSessions: async () => {},
  addSession: async (_session) => {},
  updateSession: async (_id, _updates) => {},
  deleteSession: async (_id) => {},
});

/**
 * PUBLIC_INTERFACE
 * WorkoutProvider wraps children and provides workout state and actions.
 * Integrates with AuthContext to attach auth token when calling APIs.
 */
export function WorkoutProvider({ children }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const api = useMemo(() => createWorkoutApi(token), [token]);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load workouts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      listSessions();
    } else {
      setSessions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // PUBLIC_INTERFACE
  const listSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listSessions();
      setSessions(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      setError(e?.message || 'Failed to load workouts');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // PUBLIC_INTERFACE
  const addSession = useCallback(
    async (session) => {
      setLoading(true);
      setError(null);
      try {
        const created = await api.addSession(session);
        setSessions((prev) => [created, ...prev]);
        return created;
      } catch (e) {
        setError(e?.message || 'Failed to add workout');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  // PUBLIC_INTERFACE
  const updateSession = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await api.updateSession(id, updates);
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        return updated;
      } catch (e) {
        setError(e?.message || 'Failed to update workout');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  // PUBLIC_INTERFACE
  const deleteSession = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await api.deleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } catch (e) {
        setError(e?.message || 'Failed to delete workout');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const value = useMemo(
    () => ({
      sessions,
      loading,
      error,
      listSessions,
      addSession,
      updateSession,
      deleteSession,
    }),
    [sessions, loading, error, listSessions, addSession, updateSession, deleteSession]
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}
