const express = require('express');
const axios = require('axios');
const Prediction = require('../models/Prediction');
const { protect } = require('../middleware/auth');
const { ok, fail, asyncHandler } = require('../utils/http');

const router = express.Router();
router.use(protect);

router.post('/predict', asyncHandler(async (req, res) => {
  const required = ['origin', 'destination', 'carrier', 'flightDate', 'depTime', 'distance'];
  const missing = required.filter((key) => req.body[key] === undefined || req.body[key] === '');
  if (missing.length) return fail(res, 400, `Missing fields: ${missing.join(', ')}`);
  if (req.body.origin === req.body.destination) return fail(res, 400, 'Origin and destination must differ');

  const payload = {
    origin: req.body.origin,
    destination: req.body.destination,
    carrier: req.body.carrier,
    flight_date: req.body.flightDate,
    dep_time: req.body.depTime,
    distance: Number(req.body.distance),
    prev_arr_delay: Number(req.body.prevArrDelay || 0),
    taxi_out: Number(req.body.taxiOut || 15)
  };
  const response = await axios.post(`${process.env.PREDICTOR_URL}/predict`, payload, { timeout: 5000 });
  const result = response.data.data || response.data;
  const record = await Prediction.create({
    userId: req.user.id,
    origin: payload.origin,
    destination: payload.destination,
    carrier: payload.carrier,
    flightDate: payload.flight_date,
    depTime: payload.dep_time,
    distance: payload.distance,
    delayProbability: result.delay_probability,
    riskCategory: result.risk_category,
    shapExplanation: result.shap_explanation,
    weather: result.weather,
    modelUsed: result.model_used
  });
  return ok(res, record, 201);
}));

router.get('/history', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const query = { userId: req.user.id };
  if (req.query.risk) query.riskCategory = req.query.risk;
  if (req.query.origin) query.origin = req.query.origin.toUpperCase();
  if (req.query.destination) query.destination = req.query.destination.toUpperCase();
  if (req.query.from || req.query.to) {
    query.flightDate = {};
    if (req.query.from) query.flightDate.$gte = new Date(req.query.from);
    if (req.query.to) query.flightDate.$lte = new Date(req.query.to);
  }
  const [items, total] = await Promise.all([
    Prediction.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Prediction.countDocuments(query)
  ]);
  return ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/stats', asyncHandler(async (req, res) => {
  const [stats = {}] = await Prediction.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: null, totalPredictions: { $sum: 1 }, highRiskCount: { $sum: { $cond: [{ $eq: ['$riskCategory', 'High'] }, 1, 0] } }, avgProbability: { $avg: '$delayProbability' } } }
  ]);
  return ok(res, { totalPredictions: stats.totalPredictions || 0, highRiskCount: stats.highRiskCount || 0, avgProbability: Number((stats.avgProbability || 0).toFixed(1)) });
}));

router.get('/trends', asyncHandler(async (req, res) => {
  const trends = await Prediction.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: { origin: '$origin', destination: '$destination' }, avgProbability: { $avg: '$delayProbability' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 10 },
    { $project: { _id: 0, route: { $concat: ['$_id.origin', '-', '$_id.destination'] }, avgProbability: { $round: ['$avgProbability', 1] }, count: 1 } }
  ]);
  return ok(res, trends);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await Prediction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) return fail(res, 404, 'Prediction not found');
  return ok(res, { message: 'Prediction deleted' });
}));

module.exports = router;
