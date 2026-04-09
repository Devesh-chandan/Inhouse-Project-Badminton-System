import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

import Login          from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Players        from './pages/admin/Players';
import Tournaments    from './pages/admin/Tournaments';
import MatchScoring   from './pages/referee/MatchScoring';
import PlayerProfile  from './pages/coach/PlayerProfile';
import LiveScoreboard from './pages/public/LiveScoreboard';
import BracketView    from './components/bracket/BracketView';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"      element={<Login />} />
            <Route path="/scoreboard" element={<Layout><LiveScoreboard /></Layout>} />
            <Route path="/bracket/:tournamentId" element={<Layout><BracketView /></Layout>} />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/players" element={
              <ProtectedRoute roles={['admin']}>
                <Layout><Players /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/tournaments" element={
              <ProtectedRoute roles={['admin']}>
                <Layout><Tournaments /></Layout>
              </ProtectedRoute>
            } />

            {/* Referee — no Navbar, full-screen scoring UI */}
            <Route path="/referee/match/:matchId" element={
              <ProtectedRoute roles={['referee', 'admin']}>
                <MatchScoring />
              </ProtectedRoute>
            } />

            {/* Coach */}
            <Route path="/coach/player/:playerId" element={
              <ProtectedRoute roles={['coach', 'admin']}>
                <Layout><PlayerProfile /></Layout>
              </ProtectedRoute>
            } />

            {/* Default redirects */}
            <Route path="/"  element={<Navigate to="/scoreboard" replace />} />
            <Route path="*"  element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
