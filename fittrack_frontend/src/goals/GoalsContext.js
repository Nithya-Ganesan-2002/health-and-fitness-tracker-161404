import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { createGoalsApi } from './api';

/**
 * PUBLIC_INTERFACE
 * GoalsContext provides state and actions for user fitness goals across the app.
 * Goals include: targetWeightKg, dailySteps, workoutsPerWeek
 */
export const GoalsContext = createContext({
  goals: null,
  loading: false,
  error: null,
  // Actions
  fetchGoals: async () => {},
  saveGoals: async (_goals) => {},
  clearGoals: async () => {},
});

/**
 * PUBLIC_INTERFACE
 * GoalsProvider wraps children and provides goals state and actions.
 * Integrates with AuthContext to attach auth token when calling APIs.
 */
export function GoalsProvider({ children }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const api = useMemo(() => createGoalsApi(token), [token]);

  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load goals when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
    } else {
      setGoals(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // PUBLIC_INTERFACE
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGoals();
      setGoals(data);
      return data;
    } catch (e) {
      setError(e?.message || 'Failed to load goals');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // PUBLIC_INTERFACE
  const saveGoals = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.setGoals(payload);
      setGoals(updated);
      return updated;
    } catch (e) {
      setError(e?.message || 'Failed to save goals');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // PUBLIC_INTERFACE
  const clearGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.clearGoals();
      setGoals(null);
    } catch (e) {
      setError(e?.message || 'Failed to clear goals');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const value = useMemo(
    () => ({
      goals,
      loading,
      error,
      fetchGoals,
      saveGoals,
      clearGoals,
    }),
    [goals, loading, error, fetchGoals, saveGoals, clearGoals]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}
