const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Helper to handle JSON HTTP requests for workouts.
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
 * Creates a Workout API client. Replace endpoint paths to match backend.
 * Expected session shape: { id, date, exerciseType, reps, sets, durationMinutes, notes }
 */
export function createWorkoutApi(token) {
  // In dev mode, simulate storage in-memory via window scope to persist across navigations
  if (!DEFAULT_BASE_URL) {
    if (!window.__ft_workouts) {
      window.__ft_workouts = [
        {
          id: 'demo-1',
          date: new Date().toISOString().slice(0, 10),
          exerciseType: 'Push-ups',
          reps: 15,
          sets: 3,
          durationMinutes: 10,
          notes: 'Warmup set',
        },
      ];
    }
  }

  return {
    /**
     * PUBLIC_INTERFACE
     * List workout sessions for the current user.
     */
    async listSessions() {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => resolve([...window.__ft_workouts]), 200)
        );
      }
      return http('/workouts', { method: 'GET', token });
    },

    /**
     * PUBLIC_INTERFACE
     * Add a new workout session.
     */
    async addSession(session) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => {
            const created = {
              id: `dev-${Math.random().toString(36).slice(2, 8)}`,
              ...session,
            };
            window.__ft_workouts = [created, ...window.__ft_workouts];
            resolve(created);
          }, 250)
        );
      }
      return http('/workouts', { method: 'POST', body: session, token });
    },

    /**
     * PUBLIC_INTERFACE
     * Update an existing workout session by id.
     */
    async updateSession(id, updates) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const idx = window.__ft_workouts.findIndex((w) => w.id === id);
            if (idx === -1) return reject(new Error('Not found'));
            const updated = { ...window.__ft_workouts[idx], ...updates };
            window.__ft_workouts[idx] = updated;
            resolve(updated);
          }, 220)
        );
      }
      return http(`/workouts/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: updates,
        token,
      });
    },

    /**
     * PUBLIC_INTERFACE
     * Delete a workout session by id.
     */
    async deleteSession(id) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const before = window.__ft_workouts.length;
            window.__ft_workouts = window.__ft_workouts.filter((w) => w.id !== id);
            if (window.__ft_workouts.length === before) return reject(new Error('Not found'));
            resolve({ success: true });
          }, 180)
        );
      }
      return http(`/workouts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token,
      });
    },
  };
}
