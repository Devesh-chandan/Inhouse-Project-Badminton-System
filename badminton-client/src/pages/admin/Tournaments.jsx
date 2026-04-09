import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tournamentsAPI, playersAPI } from '../../services/api';

const STATUS_COLORS = { upcoming: 'bg-amber-100 text-amber-700', ongoing: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-500' };

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers]         = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [selected, setSelected]       = useState([]);
  const [form, setForm]               = useState({ name: '', startDate: '', endDate: '', venue: '', format: 'single_elimination' });

  useEffect(() => {
    tournamentsAPI.getAll().then(r => setTournaments(r.data));
    playersAPI.getAll().then(r => setPlayers(r.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const t = await tournamentsAPI.create(form);
    if (selected.length >= 2) {
      await tournamentsAPI.generateBracket(t.data.id, selected);
    }
    setShowForm(false);
    setForm({ name: '', startDate: '', endDate: '', venue: '', format: 'single_elimination' });
    setSelected([]);
    tournamentsAPI.getAll().then(r => setTournaments(r.data));
  };

  const togglePlayer = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <button onClick={() => setShowForm(s => !s)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New Tournament
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Create tournament</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Name *', key: 'name', type: 'text', required: true },
              { label: 'Venue',  key: 'venue', type: 'text' },
              { label: 'Start date *', key: 'startDate', type: 'date', required: true },
              { label: 'End date *',   key: 'endDate',   type: 'date', required: true },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input type={f.type} required={f.required} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
              <select value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400">
                <option value="single_elimination">Single Elimination</option>
                <option value="double_elimination">Double Elimination</option>
                <option value="round_robin">Round Robin</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Select players ({selected.length} selected — min 2 to generate bracket)
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {players.map(p => (
                <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => togglePlayer(p.id)} className="rounded" />
                  <span className="truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Create {selected.length >= 2 ? '& Generate Bracket' : 'Tournament'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {tournaments.map(t => (
          <div key={t.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[t.status]}`}>{t.status}</span>
              </div>
              <p className="text-sm text-gray-400">{t.venue} · {t.startDate} → {t.endDate} · {t.format?.replace(/_/g, ' ')}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/bracket/${t.id}`} className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50">
                View Bracket
              </Link>
              <Link to={`/admin/tournaments/${t.id}`} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100">
                Manage →
              </Link>
            </div>
          </div>
        ))}
        {tournaments.length === 0 && (
          <div className="text-center py-16 text-gray-400">No tournaments yet. Create your first one.</div>
        )}
      </div>
    </div>
  );
}
