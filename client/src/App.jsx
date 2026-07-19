import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import Navbar from "./components/Navbar";
import Login from './pages/Login';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const MyPlanPage = lazy(() => import('./pages/MyPlanPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const BuddyPage = lazy(() => import('./pages/BuddyPage'));
const MemoryReelPage = lazy(() => import('./pages/MemoryReelPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const QRScannerPage = lazy(() => import('./pages/QRScannerPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const HostDashboard = lazy(() => import('./pages/HostDashboard'));

// Fallback Loading Component
function SuspenseFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(1000px 600px at 10% -10%, #1d2340 0%, #0b0d12 60%)',
      padding: '2rem'
    }}>
      <LoadingSkeleton type="card" count={3} />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <SuspenseFallback />;
  }

  return user ? (
    <Suspense fallback={<SuspenseFallback />}>
      {children}
    </Suspense>
  ) : (
    <Navigate to="/login" />
  );
}

// Main App Content with Routes
function AppContent() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(1000px 600px at 10% -10%, #1d2340 0%, #0b0d12 60%) fixed',
      color: 'var(--text)'
    }}>
      {user && <Navbar />}
      
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/events" element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/my-plan" element={
          <ProtectedRoute>
            <MyPlanPage />
          </ProtectedRoute>
        } />
        
        <Route path="/map" element={
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        } />
        
        <Route path="/rewards" element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/buddy" element={
          <ProtectedRoute>
            <BuddyPage />
          </ProtectedRoute>
        } />
        
        <Route path="/memory-reel" element={
          <ProtectedRoute>
            <MemoryReelPage />
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/scan-qr" element={
          <ProtectedRoute>
            <QRScannerPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/host" element={
          <ProtectedRoute>
            <HostDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

// Main App Component with Providers
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
