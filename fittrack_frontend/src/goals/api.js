const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Helper to handle JSON HTTP requests for goals.
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
 * Creates a Goals API client. Replace endpoint paths to match backend.
 * Expected goals shape:
 * { targetWeightKg: number | null, dailySteps: number | null, workoutsPerWeek: number | null }
 */
export function createGoalsApi(token) {
  // Dev-mode in-memory single record
  if (!DEFAULT_BASE_URL) {
    if (!window.__ft_goals) {
      window.__ft_goals = {
        targetWeightKg: null,
        dailySteps: 8000,
        workoutsPerWeek: 3,
      };
    }
  }

  return {
    /**
     * PUBLIC_INTERFACE
     * Get current user's goals.
     */
    async getGoals() {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ ...window.__ft_goals }), 200)
        );
      }
      return http('/goals', { method: 'GET', token });
    },

    /**
     * PUBLIC_INTERFACE
     * Set or update current user's goals.
     */
    async setGoals(goals) {
      const sanitized = {
        targetWeightKg:
          goals.targetWeightKg === '' || goals.targetWeightKg === null
            ? null
            : Number(goals.targetWeightKg),
        dailySteps:
          goals.dailySteps === '' || goals.dailySteps === null
            ? null
            : Number(goals.dailySteps),
        workoutsPerWeek:
          goals.workoutsPerWeek === '' || goals.workoutsPerWeek === null
            ? null
            : Number(goals.workoutsPerWeek),
      };

      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => {
            window.__ft_goals = { ...window.__ft_goals, ...sanitized };
            resolve({ ...window.__ft_goals });
          }, 240)
        );
      }
      return http('/goals', { method: 'PUT', body: sanitized, token });
    },

    /**
     * PUBLIC_INTERFACE
     * Clear goals for current user.
     */
    async clearGoals() {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => {
            window.__ft_goals = { targetWeightKg: null, dailySteps: null, workoutsPerWeek: null };
            resolve({ success: true });
          }, 180)
        );
      }
      return http('/goals', { method: 'DELETE', token });
    },
  };
}
