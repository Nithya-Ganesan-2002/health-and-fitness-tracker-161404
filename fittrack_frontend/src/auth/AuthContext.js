import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * AuthContext provides authentication state and actions across the app.
 * Includes: user, isAuthenticated, loading, error, and actions: login, signup, logout, requestPasswordReset, resetPassword
 */
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  // Actions
  login: async (_email, _password) => {},
  signup: async (_payload) => {},
  logout: () => {},
  requestPasswordReset: async (_email) => {},
  resetPassword: async (_token, _newPassword) => {},
});

/**
 * PUBLIC_INTERFACE
 * AuthProvider wraps the application and manages auth state.
 * It persists a session token in localStorage and rehydrates user state on mount.
 */
export function AuthProvider({ children, api }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // session token/JWT
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Rehydrate session from storage
  useEffect(() => {
    const stored = localStorage.getItem('ft_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          setToken(parsed.token);
          setUser(parsed.user || null);
        }
      } catch {
        // ignore malformed
      }
    }
  }, []);

  // Persist session
  useEffect(() => {
    if (token) {
      localStorage.setItem('ft_auth', JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem('ft_auth');
    }
  }, [token, user]);

  const handleAuthSuccess = useCallback((payload) => {
    // payload expected shape: { token, user }
    setToken(payload?.token || null);
    setUser(payload?.user || null);
    setError(null);
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.login({ email, password });
        handleAuthSuccess(resp);
        return resp;
      } catch (e) {
        setError(e?.message || 'Login failed');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api, handleAuthSuccess]
  );

  const signup = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.signup(payload);
        handleAuthSuccess(resp);
        return resp;
      } catch (e) {
        setError(e?.message || 'Signup failed');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api, handleAuthSuccess]
  );

  const logout = useCallback(() => {
    // Optionally notify backend to revoke token
    try {
      api.logout(token);
    } catch {
      // ignore network logout failure for client state
    }
    setToken(null);
    setUser(null);
    setError(null);
  }, [api, token]);

  const requestPasswordReset = useCallback(
    async (email) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.requestPasswordReset(email);
        return resp;
      } catch (e) {
        setError(e?.message || 'Password reset request failed');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const resetPassword = useCallback(
    async (tokenParam, newPassword) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.resetPassword(tokenParam, newPassword);
        return resp;
      } catch (e) {
        setError(e?.message || 'Password reset failed');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!token,
      loading,
      error,
      login,
      signup,
      logout,
      requestPasswordReset,
      resetPassword,
      token,
    }),
    [user, token, loading, error, login, signup, logout, requestPasswordReset, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
