import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsAPI, playersAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlayerProfile() {
  const { playerId } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getPlayerStats(playerId)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [playerId]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!data)   return <div className="p-8 text-center text-gray-500">Player not found</div>;

  const { player, summary, matchHistory } = data;
  const chartData = matchHistory.map((m, i) => ({
    name: `R${m.round}`,
    points: m.points,
    conceded: m.conceded,
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
          {player.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
          <p className="text-gray-400 text-sm">{summary.played} matches played</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Win rate"       value={`${summary.winRate}%`}          color="green" />
        <StatCard label="Wins"           value={summary.wins}                    color="blue" />
        <StatCard label="Losses"         value={summary.losses}                  color="red" />
        <StatCard label="Avg pts/match"  value={summary.avgPointsPerMatch}       color="amber" />
        <StatCard label="Sets won"       value={summary.totalSetsWon}            color="blue" />
        <StatCard label="Sets lost"      value={summary.totalSetsLost}           color="red" />
        <StatCard label="Total points"   value={summary.totalPoints}             color="green" />
        <StatCard label="Points conceded" value={summary.totalPointsConceded}    color="amber" />
      </div>

      {/* Points trend chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Points trend across rounds</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="points"   stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Points scored" />
              <Line type="monotone" dataKey="conceded" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} name="Points conceded" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Match history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Match history</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Round', 'Opponent', 'Result', 'Sets', 'Points'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {matchHistory.map(m => (
              <tr key={m.matchId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">Round {m.round}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{m.opponent || 'TBD'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.won ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {m.won ? 'Won' : 'Lost'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{m.setsWon}–{m.setsLost}</td>
                <td className="px-4 py-3 text-gray-500">{m.points}–{m.conceded}</td>
              </tr>
            ))}
            {matchHistory.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No matches played yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
