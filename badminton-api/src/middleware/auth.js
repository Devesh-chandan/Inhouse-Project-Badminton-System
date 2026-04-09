const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = (roles = []) => async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['passwordHash'] } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;
