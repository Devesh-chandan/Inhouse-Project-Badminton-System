import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

// Subscribe to a socket event with auto cleanup
export function useSocketEvent(namespace, event, handler) {
  const { refereeSocket, publicSocket } = useSocket();
  const socket = namespace === 'referee' ? refereeSocket : publicSocket;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;
    const cb = (...args) => handlerRef.current(...args);
    socket.on(event, cb);
    return () => socket.off(event, cb);
  }, [socket, event]);
}

// Watch a public match for live score updates
export function useWatchMatch(matchId, onScoreUpdate, onMatchEnd) {
  const { publicSocket } = useSocket();

  useEffect(() => {
    if (!publicSocket || !matchId) return;
    publicSocket.emit('watch_match', matchId);
    publicSocket.on('score_update', onScoreUpdate);
    publicSocket.on('match_ended', onMatchEnd || (() => {}));
    return () => {
      publicSocket.off('score_update', onScoreUpdate);
      publicSocket.off('match_ended', onMatchEnd || (() => {}));
    };
  }, [publicSocket, matchId, onScoreUpdate, onMatchEnd]);
}
