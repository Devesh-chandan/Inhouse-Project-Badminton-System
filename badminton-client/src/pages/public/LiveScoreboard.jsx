import { useEffect, useState } from 'react';
import { matchesAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export default function LiveScoreboard() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [scores, setScores] = useState({});
  const { publicSocket } = useSocket();

  useEffect(() => {
    matchesAPI.getAll({ status: 'ongoing' }).then(r => {
      setLiveMatches(r.data);
      r.data.forEach(m => publicSocket?.emit('watch_match', m.id));
    });
  }, [publicSocket]);

  useEffect(() => {
    if (!publicSocket) return;
    publicSocket.on('score_update', (data) => {
      setScores(s => ({ ...s, [data.matchId]: data.currentSet }));
    });
    return () => publicSocket.off('score_update');
  }, [publicSocket]);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-white text-2xl font-bold tracking-tight">Live Scoreboard</h1>
        </div>

        {liveMatches.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <p className="text-6xl mb-4">🏸</p>
            <p className="text-lg">No live matches right now</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {liveMatches.map(m => {
              const live = scores[m.id];
              const p1Score = live?.p1Score ?? m.sets?.[m.sets.length - 1]?.player1Score ?? 0;
              const p2Score = live?.p2Score ?? m.sets?.[m.sets.length - 1]?.player2Score ?? 0;
              const setNum  = live?.setNumber ?? (m.sets?.length || 1);

              return (
                <div key={m.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Court {m.courtNumber} · Set {setNum}</span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Live</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold truncate">{m.player1?.name}</p>
                    </div>
                    <div className="flex items-center gap-4 mx-4">
                      <span className={`text-4xl font-black tabular-nums ${p1Score > p2Score ? 'text-green-400' : 'text-white'}`}>
                        {p1Score}
                      </span>
                      <span className="text-gray-600 text-lg">—</span>
                      <span className={`text-4xl font-black tabular-nums ${p2Score > p1Score ? 'text-green-400' : 'text-white'}`}>
                        {p2Score}
                      </span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-white font-semibold truncate">{m.player2?.name}</p>
                    </div>
                  </div>

                  {/* Set history */}
                  {m.sets?.filter(s => s.status === 'completed').length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800 flex gap-3">
                      {m.sets.filter(s => s.status === 'completed').map(s => (
                        <div key={s.id} className="text-xs text-gray-400">
                          Set {s.setNumber}: <span className="text-gray-200">{s.player1Score}–{s.player2Score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
