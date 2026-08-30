const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, status, error) => res.status(status).json({ success: false, error });

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ok, fail, asyncHandler };
