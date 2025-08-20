const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Helper to handle JSON HTTP requests for nutrition endpoints.
 */
async function http(path, { method = 'GET', body, token } = {}) {
  const url = `${DEFAULT_BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const message = data?.message || `Request failed with ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * Creates a Nutrition API client. Replace endpoint paths to match backend.
 * Expected meal shape:
 * { id, name, calories, protein, carbs, fats, dateTime }
 */
export function createNutritionApi(token) {
  // Dev-mode in-memory storage
  if (!DEFAULT_BASE_URL) {
    if (!window.__ft_meals) {
      const nowIso = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
      window.__ft_meals = [
        {
          id: 'meal-demo-1',
          name: 'Oatmeal with Berries',
          calories: 320,
          protein: 12,
          carbs: 55,
          fats: 6,
          dateTime: nowIso,
        },
      ];
    }
  }

  return {
    /**
     * PUBLIC_INTERFACE
     * List meals for the current user.
     */
    async listMeals() {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => resolve([...window.__ft_meals]), 200)
        );
      }
      return http('/nutrition/meals', { method: 'GET', token });
    },

    /**
     * PUBLIC_INTERFACE
     * Add a meal.
     */
    async addMeal(meal) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => {
            const created = {
              id: `meal-${Math.random().toString(36).slice(2, 10)}`,
              ...meal,
            };
            window.__ft_meals = [created, ...window.__ft_meals];
            resolve(created);
          }, 250)
        );
      }
      return http('/nutrition/meals', { method: 'POST', body: meal, token });
    },

    /**
     * PUBLIC_INTERFACE
     * Update a meal by id.
     */
    async updateMeal(id, updates) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const idx = window.__ft_meals.findIndex((m) => m.id === id);
            if (idx === -1) return reject(new Error('Not found'));
            const updated = { ...window.__ft_meals[idx], ...updates };
            window.__ft_meals[idx] = updated;
            resolve(updated);
          }, 220)
        );
      }
      return http(`/nutrition/meals/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: updates,
        token,
      });
    },

    /**
     * PUBLIC_INTERFACE
     * Delete a meal by id.
     */
    async deleteMeal(id) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const before = window.__ft_meals.length;
            window.__ft_meals = window.__ft_meals.filter((m) => m.id !== id);
            if (window.__ft_meals.length === before) return reject(new Error('Not found'));
            resolve({ success: true });
          }, 180)
        );
      }
      return http(`/nutrition/meals/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token,
      });
    },
  };
}
