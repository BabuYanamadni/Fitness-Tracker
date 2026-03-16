// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',  icon: '⚡' },
  { path: '/workouts',   label: 'Workouts',   icon: '🏋️' },
  { path: '/nutrition',  label: 'Nutrition',  icon: '🥗' },
  { path: '/ai-coach',   label: 'AI Coach',   icon: '🤖' },
  { path: '/analytics',  label: 'Analytics',  icon: '📊' },
  { path: '/profile',    label: 'Profile',    icon: '👤' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width:        collapsed ? '72px' : '240px',
      minHeight:    '100vh',
      background:   'var(--clr-surface)',
      borderRight:  '1px solid var(--clr-border)',
      display:      'flex',
      flexDirection:'column',
      transition:   'width 0.25s ease',
      position:     'sticky',
      top:          0,
      flexShrink:   0,
    }}>
      {/* Header */}
      <div style={{
        padding:      '1.5rem 1rem 1rem',
        borderBottom: '1px solid var(--clr-border)',
        display:      'flex',
        alignItems:   'center',
        gap:          '0.75rem',
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'var(--clr-primary)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0,
        }}>⚡</div>
        {!collapsed && (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1rem', color: 'var(--clr-text)', lineHeight: 1.2,
          }}>AI Fitness<br/><span style={{ color:'var(--clr-primary)' }}>Tracker Pro</span></span>
        )}
        <button onClick={() => setCollapsed(c => !c)} style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'var(--clr-muted)', cursor: 'pointer', fontSize: '1rem',
        }}>{collapsed ? '→' : '←'}</button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.5rem' }}>
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display:       'flex',
            alignItems:    'center',
            gap:           '0.75rem',
            padding:       '0.7rem 0.75rem',
            borderRadius:  'var(--r-md)',
            marginBottom:  '0.25rem',
            textDecoration:'none',
            fontFamily:    'var(--font-display)',
            fontWeight:    600,
            fontSize:      '0.9rem',
            color:         isActive ? 'var(--clr-primary)' : 'var(--clr-muted)',
            background:    isActive ? 'rgba(0,229,160,0.1)' : 'transparent',
            transition:    'all 0.15s',
          })}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{
        padding: '1rem 0.75rem',
        borderTop: '1px solid var(--clr-border)',
      }}>
        {!collapsed && user && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--clr-text)' }}>
              {user.first_name || user.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>
              {user.fitness_level}
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-outline" style={{
          width: '100%', justifyContent: 'center', padding: '0.6rem',
        }}>
          {collapsed ? '🚪' : '🚪 Logout'}
        </button>
      </div>
    </aside>
  );
}
