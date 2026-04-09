const router = require('express').Router();
const { getPlayerStats, getTournamentStats } = require('../services/analyticsService');
const auth = require('../middleware/auth');

router.get('/player/:playerId', auth(), async (req, res, next) => {
  try {
    const stats = await getPlayerStats(req.params.playerId);
    if (!stats) return res.status(404).json({ error: 'Player not found' });
    res.json(stats);
  } catch (err) { next(err); }
});

router.get('/tournament/:tournamentId', auth(['admin']), async (req, res, next) => {
  try {
    const stats = await getTournamentStats(req.params.tournamentId);
    res.json(stats);
  } catch (err) { next(err); }
});

module.exports = router;
