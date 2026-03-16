// src/components/Loader.js
import React from 'react';

export default function Loader({ size = 40, text = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem' }}>
      <svg width={size} height={size} viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none"
          stroke="var(--clr-border)" strokeWidth="4" />
        <circle cx="25" cy="25" r="20" fill="none"
          stroke="var(--clr-primary)" strokeWidth="4"
          strokeDasharray="80 45"
          strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate"
            values="0 25 25;360 25 25" dur="0.9s" repeatCount="indefinite" />
        </circle>
      </svg>
      {text && <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>{text}</p>}
    </div>
  );
}
