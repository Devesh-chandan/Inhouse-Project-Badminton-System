import { useState } from 'react';

const FORMATS = [
  { value: 'single_elimination', label: 'Single Elimination' },
  { value: 'double_elimination', label: 'Double Elimination' },
  { value: 'round_robin',        label: 'Round Robin' },
];

export default function TournamentForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    name: '', startDate: '', endDate: '', venue: '', format: 'single_elimination',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setForm({ name: '', startDate: '', endDate: '', venue: '', format: 'single_elimination' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-4">Create tournament</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { label: 'Name *',       key: 'name',      type: 'text', required: true },
          { label: 'Venue',        key: 'venue',     type: 'text' },
          { label: 'Start date *', key: 'startDate', type: 'date', required: true },
          { label: 'End date *',   key: 'endDate',   type: 'date', required: true },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <input
              type={f.type} required={f.required} value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
          <select
            value={form.format}
            onChange={e => setForm(p => ({ ...p, format: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          >
            {FORMATS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          type="submit" disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Tournament'}
        </button>
      </div>
    </form>
  );
}
