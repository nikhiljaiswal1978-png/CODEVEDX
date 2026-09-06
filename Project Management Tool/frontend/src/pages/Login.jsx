import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(email, password); nav('/'); }
    catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Login</h2>
        <p className="muted auth-subtitle">Sign in to your project workspace.</p>
        <form onSubmit={submit}>
          <label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {err && <p className="form-error">{err}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="muted auth-footer">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
