// src/app.js
//
// WHY app.js IS SEPARATE FROM server.js:
// app.js builds and configures the Express app (middleware, routes) but
// does NOT call app.listen(). server.js imports this app and starts it.
// This separation means app.js can be imported directly in automated
// tests later WITHOUT actually binding to a network port.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';


import { env } from './config/env.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

export const app = express();

// ---- Security & parsing middleware (order matters here) ----
app.use(helmet());

app.use(cors({
  origin: env.isProduction ? process.env.CLIENT_URL : 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.use(express.json());
app.use(cookieParser());

// ---- Health check route ----
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ---- Feature routes will be mounted here in later phases ----
app.use('/api/auth', authRoutes);
// app.use('/api/documents', documentRoutes);

// ---- 404 handler (must come after all real routes) ----
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` }
  });
});

// ---- Centralized error handler (must be LAST, and must have 4 args) ----
// Note: `_next` is required even though unused — Express identifies
// error-handling middleware specifically by its 4-parameter signature.
// Dropping it would silently turn this into regular middleware that
// never gets invoked for errors.
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: env.isProduction ? 'Something went wrong' : err.message,
    }
  });
});