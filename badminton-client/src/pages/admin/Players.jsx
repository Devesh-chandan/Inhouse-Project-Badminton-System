import { useEffect, useState } from 'react';
import { playersAPI } from '../../services/api';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', nationality: '', seeding: '' });
  const [loading, setLoading] = useState(true);

  const fetchPlayers = () => {
    playersAPI.getAll().then(r => setPlayers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await playersAPI.create({ ...form, seeding: form.seeding ? Number(form.seeding) : null });
    setForm({ name: '', nationality: '', seeding: '' });
    setShowForm(false);
    fetchPlayers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this player?')) return;
    await playersAPI.delete(id);
    fetchPlayers();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Players</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Player
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nationality</label>
            <input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Seeding</label>
            <input type="number" min="1" value={form.seeding} onChange={e => setForm(f => ({ ...f, seeding: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="col-span-3 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Save player</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Seed', 'Name', 'Nationality', 'Coach', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {players.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{p.seeding || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.nationality || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.coach?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No players yet. Add your first player.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
