const router = require('express').Router();
const { Match, MatchSet } = require('../models');
const { getLiveScore } = require('../services/scoreService');
const auth = require('../middleware/auth');

router.get('/', auth(), async (req, res, next) => {
  try {
    const where = {};
    if (req.query.tournamentId) where.tournamentId = req.query.tournamentId;
    if (req.query.status) where.status = req.query.status;
    const matches = await Match.findAll({
      where,
      include: ['player1', 'player2', 'winner', 'referee', 'sets'],
      order: [['round', 'ASC'], ['matchNumber', 'ASC']],
    });
    res.json(matches);
  } catch (err) { next(err); }
});

router.get('/:id', auth(), async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id, {
      include: ['player1', 'player2', 'winner', 'referee', { association: 'sets', include: ['points'] }],
    });
    if (!match) return res.status(404).json({ error: 'Not found' });
    res.json(match);
  } catch (err) { next(err); }
});

router.put('/:id', auth(['admin', 'referee']), async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) return res.status(404).json({ error: 'Not found' });
    await match.update(req.body);
    res.json(match);
  } catch (err) { next(err); }
});

// Get live score (Redis-backed)
router.get('/:id/live-score', async (req, res, next) => {
  try {
    const score = await getLiveScore(req.params.id);
    res.json(score);
  } catch (err) { next(err); }
});

module.exports = router;
