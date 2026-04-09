const { Match, MatchSet, Point } = require('../models');
const redis = require('../config/redis');
const { checkSetWinner, checkMatchWinner } = require('../utils/badmintonRules');
const { progressBracket } = require('./bracketService');
const { createError } = require('../utils/helpers');

// Safe Redis helpers — never throw if Redis is disconnected
async function redisSet(key, ttl, value) {
  try {
    if (redis.isOpen) await redis.setEx(key, ttl, value);
  } catch (err) {
    console.warn('Redis setEx failed (non-fatal):', err.message);
  }
}

async function redisGet(key) {
  try {
    if (redis.isOpen) return await redis.get(key);
  } catch (err) {
    console.warn('Redis get failed (non-fatal):', err.message);
  }
  return null;
}

async function addPoint(matchId, scoredById, serverId, io) {
  const match = await Match.findByPk(matchId, {
    include: [{ association: 'sets', order: [['setNumber', 'ASC']] }],
  });
  if (!match) throw createError('Match not found', 404);
  if (match.status !== 'ongoing') throw createError('Match is not ongoing', 400);

  // Get or create the current active set
  let currentSet = match.sets?.find(s => s.status === 'ongoing');
  if (!currentSet) {
    const setNumber = (match.sets?.length || 0) + 1;
    currentSet = await MatchSet.create({
      matchId,
      setNumber,
      serverId,
      status: 'ongoing',
    });
  }

  // Record point
  const rallyNum = await Point.count({ where: { setId: currentSet.id } }) + 1;
  await Point.create({ setId: currentSet.id, scoredBy: scoredById, serverId, rallyNum });

  // Update set score
  const isPlayer1 = scoredById === match.player1Id;
  const updates = isPlayer1
    ? { player1Score: currentSet.player1Score + 1 }
    : { player2Score: currentSet.player2Score + 1 };
  await currentSet.update(updates);
  await currentSet.reload();

  // Check if this set is over
  const setWinner = checkSetWinner(currentSet.player1Score, currentSet.player2Score);
  let matchResult = null;

  if (setWinner) {
    const winnerId = setWinner === 1 ? match.player1Id : match.player2Id;
    await currentSet.update({ status: 'completed', winnerId });

    // Tally set wins
    const completedSets = await MatchSet.findAll({
      where: { matchId, status: 'completed' },
    });
    const p1Sets = completedSets.filter(s => s.winnerId === match.player1Id).length;
    const p2Sets = completedSets.filter(s => s.winnerId === match.player2Id).length;

    const matchWinner = checkMatchWinner(p1Sets, p2Sets);
    if (matchWinner) {
      const matchWinnerId = matchWinner === 1 ? match.player1Id : match.player2Id;
      await match.update({
        status: 'completed',
        winnerId: matchWinnerId,
        completedAt: new Date(),
      });
      await progressBracket(matchId, matchWinnerId, io);
      matchResult = { matchOver: true, winnerId: matchWinnerId, p1Sets, p2Sets };
    }
  }

  // Build current state
  const state = {
    matchId,
    currentSet: {
      id: currentSet.id,
      setNumber: currentSet.setNumber,
      p1Score: currentSet.player1Score,
      p2Score: currentSet.player2Score,
    },
    setWinner,
    matchResult,
  };

  // Cache in Redis (TTL 2 hours) — non-fatal if Redis is unavailable
  await redisSet(`score:${matchId}`, 7200, JSON.stringify(state));

  return state;
}

async function undoLastPoint(matchId) {
  const currentSet = await MatchSet.findOne({
    where: { matchId, status: 'ongoing' },
    order: [['setNumber', 'DESC']],
  });
  if (!currentSet) throw createError('No active set found', 400);

  const lastPoint = await Point.findOne({
    where: { setId: currentSet.id },
    order: [['timestamp', 'DESC']],
  });
  if (!lastPoint) throw createError('No points to undo', 400);

  const match = await Match.findByPk(matchId);
  const isP1 = lastPoint.scoredBy === match.player1Id;
  await currentSet.update(isP1
    ? { player1Score: Math.max(0, currentSet.player1Score - 1) }
    : { player2Score: Math.max(0, currentSet.player2Score - 1) }
  );
  await lastPoint.destroy();
  await currentSet.reload();

  const state = {
    matchId,
    currentSet: {
      id: currentSet.id,
      setNumber: currentSet.setNumber,
      p1Score: currentSet.player1Score,
      p2Score: currentSet.player2Score,
    },
  };
  await redisSet(`score:${matchId}`, 7200, JSON.stringify(state));
  return state;
}

async function getLiveScore(matchId) {
  const cached = await redisGet(`score:${matchId}`);
  if (cached) return JSON.parse(cached);

  const sets = await MatchSet.findAll({ where: { matchId }, order: [['setNumber', 'ASC']] });
  return { matchId, sets };
}

module.exports = { addPoint, undoLastPoint, getLiveScore };
