import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentsAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

function MatchCard({ match }) {
  const isCompleted = match.status === 'completed';
  return (
    <div className={`bg-white border rounded-xl overflow-hidden w-52 shadow-sm ${isCompleted ? 'border-gray-200' : 'border-blue-200'}`}>
      <div className="px-3 py-0.5 bg-gray-50 border-b border-gray-100">
        <span className="text-xs text-gray-400">Round {match.round} · #{match.matchNumber}</span>
      </div>
      {[match.player1, match.player2].map((p, i) => {
        const isWinner = p && match.winnerId === p.id;
        return (
          <div key={i} className={`flex items-center justify-between px-3 py-2 ${i === 0 ? 'border-b border-gray-100' : ''} ${isWinner ? 'bg-blue-50' : ''}`}>
            <span className={`text-sm truncate ${p ? 'text-gray-900' : 'text-gray-300'} ${isWinner ? 'font-semibold text-blue-700' : ''}`}>
              {p?.name || 'TBD'}
            </span>
            {isWinner && <span className="text-blue-500 text-xs ml-1">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function BracketView() {
  const { tournamentId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { publicSocket } = useSocket();

  const fetchBracket = useCallback(() => {
    tournamentsAPI.getBracket(tournamentId)
      .then(r => setMatches(r.data))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  useEffect(() => {
    fetchBracket();
    publicSocket?.emit('watch_tournament', tournamentId);
  }, [tournamentId, publicSocket, fetchBracket]);

  useEffect(() => {
    if (!publicSocket) return;
    publicSocket.on('bracket_update', fetchBracket);
    return () => publicSocket.off('bracket_update', fetchBracket);
  }, [publicSocket, fetchBracket]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);

  return (
    <div className="p-6 overflow-x-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tournament Bracket</h1>
      {rounds.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No bracket generated yet.</p>
      ) : (
        <div className="flex gap-8 items-start min-w-max">
          {rounds.map(round => (
            <div key={round} className="flex flex-col gap-6">
              <div className="text-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  {round === Math.max(...rounds) ? 'Final' : round === Math.max(...rounds) - 1 ? 'Semi-final' : `Round ${round}`}
                </span>
              </div>
              {matches.filter(m => m.round === round).map(m => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
