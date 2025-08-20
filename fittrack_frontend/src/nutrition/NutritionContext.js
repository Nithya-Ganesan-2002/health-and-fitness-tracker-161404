import React, { createContext, useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { createNutritionApi } from './api';

/**
 * PUBLIC_INTERFACE
 * NutritionContext provides state and actions for meal logs across the app.
 * Stores meals and exposes CRUD operations ready to connect to backend APIs.
 */
export const NutritionContext = createContext({
  meals: [],
  loading: false,
  error: null,
  listMeals: async () => {},
  addMeal: async (_meal) => {},
  updateMeal: async (_id, _updates) => {},
  deleteMeal: async (_id) => {},
});

/**
 * PUBLIC_INTERFACE
 * NutritionProvider wraps children and provides nutrition state and actions.
 */
export function NutritionProvider({ children }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const api = useMemo(() => createNutritionApi(token), [token]);

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      listMeals();
    } else {
      setMeals([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // PUBLIC_INTERFACE
  const listMeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMeals();
      setMeals(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      setError(e?.message || 'Failed to load meals');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // PUBLIC_INTERFACE
  const addMeal = useCallback(async (meal) => {
    setLoading(true);
    setError(null);
    try {
      const created = await api.addMeal(meal);
      setMeals((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      setError(e?.message || 'Failed to add meal');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // PUBLIC_INTERFACE
  const updateMeal = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateMeal(id, updates);
      setMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (e) {
      setError(e?.message || 'Failed to update meal');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // PUBLIC_INTERFACE
  const deleteMeal = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteMeal(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      setError(e?.message || 'Failed to delete meal');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const value = useMemo(() => ({
    meals,
    loading,
    error,
    listMeals,
    addMeal,
    updateMeal,
    deleteMeal,
  }), [meals, loading, error, listMeals, addMeal, updateMeal, deleteMeal]);

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>;
}
