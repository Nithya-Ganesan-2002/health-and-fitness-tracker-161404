import React, { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * ResetPasswordPage completes password reset using a token from the email link.
 */
export default function ResetPasswordPage() {
  const { resetPassword, loading, error } = useContext(AuthContext);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState(null);
  const [status, setStatus] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setStatus(null);
    if (!token) {
      setLocalError('Invalid or missing token.');
      return;
    }
    if (!password || password.length < 8) {
      setLocalError('Password should be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }
    try {
      await resetPassword(token, password);
      setStatus('Password has been reset. You can now login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      // error shown via context
    }
  };

  return (
    <div className="auth-container">
      <h1>FitTrack</h1>
      <h2>Set a new password</h2>
      {(localError || error) && <div className="auth-error" role="alert">{localError || error}</div>}
      {status && <div className="auth-success" role="status">{status}</div>}
      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="password">New password</label>
        <input id="password" name="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        <label htmlFor="confirm">Confirm new password</label>
        <input id="confirm" name="confirm" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Updating…' : 'Reset password'}</button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
