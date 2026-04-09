const { Tournament, Match, Player } = require('../models');
const { Op } = require('sequelize');
const { createError } = require('../utils/helpers');

async function generateBracket(tournamentId, playerIds) {
  const tournament = await Tournament.findByPk(tournamentId);
  if (!tournament) throw createError('Tournament not found', 404);

  // Shuffle respecting seedings
  const players = await Player.findAll({
    where: { id: playerIds },
    order: [['seeding', 'ASC NULLS LAST']],
  });
  const shuffled = seededShuffle(players.map(p => p.id));

  const matchesToCreate = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    matchesToCreate.push({
      tournamentId,
      round: 1,
      matchNumber: Math.floor(i / 2) + 1,
      player1Id: shuffled[i],
      player2Id: shuffled[i + 1] || null, // bye
      status: shuffled[i + 1] ? 'scheduled' : 'completed',
      winnerId: shuffled[i + 1] ? null : shuffled[i], // auto-win for bye
    });
  }

  const matches = await Match.bulkCreate(matchesToCreate);
  await tournament.update({ status: 'ongoing' });
  return matches;
}

async function progressBracket(completedMatchId, winnerId, io) {
  const match = await Match.findByPk(completedMatchId);
  if (!match) return;

  // Find the next-round slot with an empty player spot
  const nextRound = match.round + 1;
  const nextMatchNumber = Math.ceil(match.matchNumber / 2);

  let nextMatch = await Match.findOne({
    where: {
      tournamentId: match.tournamentId,
      round: nextRound,
      matchNumber: nextMatchNumber,
    },
  });

  if (!nextMatch) {
    // Create the next-round match slot
    nextMatch = await Match.create({
      tournamentId: match.tournamentId,
      round: nextRound,
      matchNumber: nextMatchNumber,
      player1Id: winnerId,
      status: 'scheduled',
    });
  } else {
    // Fill in the second player slot
    const update = nextMatch.player1Id ? { player2Id: winnerId } : { player1Id: winnerId };
    await nextMatch.update(update);
  }

  // Broadcast bracket update via socket
  if (io) {
    io.to(`tournament_${match.tournamentId}`).emit('bracket_update', {
      completedMatchId,
      winnerId,
      nextMatch,
    });
  }

  return nextMatch;
}

// Seed top players into non-colliding bracket positions
function seededShuffle(playerIds) {
  const result = [...playerIds];
  // Simple Fisher-Yates for unseeded part
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

module.exports = { generateBracket, progressBracket };
