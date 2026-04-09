const router = require('express').Router();
const { generateScorecard } = require('../services/pdfService');
const auth = require('../middleware/auth');

router.post('/:matchId/generate', auth(['admin', 'referee']), async (req, res, next) => {
  try {
    const result = await generateScorecard(req.params.matchId);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
