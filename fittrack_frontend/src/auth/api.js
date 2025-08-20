const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const SITE_URL = process.env.REACT_APP_SITE_URL || '';

/**
 * Helper to handle JSON HTTP requests.
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
 * Creates an Auth API client. Replace endpoint paths to match backend.
 */
export function createAuthApi() {
  return {
    /**
     * PUBLIC_INTERFACE
     * Signup with basic fields. Extend as needed.
     */
    async signup({ name, email, password }) {
      // Endpoint placeholder: /auth/signup
      // On success expect: { token, user: { id, name, email } }
      // Here we simulate success if no backend yet:
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ token: 'dev-token', user: { id: 'dev', name, email } }), 400)
        );
      }
      return http('/auth/signup', { method: 'POST', body: { name, email, password } });
    },

    /**
     * PUBLIC_INTERFACE
     * Login with email and password.
     */
    async login({ email, password }) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            if (email && password) {
              resolve({ token: 'dev-token', user: { id: 'dev', name: email.split('@')[0], email } });
            } else {
              reject(new Error('Missing credentials'));
            }
          }, 300)
        );
      }
      return http('/auth/login', { method: 'POST', body: { email, password } });
    },

    /**
     * PUBLIC_INTERFACE
     * Logout (optional server-side invalidation).
     */
    async logout(token) {
      if (!DEFAULT_BASE_URL) return;
      try {
        await http('/auth/logout', { method: 'POST', token });
      } catch {
        // ignore logout failures
      }
    },

    /**
     * PUBLIC_INTERFACE
     * Request password reset; Backend should email a link with token.
     */
    async requestPasswordReset(email) {
      // Backend should accept a redirect/base url to build the email link.
      const emailRedirectTo = `${SITE_URL}/reset-password`;
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ message: 'Password reset email sent (dev mode)' }), 300)
        );
      }
      return http('/auth/request-password-reset', {
        method: 'POST',
        body: { email, emailRedirectTo },
      });
    },

    /**
     * PUBLIC_INTERFACE
     * Complete password reset using token from email.
     */
    async resetPassword(token, password) {
      if (!DEFAULT_BASE_URL) {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ message: 'Password has been reset (dev mode)' }), 300)
        );
      }
      return http('/auth/reset-password', { method: 'POST', body: { token, password } });
    },
  };
}
