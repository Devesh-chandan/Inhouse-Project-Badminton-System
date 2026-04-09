const router = require('express').Router();
const { register, login, saveFcmToken } = require('../services/authService');
const auth = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/me', auth(), (req, res) => {
  res.json({ user: req.user });
});

router.post('/fcm-token', auth(), async (req, res, next) => {
  try {
    await saveFcmToken(req.user.id, req.body.fcmToken);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
