// src/pages/Analytics.js
import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--clr-surface2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--r-md)', padding: '0.75rem' }}>
        <p style={{ color: 'var(--clr-muted)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, fontSize: '0.88rem', fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(0) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [overview,  setOverview]  = useState(null);
  const [weekly,    setWeekly]    = useState([]);
  const [monthly,   setMonthly]   = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [range,     setRange]     = useState('weekly');

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      analyticsAPI.getWeeklyStats(),
      analyticsAPI.getMonthlyStats(),
      analyticsAPI.getAchievements(),
    ]).then(([ov, wk, mn, ach]) => {
      setOverview(ov.data);
      setWeekly([...wk.data].reverse());
      setMonthly([...mn.data].reverse());
      setAchievements(ach.data.results || ach.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Crunching your stats…" />;

  const chartData = range === 'weekly' ? weekly : monthly;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Analytics <span style={{ color: 'var(--clr-primary)' }}>📊</span></h1>
        <p style={{ color: 'var(--clr-muted)' }}>Dive deep into your fitness progress</p>
      </div>

      {/* KPIs */}
      {overview && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard icon="🏃" label="Total Workouts"       value={overview.total_workouts}               delay={0}   />
          <StatCard icon="⚡" label="Current Streak"       value={overview.current_streak_days} unit="d"  delay={60}  />
          <StatCard icon="🔥" label="Avg Cal/Day Burned"   value={overview.weekly_avg_calories_burned}   delay={120} color="var(--clr-accent2)" />
          <StatCard icon="⏱️" label="Weekly Training Time" value={overview.weekly_total_duration_min} unit="min" delay={180} color="var(--clr-accent)" />
        </div>
      )}

      {/* Range toggle + Charts */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Calories Burned</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['weekly', 'monthly'].map(r => (
              <button key={r} onClick={() => setRange(r)} className={`btn ${range === r ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', textTransform: 'capitalize' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e5a0" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--clr-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--clr-muted)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calories_burned" name="Calories Burned" stroke="#00e5a0" fill="url(#burnGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-muted)' }}>Start logging workouts to see your progress!</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Workout duration bar */}
        <div className="card">
          <h2 className="section-title">Workout Duration (min)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--clr-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--clr-muted)', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_duration_min" name="Duration" fill="var(--clr-accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign:'center', padding:'2rem', color:'var(--clr-muted)' }}>No data yet</div>}
        </div>

        {/* Calorie balance */}
        <div className="card">
          <h2 className="section-title">Calorie Balance</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--clr-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--clr-muted)', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                <Line type="monotone" dataKey="calories_consumed" name="Consumed" stroke="var(--clr-accent2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="calories_burned"   name="Burned"   stroke="var(--clr-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign:'center', padding:'2rem', color:'var(--clr-muted)' }}>No data yet</div>}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h2 className="section-title">Achievements 🏆</h2>
        {achievements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--clr-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <p>Complete workouts and hit milestones to earn achievements!</p>
          </div>
        ) : (
          <div className="grid-3">
            {achievements.map(ua => (
              <div key={ua.id} style={{
                padding: '1rem', background: 'var(--clr-surface2)',
                borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--r-md)', flexShrink: 0,
                  background: 'rgba(251,191,36,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                }}>{ua.achievement.icon || '🏆'}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{ua.achievement.name}</div>
                  <div style={{ color: 'var(--clr-muted)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>{ua.achievement.description}</div>
                  <span className="badge badge-yellow">+{ua.achievement.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
