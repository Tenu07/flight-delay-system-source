const express = require('express');
const Feedback = require('../models/Feedback');
const Prediction = require('../models/Prediction');
const { protect } = require('../middleware/auth');
const { ok, fail, asyncHandler } = require('../utils/http');

const router = express.Router();
router.use(protect);

router.post('/', asyncHandler(async (req, res) => {
  const prediction = await Prediction.findOne({ _id: req.body.predictionId, userId: req.user.id });
  if (!prediction) return fail(res, 404, 'Prediction not found');
  const feedback = await Feedback.findOneAndUpdate(
    { userId: req.user.id, predictionId: prediction.id },
    { rating: req.body.rating, wasAccurate: req.body.wasAccurate, comment: req.body.comment || '' },
    { upsert: true, new: true, runValidators: true }
  );
  return ok(res, feedback, 201);
}));

router.get('/my', asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ userId: req.user.id }).populate('predictionId', 'origin destination flightDate delayProbability').sort({ createdAt: -1 });
  return ok(res, feedback);
}));

module.exports = router;
