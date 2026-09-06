import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await register(form); nav('/'); }
    catch (e) { setErr(e.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Create account</h2>
        <p className="muted auth-subtitle">Your first registered account becomes the admin.</p>
        <form onSubmit={submit}>
          <label>Name</label><input value={form.name} onChange={set('name')} required />
          <label>Email</label><input type="email" value={form.email} onChange={set('email')} required />
          <label>Password</label><input type="password" value={form.password} onChange={set('password')} required minLength={6} />
          {err && <p className="form-error">{err}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
        </form>
        <p className="muted auth-footer">Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
