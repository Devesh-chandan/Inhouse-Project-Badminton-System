export default function ScoringPanel({ player1, player2, onAddPoint, onUndoPoint, disabled = false }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => onAddPoint(1)}
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white font-bold py-8 rounded-2xl text-xl transition-all select-none"
        >
          + {player1?.name?.split(' ')[0] || 'Player 1'}
        </button>
        <button
          onClick={() => onAddPoint(2)}
          disabled={disabled}
          className="bg-orange-600 hover:bg-orange-500 active:scale-95 disabled:opacity-40 text-white font-bold py-8 rounded-2xl text-xl transition-all select-none"
        >
          + {player2?.name?.split(' ')[0] || 'Player 2'}
        </button>
      </div>
      <div className="text-center">
        <button
          onClick={onUndoPoint}
          disabled={disabled}
          className="text-gray-500 hover:text-gray-300 disabled:opacity-40 text-sm underline underline-offset-2 transition-colors"
        >
          ↩ Undo last point
        </button>
      </div>
    </div>
  );
}
