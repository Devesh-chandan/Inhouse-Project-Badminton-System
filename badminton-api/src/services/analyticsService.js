const { Match, MatchSet, Point, Player } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

async function getPlayerStats(playerId) {
  const player = await Player.findByPk(playerId);
  if (!player) return null;

  const matches = await Match.findAll({
    where: {
      status: 'completed',
      [Op.or]: [{ player1Id: playerId }, { player2Id: playerId }],
    },
    include: [
      { association: 'player1', attributes: ['id', 'name'] },
      { association: 'player2', attributes: ['id', 'name'] },
      { association: 'winner',  attributes: ['id', 'name'] },
      { association: 'sets' },
    ],
    order: [['completedAt', 'ASC']],
  });

  const wins   = matches.filter(m => m.winnerId === playerId).length;
  const losses = matches.length - wins;

  let totalPoints = 0;
  let totalPointsConceded = 0;
  let totalSetsWon = 0;
  let totalSetsLost = 0;

  const matchHistory = matches.map(m => {
    const isP1 = m.player1Id === playerId;
    let matchPoints = 0, matchConceded = 0, setsWon = 0, setsLost = 0;

    (m.sets || []).forEach(s => {
      const myScore  = isP1 ? s.player1Score : s.player2Score;
      const oppScore = isP1 ? s.player2Score : s.player1Score;
      matchPoints    += myScore;
      matchConceded  += oppScore;
      if (s.winnerId === playerId) setsWon++;
      else setsLost++;
    });

    totalPoints       += matchPoints;
    totalPointsConceded += matchConceded;
    totalSetsWon      += setsWon;
    totalSetsLost     += setsLost;

    const opponent = isP1 ? m.player2 : m.player1;
    return {
      matchId:    m.id,
      round:      m.round,
      opponent:   opponent?.name,
      won:        m.winnerId === playerId,
      setsWon,
      setsLost,
      points:     matchPoints,
      conceded:   matchConceded,
    };
  });

  return {
    player: { id: player.id, name: player.name },
    summary: {
      played: matches.length,
      wins,
      losses,
      winRate: matches.length ? Math.round((wins / matches.length) * 100) : 0,
      totalPoints,
      totalPointsConceded,
      totalSetsWon,
      totalSetsLost,
      avgPointsPerMatch: matches.length ? Math.round(totalPoints / matches.length) : 0,
    },
    matchHistory,
  };
}

async function getTournamentStats(tournamentId) {
  const matches = await Match.findAll({
    where: { tournamentId, status: 'completed' },
    include: [
      { association: 'player1', attributes: ['id', 'name'] },
      { association: 'player2', attributes: ['id', 'name'] },
      { association: 'sets' },
    ],
  });

  const longestMatch = matches.reduce((acc, m) => {
    const totalRallies = (m.sets || []).reduce((s, set) => s + set.player1Score + set.player2Score, 0);
    return totalRallies > acc.rallies ? { match: m, rallies: totalRallies } : acc;
  }, { rallies: 0 });

  return {
    totalMatches: matches.length,
    completedMatches: matches.filter(m => m.status === 'completed').length,
    longestMatch: longestMatch.match ? {
      id: longestMatch.match.id,
      player1: longestMatch.match.player1?.name,
      player2: longestMatch.match.player2?.name,
      rallies: longestMatch.rallies,
    } : null,
  };
}

module.exports = { getPlayerStats, getTournamentStats };
