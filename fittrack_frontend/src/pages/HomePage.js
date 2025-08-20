import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * HomePage is an example protected page, shows basic user info and logout.
 */
export default function HomePage() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="auth-container">
      <h1>Welcome to FitTrack</h1>
      <div style={{ marginTop: 12 }}>
        <p>You are signed in as {user?.name || user?.email || 'User'}.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Link to="/workouts" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Go to Workouts
          </Link>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
