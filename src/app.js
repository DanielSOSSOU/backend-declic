const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/sanitize');

const createApp = () => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — requires explicit CORS_ORIGIN; '*' is not permitted in production
  const corsOrigin = process.env.CORS_ORIGIN;
  const resolvedOrigin = (() => {
    if (!corsOrigin) return process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000';
    // Reject wildcard in production
    if (process.env.NODE_ENV === 'production' && corsOrigin === '*') return false;
    // Support comma-separated list of allowed origins
    const origins = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
    return origins.length === 1 ? origins[0] : origins;
  })();
  app.use(
    cors({
      origin: resolvedOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false }));

  // NoSQL injection prevention
  app.use(sanitizeInput);

  // Logger (skip in test environment)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limiters
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Trop de tentatives, veuillez réessayer plus tard' },
  });

  app.use(globalLimiter);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/users', userRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
