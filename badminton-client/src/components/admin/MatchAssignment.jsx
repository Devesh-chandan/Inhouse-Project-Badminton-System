import { useState } from 'react';
import { matchesAPI, playersAPI } from '../../services/api';

export default function MatchAssignment({ tournamentId, onAssigned }) {
  const [matchId, setMatchId]       = useState('');
  const [refereeId, setRefereeId]   = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await matchesAPI.update(matchId, {
        refereeId:   refereeId   || undefined,
        courtNumber: courtNumber ? Number(courtNumber) : undefined,
      });
      setMatchId('');
      setRefereeId('');
      setCourtNumber('');
      onAssigned?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Assign Referee / Court</h3>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Match ID</label>
          <input
            required value={matchId}
            onChange={e => setMatchId(e.target.value)}
            placeholder="UUID"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Referee ID</label>
          <input
            value={refereeId}
            onChange={e => setRefereeId(e.target.value)}
            placeholder="UUID (optional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Court #</label>
          <input
            type="number" min="1" value={courtNumber}
            onChange={e => setCourtNumber(e.target.value)}
            placeholder="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {loading ? 'Saving…' : 'Assign'}
        </button>
      </div>
    </form>
  );
}
