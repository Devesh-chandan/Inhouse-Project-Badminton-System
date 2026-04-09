import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const refereeSocket = useRef(null);
  const publicSocket  = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Public namespace (no auth needed)
    publicSocket.current = io(`${BASE_URL}/public`, { transports: ['websocket'] });

    // Referee namespace (requires JWT)
    if (user && ['referee', 'admin'].includes(user.role)) {
      const token = localStorage.getItem('token');
      refereeSocket.current = io(`${BASE_URL}/referee`, {
        auth: { token },
        transports: ['websocket'],
      });
      refereeSocket.current.on('connect', () => setConnected(true));
      refereeSocket.current.on('disconnect', () => setConnected(false));
    }

    return () => {
      publicSocket.current?.disconnect();
      refereeSocket.current?.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ refereeSocket: refereeSocket.current, publicSocket: publicSocket.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
