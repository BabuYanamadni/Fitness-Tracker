// src/pages/Profile.js
import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOALS  = ['weight_loss','muscle_gain','endurance','flexibility','general'];
const LEVELS = ['beginner','intermediate','advanced'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    first_name:    user?.first_name    || '',
    last_name:     user?.last_name     || '',
    date_of_birth: user?.date_of_birth || '',
    gender:        user?.gender        || '',
    height_cm:     user?.height_cm     || '',
    weight_kg:     user?.weight_kg     || '',
    fitness_goal:  user?.fitness_goal  || 'general',
    fitness_level: user?.fitness_level || 'beginner',
    bio:           user?.bio           || '',
  });
  const [pwForm,    setPwForm]    = useState({ old_password: '', new_password: '', confirm: '' });
  const [tab,       setTab]       = useState('profile');
  const [saving,    setSaving]    = useState(false);
  const [savingPw,  setSavingPw]  = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.height_cm) delete payload.height_cm;
      if (!payload.weight_kg) delete payload.weight_kg;
      if (!payload.date_of_birth) delete payload.date_of_birth;
      const { data } = await authAPI.updateProfile(payload);
      updateUser(data);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Update failed');
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      toast.success('Password updated!');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || 'Password change failed');
    } finally { setSavingPw(false); }
  };

  const bmiColor = (bmi) => {
    if (!bmi) return 'var(--clr-muted)';
    if (bmi < 18.5) return '#6c63ff';
    if (bmi < 25)   return '#00e5a0';
    if (bmi < 30)   return '#fbbf24';
    return '#ff6b6b';
  };

  const bmiLabel = (bmi) => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25)   return 'Normal';
    if (bmi < 30)   return 'Overweight';
    return 'Obese';
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Profile <span style={{ color: 'var(--clr-primary)' }}>👤</span></h1>
        <p style={{ color: 'var(--clr-muted)' }}>Manage your personal information and settings</p>
      </div>

      {/* Profile header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', flexShrink: 0,
        }}>
          {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>
            {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
          </h2>
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-green">{user?.fitness_level}</span>
            <span className="badge badge-purple">{user?.fitness_goal?.replace('_', ' ')}</span>
          </div>
        </div>
        {user?.bmi && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: bmiColor(user.bmi) }}>{user.bmi}</div>
            <div style={{ fontSize: '0.75rem', color: bmiColor(user.bmi), fontWeight: 600 }}>BMI · {bmiLabel(user.bmi)}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '0.5rem' }}>
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem',
            color: tab === t ? 'var(--clr-primary)' : 'var(--clr-muted)',
            borderBottom: tab === t ? '2px solid var(--clr-primary)' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="card">
          <h2 className="section-title">Personal Information</h2>
          <div className="grid-2">
            <div className="form-group">
              <label>First Name</label>
              <input className="input-field" value={form.first_name} onChange={set('first_name')} placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input className="input-field" value={form.last_name} onChange={set('last_name')} placeholder="Doe" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input className="input-field" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="input-field" value={form.gender} onChange={set('gender')}>
                <option value="">Not specified</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input className="input-field" type="number" value={form.height_cm} onChange={set('height_cm')} placeholder="175" />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input className="input-field" type="number" step="0.1" value={form.weight_kg} onChange={set('weight_kg')} placeholder="70" />
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select className="input-field" value={form.fitness_goal} onChange={set('fitness_goal')}>
                {GOALS.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Fitness Level</label>
              <select className="input-field" value={form.fitness_level} onChange={set('fitness_level')}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea className="input-field" rows={3} value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself…" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center', minWidth: '140px' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <form onSubmit={changePassword} className="card">
          <h2 className="section-title">Change Password</h2>
          <div className="form-group">
            <label>Current Password</label>
            <input className="input-field" type="password" value={pwForm.old_password}
              onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input className="input-field" type="password" value={pwForm.new_password}
              onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input className="input-field" type="password" value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingPw} style={{ justifyContent: 'center', minWidth: '160px' }}>
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
