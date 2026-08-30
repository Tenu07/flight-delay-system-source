const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/http');

async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) return fail(res, 401, 'Authentication required');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-password');
    if (!user) return fail(res, 401, 'User no longer exists');
    req.user = user;
    next();
  } catch (_error) {
    return fail(res, 401, 'Invalid or expired token');
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : fail(res, 403, 'Insufficient permission');

module.exports = { protect, requireRole };
