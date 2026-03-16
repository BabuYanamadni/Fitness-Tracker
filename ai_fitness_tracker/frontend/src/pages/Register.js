// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOALS   = ['weight_loss','muscle_gain','endurance','flexibility','general'];
const LEVELS  = ['beginner','intermediate','advanced'];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', fitness_goal: 'general', fitness_level: 'beginner',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const msg  = data ? Object.values(data).flat().join(' ') : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--clr-bg)',
      backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(108,99,255,0.07) 0%, transparent 60%)',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', background: 'var(--clr-primary)',
            borderRadius: '14px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem',
          }}>⚡</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--clr-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            Your AI-powered fitness journey starts here
          </p>
        </div>

        <form onSubmit={handle} className="card">
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>First Name</label>
              <input className="input-field" placeholder="John" value={form.first_name} onChange={set('first_name')} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input className="input-field" placeholder="Doe" value={form.last_name} onChange={set('last_name')} />
            </div>
          </div>
          <div className="form-group">
            <label>Username *</label>
            <input className="input-field" placeholder="johndoe" value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input className="input-field" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>Password *</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label>Confirm *</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password2} onChange={set('password2')} required />
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select className="input-field" value={form.fitness_goal} onChange={set('fitness_goal')}>
                {GOALS.map(g => <option key={g} value={g}>{g.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Fitness Level</label>
              <select className="input-field" value={form.fitness_level} onChange={set('fitness_level')}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
          <p style={{ textAlign:'center', marginTop:'1rem', color:'var(--clr-muted)', fontSize:'0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--clr-primary)', fontWeight:600 }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
