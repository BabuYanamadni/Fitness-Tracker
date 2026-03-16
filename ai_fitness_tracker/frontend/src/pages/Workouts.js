// src/pages/Workouts.js
import React, { useEffect, useState } from 'react';
import { workoutsAPI } from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  planned:     'badge-purple',
  in_progress: 'badge-yellow',
  completed:   'badge-green',
  skipped:     'badge-red',
};

export default function Workouts() {
  const [tab, setTab]           = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', scheduled_date: new Date().toISOString().slice(0,10), notes: '' });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      workoutsAPI.getSessionHistory(),
      workoutsAPI.getExercises(),
    ]).then(([s, e]) => {
      setSessions(s.data);
      setExercises(e.data.results || e.data);
    }).finally(() => setLoading(false));
  }, []);

  const createSession = async (e) => {
    e.preventDefault();
    try {
      const { data } = await workoutsAPI.createSession(newSession);
      setSessions(prev => [data, ...prev]);
      setShowCreate(false);
      setNewSession({ name: '', scheduled_date: new Date().toISOString().slice(0,10), notes: '' });
      toast.success('Workout session created!');
    } catch { toast.error('Failed to create session'); }
  };

  const startSession = async (id) => {
    try {
      const { data } = await workoutsAPI.startSession(id);
      setSessions(prev => prev.map(s => s.id === id ? data : s));
      toast.success('Workout started! 💪');
    } catch { toast.error('Could not start session'); }
  };

  const completeSession = async (id) => {
    const dur = prompt('Duration in minutes?');
    if (!dur) return;
    try {
      const { data } = await workoutsAPI.completeSession(id, {
        duration_minutes: parseInt(dur),
        calories_burned:  Math.round(parseInt(dur) * 7),
      });
      setSessions(prev => prev.map(s => s.id === id ? data : s));
      toast.success('Workout completed! 🎉');
    } catch { toast.error('Could not complete session'); }
  };

  if (loading) return <Loader text="Loading workouts…" />;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Workouts <span style={{ color: 'var(--clr-primary)' }}>🏋️</span></h1>
          <p style={{ color: 'var(--clr-muted)' }}>Track and manage your training sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Session</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '0.5rem' }}>
        {['sessions', 'exercises'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem',
            color: tab === t ? 'var(--clr-primary)' : 'var(--clr-muted)',
            borderBottom: tab === t ? '2px solid var(--clr-primary)' : '2px solid transparent',
          }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Create session modal */}
      {showCreate && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div className="card" style={{ width:'100%', maxWidth:'460px' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'1.25rem' }}>New Workout Session</h2>
            <form onSubmit={createSession}>
              <div className="form-group">
                <label>Session Name *</label>
                <input className="input-field" placeholder="e.g. Upper Body Strength" required
                  value={newSession.name} onChange={e => setNewSession(s => ({...s, name: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input className="input-field" type="date"
                  value={newSession.scheduled_date} onChange={e => setNewSession(s => ({...s, scheduled_date: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input-field" rows={3} placeholder="Optional notes…"
                  value={newSession.notes} onChange={e => setNewSession(s => ({...s, notes: e.target.value}))} />
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>Create</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {tab === 'sessions' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {sessions.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🏋️</div>
              <p style={{ color:'var(--clr-muted)' }}>No sessions yet. Create your first workout!</p>
            </div>
          )}
          {sessions.map(s => (
            <div key={s.id} className="card animate-fade-up" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{
                width:'48px', height:'48px', borderRadius:'var(--r-md)', flexShrink:0,
                background: s.status==='completed' ? 'rgba(0,229,160,0.15)' : 'rgba(108,99,255,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem',
              }}>{s.status==='completed' ? '✅' : '🏋️'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{s.name}</div>
                <div style={{ color:'var(--clr-muted)', fontSize:'0.8rem' }}>
                  {s.scheduled_date} {s.duration_minutes ? `• ${s.duration_minutes} min` : ''} {s.calories_burned ? `• ${s.calories_burned} kcal` : ''}
                </div>
              </div>
              <span className={`badge ${STATUS_COLORS[s.status] || 'badge-purple'}`}>{s.status}</span>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {s.status === 'planned' && (
                  <button className="btn btn-primary" style={{ padding:'0.4rem 0.9rem', fontSize:'0.8rem' }} onClick={() => startSession(s.id)}>Start</button>
                )}
                {s.status === 'in_progress' && (
                  <button className="btn btn-primary" style={{ padding:'0.4rem 0.9rem', fontSize:'0.8rem', background:'var(--clr-accent2)', color:'#fff' }} onClick={() => completeSession(s.id)}>Finish</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercises Tab */}
      {tab === 'exercises' && (
        <div className="grid-3">
          {exercises.map(ex => (
            <div key={ex.id} className="card animate-fade-up">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                <span className="badge badge-purple">{ex.primary_muscle}</span>
                <span className={`badge ${ex.difficulty==='beginner'?'badge-green':ex.difficulty==='intermediate'?'badge-yellow':'badge-red'}`}>{ex.difficulty}</span>
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:'0.4rem' }}>{ex.name}</h3>
              <p style={{ color:'var(--clr-muted)', fontSize:'0.8rem' }}>{ex.equipment || 'No equipment'}</p>
              <div style={{ marginTop:'0.75rem', fontSize:'0.78rem', color:'var(--clr-muted)' }}>
                ~{ex.calories_per_min} kcal/min
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
