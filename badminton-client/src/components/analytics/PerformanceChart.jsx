import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PerformanceChart({ matchHistory = [] }) {
  const chartData = matchHistory.map(m => ({
    name:     `R${m.round}`,
    points:   m.points,
    conceded: m.conceded,
  }));

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">
        No match data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
      <h2 className="font-semibold text-gray-900 mb-4">Points trend across rounds</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="points"   stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Points scored" />
          <Line type="monotone" dataKey="conceded" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} name="Points conceded" strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
