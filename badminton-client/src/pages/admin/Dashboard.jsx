import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tournamentsAPI, playersAPI, matchesAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tournaments: 0, players: 0, liveMatches: 0, completed: 0 });
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tournamentsAPI.getAll(),
      playersAPI.getAll(),
      matchesAPI.getAll({ status: 'ongoing' }),
      matchesAPI.getAll({ status: 'completed' }),
    ]).then(([t, p, live, done]) => {
      setStats({
        tournaments: t.data.length,
        players: p.data.length,
        liveMatches: live.data.length,
        completed: done.data.length,
      });
      setRecentMatches(done.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/tournaments" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + New Tournament
          </Link>
          <Link to="/admin/players" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Manage Players
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Tournaments"  value={stats.tournaments} color="blue" />
        <StatCard label="Players"      value={stats.players}     color="green" />
        <StatCard label="Live matches" value={stats.liveMatches} color="amber" />
        <StatCard label="Completed"    value={stats.completed}   color="blue" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent match results</h2>
          <Link to="/admin/matches" className="text-blue-600 text-sm hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentMatches.length === 0 && (
            <p className="p-6 text-center text-gray-400 text-sm">No completed matches yet</p>
          )}
          {recentMatches.map(m => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Round {m.round}</span>
                <span className="text-sm font-medium text-gray-900">
                  {m.player1?.name} <span className="text-gray-400 font-normal">vs</span> {m.player2?.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 font-medium">
                  {m.winner?.name} won
                </span>
                <Link to={`/admin/matches/${m.id}`} className="text-xs text-blue-600 hover:underline">
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
