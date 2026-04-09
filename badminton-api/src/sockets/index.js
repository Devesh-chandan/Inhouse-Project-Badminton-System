const scoringSocket = require('./scoring');

module.exports = (io) => {
  // Namespace for referees
  const refereeNs = io.of('/referee');
  // Namespace for public viewers
  const publicNs  = io.of('/public');

  refereeNs.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Auth required'));
    try {
      const jwt = require('jsonwebtoken');
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  scoringSocket(refereeNs, publicNs);

  publicNs.on('connection', (socket) => {
    socket.on('watch_match', (matchId) => {
      socket.join(`match_${matchId}`);
    });
    socket.on('watch_tournament', (tournamentId) => {
      socket.join(`tournament_${tournamentId}`);
    });
  });
};
