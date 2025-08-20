//
// PUBLIC_INTERFACE
// SyncService provides real-time and periodic synchronization for FitTrack data.
// - Uses WebSocket when REACT_APP_WS_URL is configured to receive live updates
// - Falls back to periodic HTTP polling when WebSocket is unavailable
// - Notifies registered listeners (contexts) of remote changes for merging into local state
//
// Usage:
//   const sync = new SyncService({ getToken: () => token, onError: console.error });
//   sync.registerHandler('workouts', (payload) => { ...merge... });
//   sync.start();
//   ...
//   sync.stop();
//
// Environment Variables:
// - REACT_APP_API_BASE_URL: base URL for HTTP polling (optional; dev mode mocks in APIs if empty)
// - REACT_APP_WS_URL: WebSocket base URL (e.g., wss://api.example.com/ws). If not provided, WS is disabled and polling is used.
//
const WS_BASE = process.env.REACT_APP_WS_URL || '';
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

/**
 * PUBLIC_INTERFACE
 * Simple event emitter to manage channel -> listeners mapping.
 */
export class SyncEventBus {
  constructor() {
    this.listeners = new Map(); // channel -> Set<fn>
  }

  // PUBLIC_INTERFACE
  on(channel, listener) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel).add(listener);
    return () => this.off(channel, listener);
  }

  // PUBLIC_INTERFACE
  off(channel, listener) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).delete(listener);
    }
  }

  emit(channel, payload) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('SyncEventBus listener error', e);
        }
      });
    }
  }
}

/**
 * Backoff helper for reconnection attempts.
 */
function nextBackoffMs(attempt) {
  const base = 1000; // 1s
  const max = 30000; // 30s
  const jitter = Math.random() * 250; // + up to 250ms jitter
  const exp = Math.min(max, base * 2 ** Math.min(6, attempt)); // cap growth
  return Math.floor(exp + jitter);
}

/**
 * PUBLIC_INTERFACE
 * SyncService coordinates WebSocket subscription and periodic polling.
 * It emits update events for domain channels:
 * - 'workouts'
 * - 'nutrition'
 * - 'water'
 * - 'goals'
 * - 'reminders'
 *
 * The backend is expected to send JSON messages in the form:
 * { channel: 'workouts'|'nutrition'|'water'|'goals'|'reminders', type: 'upsert'|'delete'|'snapshot', data: any }
 *
 * Polling endpoints (GET) expected (adjust to your backend):
 * - /workouts
 * - /nutrition/meals
 * - /water/logs
 * - /goals
 * - /reminders  (optional; if not available, reminders remain local-only)
 */
export class SyncService {
  /**
   * @param {Object} options
   * @param {() => string|null} options.getToken - Function returning current auth token
   * @param {(err: Error) => void} [options.onError] - Error handler
   * @param {number} [options.pollIntervalMs] - Polling interval (default 30000ms)
   */
  constructor({ getToken, onError, pollIntervalMs = 30000 } = {}) {
    this.getToken = getToken;
    this.onError = onError || ((e) => console.error('SyncService error', e));
    this.pollIntervalMs = pollIntervalMs;

    this.bus = new SyncEventBus();
    this.ws = null;
    this.wsAttempt = 0;
    this.pollTimer = null;
    this.running = false;

    this.handlers = new Map(); // channel -> Set<fn>
  }

  // PUBLIC_INTERFACE
  registerHandler(channel, handler) {
    return this.bus.on(channel, handler);
  }

  // PUBLIC_INTERFACE
  start() {
    if (this.running) return;
    this.running = true;

    // Start polling immediately
    this.pollNow().catch(this.onError);

    // Schedule periodic polling
    this.pollTimer = setInterval(() => {
      this.pollNow().catch(this.onError);
    }, this.pollIntervalMs);

    // Start WebSocket if configured
    if (WS_BASE) {
      this.connectWebSocket();
    }
  }

  // PUBLIC_INTERFACE
  stop() {
    this.running = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }

  connectWebSocket() {
    if (!WS_BASE) return;
    const token = this.getToken?.();
    try {
      const url = new URL(WS_BASE);
      if (token) {
        // Attach token via query param; align with backend expectations
        url.searchParams.set('token', token);
      }
      this.ws = new WebSocket(url.toString());
    } catch (e) {
      this.onError(new Error('Invalid REACT_APP_WS_URL'));
      return;
    }

    this.ws.addEventListener('open', () => {
      this.wsAttempt = 0;
      // Optionally send a hello/auth message if backend expects
      try {
        const msg = { type: 'subscribe', channels: ['workouts', 'nutrition', 'water', 'goals', 'reminders'] };
        this.ws.send(JSON.stringify(msg));
      } catch {}
    });

    this.ws.addEventListener('message', (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg && msg.channel) {
          this.bus.emit(msg.channel, msg);
        }
      } catch (e) {
        // ignore malformed
      }
    });

    this.ws.addEventListener('close', () => {
      if (!this.running) return;
      // Retry with backoff
      const delay = nextBackoffMs(this.wsAttempt++);
      setTimeout(() => this.connectWebSocket(), delay);
    });

    this.ws.addEventListener('error', () => {
      // Will trigger close as well
    });
  }

  async pollNow() {
    // If no API base configured (dev mode), skip polling - contexts use local mocks.
    if (!API_BASE) return;

    const token = this.getToken?.();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    // Helper to GET JSON
    const getJson = async (path) => {
      const res = await fetch(`${API_BASE}${path}`, { method: 'GET', headers, credentials: 'include' });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        const err = new Error(data?.message || `Poll failed ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    };

    // Poll known endpoints; emit snapshot messages so contexts can reconcile.
    try {
      const [workouts, meals, water, goals, reminders] = await Promise.allSettled([
        getJson('/workouts'),
        getJson('/nutrition/meals'),
        getJson('/water/logs'),
        getJson('/goals'),
        // Reminders endpoint may not exist; handle 404 upstream gracefully using Settled
        getJson('/reminders'),
      ]);

      if (workouts.status === 'fulfilled') {
        this.bus.emit('workouts', { channel: 'workouts', type: 'snapshot', data: workouts.value });
      }
      if (meals.status === 'fulfilled') {
        this.bus.emit('nutrition', { channel: 'nutrition', type: 'snapshot', data: meals.value });
      }
      if (water.status === 'fulfilled') {
        this.bus.emit('water', { channel: 'water', type: 'snapshot', data: water.value });
      }
      if (goals.status === 'fulfilled') {
        this.bus.emit('goals', { channel: 'goals', type: 'snapshot', data: goals.value });
      }
      if (reminders.status === 'fulfilled') {
        this.bus.emit('reminders', { channel: 'reminders', type: 'snapshot', data: reminders.value });
      }
    } catch (e) {
      // one failure shouldn't stop subsequent polling
      this.onError(e);
    }
  }
}

export default SyncService;
