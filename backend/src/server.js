require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const { ok } = require('./utils/http');
const { airports, airlines } = require('./data/reference');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => ok(res, { status: 'ok', service: 'express-api' }));
app.get('/api/airports', (_req, res) => ok(res, airports));
app.get('/api/airlines', (_req, res) => ok(res, airlines));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/admin', require('./routes/admin'));
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;
if (require.main === module) {
  connectDatabase().then(() => app.listen(port, () => console.log(`Express API listening on ${port}`)))
    .catch((error) => { console.error(error); process.exit(1); });
}

module.exports = app;
