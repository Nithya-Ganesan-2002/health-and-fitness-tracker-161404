import React, { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * LoginPage renders login form and handles authentication.
 */
export default function LoginPage() {
  const { login, loading, error, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      const redirect = params.get('redirect') || '/';
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, params]);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!form.email || !form.password) {
      setLocalError('Please enter email and password');
      return;
    }
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      // error handled via context
    }
  };

  return (
    <div className="auth-container">
      <h1>FitTrack</h1>
      <h2>Login</h2>
      {(localError || error) && <div className="auth-error" role="alert">{localError || error}</div>}
      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" autoComplete="current-password" />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
      </form>
      <div className="auth-links">
        <Link to="/signup">Create an account</Link>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
}
