const router = require('express').Router();
const { Player, User } = require('../models');
const auth = require('../middleware/auth');

// Get all players
router.get('/', auth(), async (req, res, next) => {
  try {
    const players = await Player.findAll({
      include: [{ model: User, as: 'coach', attributes: ['id', 'name', 'email'] }],
      order: [['seeding', 'ASC NULLS LAST'], ['name', 'ASC']],
    });
    res.json(players);
  } catch (err) { next(err); }
});

// Get single player
router.get('/:id', auth(), async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [{ model: User, as: 'coach', attributes: ['id', 'name'] }],
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) { next(err); }
});

// Create player
router.post('/', auth(['admin']), async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (err) { next(err); }
});

// Update player
router.put('/:id', auth(['admin']), async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    await player.update(req.body);
    res.json(player);
  } catch (err) { next(err); }
});

// Delete player
router.delete('/:id', auth(['admin']), async (req, res, next) => {
  try {
    await Player.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
