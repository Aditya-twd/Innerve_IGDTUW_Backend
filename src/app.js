const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');

const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const chatRoutes = require('./routes/chat.routes');
const campusRoutes = require('./routes/campus.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

const allowedOrigins = new Set(config.corsOrigins);

// Basic middleware
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients and same-origin requests that omit Origin.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Safe Sphere Backend', port: config.port });
});

// API routes (shared for student + admin frontends)
app.use('/api', adminRoutes);
app.use('/api', studentRoutes);
app.use('/api', chatRoutes);
app.use('/api', campusRoutes);
app.use('/api', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;

