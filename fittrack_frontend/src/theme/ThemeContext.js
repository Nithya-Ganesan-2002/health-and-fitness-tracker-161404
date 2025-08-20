import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ThemeContext provides global theme state (light/dark), a toggle method,
 * and ensures the current theme is persisted in localStorage and applied
 * to the document for CSS variable styling.
 */
export const ThemeContext = createContext({
  theme: 'light',
  // PUBLIC_INTERFACE
  toggleTheme: () => {},
  // PUBLIC_INTERFACE
  setTheme: (_theme) => {},
});

/**
 * PUBLIC_INTERFACE
 * ThemeProvider wraps the app and manages theme state with persistence.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fittrack_theme');
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
        return;
      }
      // If no stored value, respect system preference for first load
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    } catch {
      setThemeState('light');
    }
  }, []);

  // Apply theme to document and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('fittrack_theme', theme);
    } catch {
      // ignore storage errors (e.g., private mode)
    }
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
