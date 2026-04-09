export default function ScoreCard({ match }) {
  if (!match) return null;

  const sets = match.sets || [];
  const p1SetsWon = sets.filter(s => s.winnerId === match.player1Id).length;
  const p2SetsWon = sets.filter(s => s.winnerId === match.player2Id).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-4 py-3 text-center">
        <p className="text-white text-xs font-semibold uppercase tracking-widest">
          Round {match.round} · Court {match.courtNumber || '-'}
        </p>
      </div>

      {/* Players + Set scores */}
      <div className="px-4 py-4">
        {[1, 2].map(p => {
          const player  = p === 1 ? match.player1 : match.player2;
          const setsWon = p === 1 ? p1SetsWon : p2SetsWon;
          const isWinner = match.winnerId && match.winnerId === (p === 1 ? match.player1Id : match.player2Id);
          return (
            <div key={p} className={`flex items-center justify-between py-2 ${p === 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isWinner ? 'text-blue-700' : 'text-gray-900'}`}>
                  {player?.name || 'TBD'}
                </span>
                {isWinner && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">W</span>
                )}
              </div>
              {/* Per-set scores */}
              <div className="flex items-center gap-2">
                {sets.map(s => {
                  const score = p === 1 ? s.player1Score : s.player2Score;
                  const won   = s.winnerId === (p === 1 ? match.player1Id : match.player2Id);
                  return (
                    <span key={s.id} className={`text-sm tabular-nums w-7 text-center rounded ${won ? 'font-bold text-blue-700' : 'text-gray-400'}`}>
                      {score}
                    </span>
                  );
                })}
                <span className="text-xs bg-gray-100 text-gray-500 rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {setsWon}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="px-4 pb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
          match.status === 'ongoing'   ? 'bg-green-100 text-green-700' :
          match.status === 'completed' ? 'bg-gray-100 text-gray-500' :
          'bg-amber-100 text-amber-700'
        }`}>
          {match.status}
        </span>
      </div>
    </div>
  );
}
