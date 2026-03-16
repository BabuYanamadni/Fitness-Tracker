// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 💪');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--clr-bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,229,160,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(108,99,255,0.07) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px', height: '60px', background: 'var(--clr-primary)',
            borderRadius: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem',
          }}>⚡</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
            AI Fitness <span style={{ color: 'var(--clr-primary)' }}>Tracker Pro</span>
          </h1>
          <p style={{ color: 'var(--clr-muted)', marginTop: '0.5rem' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handle} className="card">
          <div className="form-group">
            <label>Email</label>
            <input className="input-field" type="email" placeholder="you@email.com"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input-field" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--clr-muted)', fontSize: '0.9rem' }}>
            No account? <Link to="/register" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
