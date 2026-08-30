const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const { ok, fail, asyncHandler } = require('../utils/http');

const router = express.Router();
router.use(protect);

const requireRoute = (req, res) => {
  const origin = String(req.query.origin || '').toUpperCase();
  const destination = String(req.query.destination || req.query.dest || '').toUpperCase();
  if (!origin || !destination) { fail(res, 400, 'origin and destination query parameters are required'); return null; }
  return { origin, destination };
};

router.get('/route', asyncHandler(async (req, res) => {
  const route = requireRoute(req, res); if (!route) return;
  const response = await axios.post(`${process.env.ANALYSER_URL}/analyze/route`, route, { timeout: 5000 });
  return ok(res, response.data.data || response.data);
}));
router.get('/carrier', asyncHandler(async (req, res) => {
  const route = requireRoute(req, res); if (!route) return;
  const response = await axios.post(`${process.env.ANALYSER_URL}/analyze/carrier`, route, { timeout: 5000 });
  return ok(res, response.data.data || response.data);
}));
router.get('/heatmap', asyncHandler(async (req, res) => {
  const route = requireRoute(req, res); if (!route) return;
  const response = await axios.post(`${process.env.ANALYSER_URL}/analyze/heatmap`, route, { timeout: 5000 });
  return ok(res, response.data.data || response.data);
}));

module.exports = router;
