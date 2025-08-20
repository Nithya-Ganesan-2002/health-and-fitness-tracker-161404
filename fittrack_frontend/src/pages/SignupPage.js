import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * SignupPage renders account creation form and handles registration.
 */
export default function SignupPage() {
  const { signup, loading, error, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [localError, setLocalError] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!form.name || !form.email || !form.password) {
      setLocalError('Please complete all fields');
      return;
    }
    try {
      await signup(form);
      navigate('/');
    } catch {
      // context error display
    }
  };

  return (
    <div className="auth-container">
      <h1>FitTrack</h1>
      <h2>Create account</h2>
      {(localError || error) && <div className="auth-error" role="alert">{localError || error}</div>}
      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" value={form.name} onChange={onChange} placeholder="Your name" autoComplete="name" />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" autoComplete="new-password" />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Sign up'}</button>
      </form>
      <div className="auth-links">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
}
