const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Feedback = require('../models/Feedback');
const { protect, requireRole } = require('../middleware/auth');
const { ok, fail, asyncHandler } = require('../utils/http');

const router = express.Router();
router.use(protect, requireRole('admin'));

router.get('/stats', asyncHandler(async (_req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const week = new Date(Date.now() - 7 * 86400000);
  const [totalUsers, totalPredictions, predictionsToday, predictionsWeek, rating, metrics, recentActivity] = await Promise.all([
    User.countDocuments(), Prediction.countDocuments(), Prediction.countDocuments({ createdAt: { $gte: today } }),
    Prediction.countDocuments({ createdAt: { $gte: week } }), Feedback.aggregate([{ $group: { _id: null, value: { $avg: '$rating' } } }]),
    axios.get(`${process.env.ANALYSER_URL}/model/metrics`, { timeout: 5000 }).then((response) => response.data.data || response.data).catch(() => null),
    Prediction.find().sort({ createdAt: -1 }).limit(8).populate('userId', 'name email').select('origin destination delayProbability riskCategory createdAt userId')
  ]);
  return ok(res, { totalUsers, totalPredictions, predictionsToday, predictionsWeek, avgFeedbackRating: Number((rating[0]?.value || 0).toFixed(2)), modelMetrics: metrics, recentActivity });
}));

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await User.aggregate([
    { $lookup: { from: 'predictions', localField: '_id', foreignField: 'userId', as: 'predictions' } },
    { $project: { name: 1, email: 1, role: 1, createdAt: 1, predictionCount: { $size: '$predictions' } } },
    { $sort: { createdAt: -1 } }
  ]);
  return ok(res, users);
}));

router.put('/users/:id/role', asyncHandler(async (req, res) => {
  if (!['user', 'admin'].includes(req.body.role)) return fail(res, 400, 'Role must be user or admin');
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  if (!user) return fail(res, 404, 'User not found');
  return ok(res, user);
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) return fail(res, 400, 'Use the profile page to delete your own account');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return fail(res, 404, 'User not found');
  await Promise.all([Prediction.deleteMany({ userId: user.id }), Feedback.deleteMany({ userId: user.id })]);
  return ok(res, { message: 'User deleted' });
}));

module.exports = router;
