import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

/**
 * PUBLIC_INTERFACE
 * ThemeToggle renders a simple switch/button to toggle between light and dark modes.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isDark = theme === 'dark';
  const label = isDark ? 'Dark' : 'Light';

  return (
    <button
      aria-label="Toggle color theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className={`ft-theme-toggle ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.6rem',
        borderRadius: '999px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text)',
        cursor: 'pointer',
        fontSize: '0.9rem',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          width: '1.1rem',
          height: '1.1rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
      <span>{label}</span>
    </button>
  );
}
