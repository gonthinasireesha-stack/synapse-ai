// src/controllers/authController.js
//
// WHY CONTROLLERS STAY THIN:
// This layer's only job is translating between HTTP and the service
// layer. It knows about req/res/cookies — the service layer doesn't.
// It does NOT know about SQL, bcrypt, or JWT internals — the service
// layer (and the utils/repositories below it) handles all of that.

import * as authService from '../services/authService.js';
import { AuthError } from '../services/authService.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

// Centralizes the cookie options so every place that sets/clears the
// refresh token cookie uses IDENTICAL settings — a mismatch here (e.g.
// setting with one `path` and clearing with another) is a classic bug
// where "logout" silently fails to actually clear the cookie.
function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function clearRefreshCookieOptions() {
  const { maxAge, ...rest } = refreshCookieOptions();
  return rest;
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body; // already validated + normalized by validate() middleware
    const { user, accessToken, refreshToken } = await authService.signup({ name, email, password });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

    res.status(201).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    next(err); // hands off to the centralized error handler in app.js
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

    res.status(200).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
}

 

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw new AuthError('No refresh token provided', 'NO_REFRESH_TOKEN', 401);
    }

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(refreshToken);

    res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions());

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    // req.user is attached by authMiddleware (next file) after verifying
    // the access token — by the time we're here, we already know who's
    

    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
}