import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = {
    admin:   [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/tournaments', label: 'Tournaments' }, { to: '/admin/players', label: 'Players' }],
    referee: [{ to: '/referee', label: 'My Matches' }],
    coach:   [{ to: '/coach', label: 'My Players' }],
    viewer:  [],
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-blue-600 font-bold text-lg tracking-tight">
          ShuttleScore
        </Link>
        <div className="flex gap-4">
          {(links[user?.role] || []).map(l => (
            <Link key={l.to} to={l.to} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
              {l.label}
            </Link>
          ))}
          <Link to="/scoreboard" className="text-sm text-gray-600 hover:text-blue-600 font-medium">
            Live Scores
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.name}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500">Logout</button>
      </div>
    </nav>
  );
}
