// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './assets/styles/global.css';

// Pages
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Workouts   from './pages/Workouts';
import Nutrition  from './pages/Nutrition';
import AICoach    from './pages/AICoach';
import Analytics  from './pages/Analytics';
import Profile    from './pages/Profile';

// Layout
import Sidebar    from './components/Sidebar';
import Loader     from './components/Loader';

function PrivateLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Loading…" />;
  if (!user)   return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--clr-bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Loading…" />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--clr-surface2)',
              color:      'var(--clr-text)',
              border:     '1px solid var(--clr-border)',
              fontFamily: 'var(--font-body)',
            },
            success: { iconTheme: { primary: '#00e5a0', secondary: '#0a0e1a' } },
            error:   { iconTheme: { primary: '#ff6b6b', secondary: '#0a0e1a' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Private */}
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/workouts"   element={<Workouts />} />
            <Route path="/nutrition"  element={<Nutrition />} />
            <Route path="/ai-coach"   element={<AICoach />} />
            <Route path="/analytics"  element={<Analytics />} />
            <Route path="/profile"    element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
