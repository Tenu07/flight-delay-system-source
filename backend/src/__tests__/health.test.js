process.env.JWT_SECRET = 'test-secret';
const request = require('supertest');
const app = require('../server');

test('health endpoint uses the standard response envelope', async () => {
  const response = await request(app).get('/api/health');
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ success: true, data: { status: 'ok', service: 'express-api' } });
});
