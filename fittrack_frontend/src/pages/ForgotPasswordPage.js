import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * ForgotPasswordPage allows users to request a password reset email.
 */
export default function ForgotPasswordPage() {
  const { requestPasswordReset, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!email) return;
    try {
      await requestPasswordReset(email);
      setStatus('If an account exists for this email, a reset link has been sent.');
    } catch {
      // error shown via context
    }
  };

  return (
    <div className="auth-container">
      <h1>FitTrack</h1>
      <h2>Reset your password</h2>
      {error && <div className="auth-error" role="alert">{error}</div>}
      {status && <div className="auth-success" role="status">{status}</div>}
      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
