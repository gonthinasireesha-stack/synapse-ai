// src/middlewares/authMiddleware.js
//
// WHY THIS MIDDLEWARE EXISTS:
// Protects routes by requiring a valid access token on every request.
// Runs BEFORE the route's controller — if the token is missing or
// invalid, the request is rejected here and the controller never runs.
//
// On success, attaches `req.user` so every downstream controller can
// simply read `req.user.id` without re-verifying anything itself.

import { verifyAccessToken } from '../utils/tokens.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Authentication required' },
    });
  }

  const token = authHeader.slice(7); // strip "Bearer " prefix (7 characters)

  try {
    const payload = verifyAccessToken(token);
    // Attach a minimal, trusted identity to the request.
    // Controllers/services use req.user.id — they never re-parse the token.
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    return res.status(401).json({
      success: false,
      error: { code, message: 'Invalid or expired access token' },
    });
  }
}