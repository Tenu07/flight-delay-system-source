const { fail } = require('../utils/http');

function notFound(req, res) {
  return fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error.name === 'ValidationError') {
    return fail(res, 400, Object.values(error.errors).map((item) => item.message).join(', '));
  }
  if (error.code === 11000) return fail(res, 409, 'A record with that value already exists');
  if (error.code === 'ECONNREFUSED') return fail(res, 503, 'A required prediction service is unavailable');
  return fail(res, error.status || 500, error.message || 'Internal server error');
}

module.exports = { notFound, errorHandler };
