import { useState } from 'react';

export default function PlayerForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({ name: '', nationality: '', seeding: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ ...form, seeding: form.seeding ? Number(form.seeding) : null });
    setForm({ name: '', nationality: '', seeding: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 grid grid-cols-3 gap-4 items-end">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
        <input
          required value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nationality</label>
        <input
          value={form.nationality}
          onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Seeding</label>
        <input
          type="number" min="1" value={form.seeding}
          onChange={e => setForm(f => ({ ...f, seeding: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="col-span-3 flex justify-end">
        <button
          type="submit" disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save player'}
        </button>
      </div>
    </form>
  );
}
