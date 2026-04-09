import { useEffect, useState } from 'react';

export default function MatchTimer({ startedAt, isRunning = true }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const start = startedAt ? new Date(startedAt).getTime() : Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isRunning]);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="text-center">
      <span className="text-gray-400 text-xs uppercase tracking-widest">Match time</span>
      <div className="text-white font-mono text-2xl font-bold mt-0.5">
        {minutes}:{seconds}
      </div>
    </div>
  );
}
