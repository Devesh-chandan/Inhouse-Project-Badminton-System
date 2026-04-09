const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { generateToken, createError };
