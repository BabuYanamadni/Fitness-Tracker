// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, workoutsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [overview,  setOverview]  = useState(null);
  const [weekly,    setWeekly]    = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      analyticsAPI.getWeeklyStats(),
      workoutsAPI.getTodaySessions(),
    ]).then(([ov, wk, ss]) => {
      setOverview(ov.data);
      setWeekly(wk.data.reverse());
      setSessions(ss.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard…" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--clr-muted)', marginBottom: '0.25rem' }}>{greeting} 👋</p>
        <h1 className="page-title">
          {user?.first_name || user?.username}'s <span style={{ color: 'var(--clr-primary)' }}>Dashboard</span>
        </h1>
        <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      {overview && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard icon="🏃" label="Total Workouts"     value={overview.total_workouts}      delay={0}   />
          <StatCard icon="🔥" label="This Week"          value={overview.weekly_workouts}      delay={60}  color="var(--clr-accent2)" />
          <StatCard icon="⚡" label="Current Streak"     value={overview.current_streak_days}  unit="days" delay={120} />
          <StatCard icon="🏆" label="Achievements"       value={overview.achievements_count}   delay={180} color="var(--clr-warning)" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Weekly chart */}
        <div className="card">
          <h2 className="section-title">Weekly Calories Burned</h2>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00e5a0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--clr-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--clr-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background:'var(--clr-surface2)', border:'1px solid var(--clr-border)', borderRadius:'8px' }} />
                <Area type="monotone" dataKey="calories_burned" stroke="#00e5a0" fill="url(#calGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-muted)' }}>
              No data yet. Start logging workouts!
            </div>
          )}
        </div>

        {/* Body stats */}
        <div className="card">
          <h2 className="section-title">Body Stats</h2>
          {overview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Current Weight', value: overview.current_weight ? `${overview.current_weight} kg` : '—' },
                { label: 'BMI', value: overview.bmi ?? '—' },
                { label: 'Weight Change', value: overview.weight_change_kg != null ? `${overview.weight_change_kg > 0 ? '+' : ''}${overview.weight_change_kg} kg` : '—' },
                { label: 'Avg Water / Day', value: overview.weekly_avg_water_ml ? `${(overview.weekly_avg_water_ml/1000).toFixed(1)}L` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: '1px solid var(--clr-border)',
                }}>
                  <span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's sessions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Today's Workouts</h2>
          <Link to="/workouts" className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
            View All
          </Link>
        </div>
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏋️</div>
            <p>No workouts scheduled for today.</p>
            <Link to="/workouts" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Plan a Workout
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sessions.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1rem', background: 'var(--clr-surface2)',
                borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--r-sm)',
                  background: s.status === 'completed' ? 'rgba(0,229,160,0.15)' : 'rgba(108,99,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>{s.status === 'completed' ? '✅' : '⏳'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                  <div style={{ color: 'var(--clr-muted)', fontSize: '0.8rem' }}>
                    {s.duration_minutes ? `${s.duration_minutes} min` : 'Not started'}
                    {s.calories_burned ? ` • ${s.calories_burned} kcal` : ''}
                  </div>
                </div>
                <span className={`badge ${s.status === 'completed' ? 'badge-green' : 'badge-purple'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
