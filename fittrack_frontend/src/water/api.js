const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Helper to handle JSON HTTP requests for water endpoints.
 */
async function http(path, { method = 'GET', body } = {}) {
  const url = `${DEFAULT_BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
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
 * Creates a Water API client. Replace endpoints to match backend.
 * Expected water log shape: { id, amountMl, dateTime }
 */
export function createWaterApi() {
  // Dev-mode in-memory storage
  if (!DEFAULT_BASE_URL) {
    if (!window.__ft_water_logs) {
      const nowIso = new Date().toISOString().slice(0, 16);
      window.__ft_water_logs = [
        { id: 'water-demo-1', amountMl: 250, dateTime: nowIso },
        { id: 'water-demo-2', amountMl: 500, dateTime: nowIso },
      ];
    }
  }

  return {
    /**
     * PUBLIC_INTERFACE
     * List water intake logs.
     */
    async listLogs() {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => resolve([...window.__ft_water_logs]), 120)
        );
      }
      return http('/water/logs', { method: 'GET' });
    },

    /**
     * PUBLIC_INTERFACE
     * Add a water intake log.
     */
    async addLog(log) {
      const sanitized = {
        amountMl: Number(log.amountMl),
        dateTime: log.dateTime,
      };
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => {
            const created = {
              id: `water-${Math.random().toString(36).slice(2, 10)}`,
              ...sanitized,
            };
            window.__ft_water_logs = [created, ...window.__ft_water_logs];
            resolve(created);
          }, 140)
        );
      }
      return http('/water/logs', { method: 'POST', body: sanitized });
    },

    /**
     * PUBLIC_INTERFACE
     * Update a water log by id.
     */
    async updateLog(id, updates) {
      const sanitized = {};
      if (updates.amountMl != null) sanitized.amountMl = Number(updates.amountMl);
      if (updates.dateTime != null) sanitized.dateTime = updates.dateTime;

      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const idx = window.__ft_water_logs.findIndex((l) => l.id === id);
            if (idx === -1) return reject(new Error('Not found'));
            const updated = { ...window.__ft_water_logs[idx], ...sanitized };
            window.__ft_water_logs[idx] = updated;
            resolve(updated);
          }, 130)
        );
      }
      return http(`/water/logs/${encodeURIComponent(id)}`, { method: 'PUT', body: sanitized });
    },

    /**
     * PUBLIC_INTERFACE
     * Delete a water log by id.
     */
    async deleteLog(id) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const before = window.__ft_water_logs.length;
            window.__ft_water_logs = window.__ft_water_logs.filter((l) => l.id !== id);
            if (window.__ft_water_logs.length === before) return reject(new Error('Not found'));
            resolve({ success: true });
          }, 120)
        );
      }
      return http(`/water/logs/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  };
}
