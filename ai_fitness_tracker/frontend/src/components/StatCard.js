// src/components/StatCard.js
import React from 'react';

export default function StatCard({ icon, label, value, unit, change, color = 'var(--clr-primary)', delay = 0 }) {
  return (
    <div className="card animate-fade-up" style={{
      animationDelay: `${delay}ms`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: color,
        opacity: 0.08,
        filter: 'blur(20px)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          width: '44px', height: '44px',
          background: `${color}1a`,
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem',
        }}>{icon}</div>
        {change !== undefined && (
          <span style={{
            fontSize: '0.78rem', fontWeight: 600,
            color: change >= 0 ? 'var(--clr-primary)' : 'var(--clr-accent2)',
            background: change >= 0 ? 'rgba(0,229,160,0.1)' : 'rgba(255,107,107,0.1)',
            padding: '0.2rem 0.5rem', borderRadius: '50px',
          }}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}
          </span>
        )}
      </div>

      <div style={{ fontSize: '1.9rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>
        {value ?? '—'}
        {unit && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--clr-muted)', marginLeft: '4px' }}>{unit}</span>}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--clr-muted)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}
