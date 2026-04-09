const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken, createError } = require('../utils/helpers');

async function register({ name, email, password, role = 'viewer' }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw createError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });
  const token = generateToken(user);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError('Invalid credentials', 401);

  const token = generateToken(user);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

async function saveFcmToken(userId, fcmToken) {
  await User.update({ fcmToken }, { where: { id: userId } });
}

module.exports = { register, login, saveFcmToken };
