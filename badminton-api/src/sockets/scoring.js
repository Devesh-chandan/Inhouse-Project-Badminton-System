const { addPoint, undoLastPoint } = require('../services/scoreService');
const { notifyMatchStart }        = require('../services/notificationService');
const { Match }                   = require('../models');

module.exports = (refereeNs, publicNs) => {
  refereeNs.on('connection', (socket) => {
    const userId = socket.user?.id;
    console.log(`Referee connected: ${userId}`);

    // Referee joins a specific match room
    socket.on('join_match', async (matchId) => {
      socket.join(`match_${matchId}`);
      // Mark match as ongoing
      await Match.update(
        { status: 'ongoing', startedAt: new Date(), refereeId: userId },
        { where: { id: matchId, status: 'scheduled' } }
      );
      socket.emit('joined', { matchId });
    });

    // Add a point
    socket.on('add_point', async ({ matchId, scoredById, serverId }) => {
      try {
        const result = await addPoint(matchId, scoredById, serverId, publicNs);
        // Broadcast to both referee room and public viewers
        refereeNs.to(`match_${matchId}`).emit('score_update', result);
        publicNs.to(`match_${matchId}`).emit('score_update', result);

        if (result.matchResult?.matchOver) {
          refereeNs.to(`match_${matchId}`).emit('match_ended', result.matchResult);
          publicNs.to(`match_${matchId}`).emit('match_ended', result.matchResult);
          publicNs.to(`tournament_${result.tournamentId}`).emit('bracket_update', result);
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Undo last point
    socket.on('undo_point', async ({ matchId }) => {
      try {
        const result = await undoLastPoint(matchId);
        refereeNs.to(`match_${matchId}`).emit('score_update', result);
        publicNs.to(`match_${matchId}`).emit('score_update', result);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Referee disconnected: ${userId}`);
    });
  });
};
