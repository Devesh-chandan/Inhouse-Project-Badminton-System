import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { matchesAPI, scorecardsAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export default function MatchScoring() {
  const { matchId } = useParams();
  const { refereeSocket } = useSocket();
  const [match, setMatch]   = useState(null);
  const [score, setScore]   = useState({ p1: 0, p2: 0, set: 1 });
  const [setsWon, setSetsWon] = useState({ p1: 0, p2: 0 });
  const [ended, setEnded]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scorecardUrl, setScorecardUrl] = useState(null);

  useEffect(() => {
    matchesAPI.getById(matchId).then(r => {
      setMatch(r.data);
      setLoading(false);
    });
  }, [matchId]);

  useEffect(() => {
    if (!refereeSocket || !matchId) return;
    refereeSocket.emit('join_match', matchId);

    refereeSocket.on('score_update', (data) => {
      setScore({ p1: data.currentSet.p1Score, p2: data.currentSet.p2Score, set: data.currentSet.setNumber });
    });
    refereeSocket.on('match_ended', (data) => {
      setEnded(true);
      setSetsWon({ p1: data.p1Sets, p2: data.p2Sets });
    });
    return () => {
      refereeSocket.off('score_update');
      refereeSocket.off('match_ended');
    };
  }, [refereeSocket, matchId]);

  const addPoint = useCallback((player) => {
    if (!refereeSocket || ended) return;
    refereeSocket.emit('add_point', {
      matchId,
      scoredById: player === 1 ? match.player1Id : match.player2Id,
      serverId:   player === 1 ? match.player1Id : match.player2Id,
    });
  }, [refereeSocket, matchId, match, ended]);

  const undoPoint = useCallback(() => {
    if (!refereeSocket) return;
    refereeSocket.emit('undo_point', { matchId });
  }, [refereeSocket, matchId]);

  const generateScorecard = async () => {
    setGenerating(true);
    try {
      const res = await scorecardsAPI.generate(matchId);
      setScorecardUrl(res.data.url);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!match)  return <div className="p-8 text-center text-gray-500">Match not found</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Court {match.courtNumber} · Set {score.set}</span>
        </div>

        {/* Score board */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium mb-2 truncate">{match.player1?.name}</p>
              <p className="text-8xl font-black text-white tabular-nums">{score.p1}</p>
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: setsWon.p1 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-blue-500 rounded-full" />
                ))}
              </div>
            </div>
            <div className="text-center text-gray-600 text-2xl font-light">—</div>
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium mb-2 truncate">{match.player2?.name}</p>
              <p className="text-8xl font-black text-white tabular-nums">{score.p2}</p>
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: setsWon.p2 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-orange-500 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Match ended state */}
        {ended ? (
          <div className="text-center">
            <div className="bg-green-900/40 border border-green-700 rounded-xl p-6 mb-4">
              <p className="text-green-400 font-semibold text-lg">Match Complete</p>
              <p className="text-gray-300 text-sm mt-1">
                Winner: {setsWon.p1 > setsWon.p2 ? match.player1?.name : match.player2?.name}
              </p>
            </div>
            <button
              onClick={generateScorecard}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium"
            >
              {generating ? 'Generating…' : 'Generate Scorecard PDF'}
            </button>
            {scorecardUrl && (
              <a href={scorecardUrl} target="_blank" rel="noreferrer"
                className="block mt-3 text-blue-400 hover:text-blue-300 underline text-sm">
                Download Scorecard →
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Scoring buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => addPoint(1)}
                className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-8 rounded-2xl text-xl transition-all select-none"
              >
                + {match.player1?.name?.split(' ')[0]}
              </button>
              <button
                onClick={() => addPoint(2)}
                className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold py-8 rounded-2xl text-xl transition-all select-none"
              >
                + {match.player2?.name?.split(' ')[0]}
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={undoPoint}
                className="text-gray-500 hover:text-gray-300 text-sm underline underline-offset-2 transition-colors"
              >
                ↩ Undo last point
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
