const express = require('express');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');
const { ok, fail, asyncHandler } = require('../utils/http');

const router = express.Router();
router.use(protect);

router.get('/profile', (req, res) => ok(res, req.user));

router.put('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  for (const key of ['name', 'email']) if (req.body[key] !== undefined) user[key] = req.body[key];
  if (req.body.password) {
    if (req.body.password.length < 8) return fail(res, 400, 'Password must contain at least 8 characters');
    user.password = req.body.password;
  }
  await user.save();
  return ok(res, { id: user.id, name: user.name, email: user.email, role: user.role });
}));

router.delete('/account', asyncHandler(async (req, res) => {
  await Promise.all([
    Prediction.deleteMany({ userId: req.user.id }),
    Feedback.deleteMany({ userId: req.user.id }),
    User.deleteOne({ _id: req.user.id })
  ]);
  return ok(res, { message: 'Account and associated data deleted' });
}));

module.exports = router;
