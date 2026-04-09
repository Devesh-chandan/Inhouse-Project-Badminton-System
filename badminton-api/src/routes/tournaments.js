const router = require('express').Router();
const { Tournament, Match, Player } = require('../models');
const { generateBracket } = require('../services/bracketService');
const auth = require('../middleware/auth');

router.get('/', auth(), async (req, res, next) => {
  try {
    const tournaments = await Tournament.findAll({ order: [['startDate', 'DESC']] });
    res.json(tournaments);
  } catch (err) { next(err); }
});

router.get('/:id', auth(), async (req, res, next) => {
  try {
    const t = await Tournament.findByPk(req.params.id, {
      include: [{
        model: Match,
        include: ['player1', 'player2', 'winner', 'sets'],
        order: [['round', 'ASC'], ['matchNumber', 'ASC']],
      }],
    });
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (err) { next(err); }
});

router.post('/', auth(['admin']), async (req, res, next) => {
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
  } catch (err) { next(err); }
});

router.put('/:id', auth(['admin']), async (req, res, next) => {
  try {
    const t = await Tournament.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.update(req.body);
    res.json(t);
  } catch (err) { next(err); }
});

// Generate bracket for a tournament
router.post('/:id/generate-bracket', auth(['admin']), async (req, res, next) => {
  try {
    const { playerIds } = req.body;
    const matches = await generateBracket(req.params.id, playerIds);
    req.io.to(`tournament_${req.params.id}`).emit('bracket_generated', { matches });
    res.status(201).json(matches);
  } catch (err) { next(err); }
});

// Get bracket for a tournament
router.get('/:id/bracket', auth(), async (req, res, next) => {
  try {
    const matches = await Match.findAll({
      where: { tournamentId: req.params.id },
      include: ['player1', 'player2', 'winner', 'sets'],
      order: [['round', 'ASC'], ['matchNumber', 'ASC']],
    });
    res.json(matches);
  } catch (err) { next(err); }
});

module.exports = router;
