const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { ok, fail, asyncHandler } = require('../utils/http');

const router = express.Router();
const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });

router.post('/register', asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '').trim();
  const { role, adminKey } = req.body;
  if (!name || !email || !password) return fail(res, 400, 'Name, email, and password are required');
  const safeRole = role === 'admin' && adminKey === process.env.ADMIN_REGISTRATION_KEY ? 'admin' : 'user';
  const user = await User.create({ name, email, password, role: safeRole });
  return ok(res, { token: tokenFor(user), user: publicUser(user) }, 201);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '').trim();
  if (!email || !password) return fail(res, 400, 'Email and password are required');
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.verifyPassword(password))) return fail(res, 401, 'Invalid email or password');
  return ok(res, { token: tokenFor(user), user: publicUser(user) });
}));


router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return ok(res, { message: 'Logged out' });
});

router.get('/me', protect, (req, res) => ok(res, publicUser(req.user)));

module.exports = router;
