// src/services/authService.js
//
// WHY THIS FILE EXISTS:
// Contains the actual business rules for authentication — "what does it
// mean to sign up," "what does it mean to log in" — independent of HTTP.
// Controllers call these functions; these functions know nothing about
// req/res. This makes the logic unit-testable without spinning up a
// server, and reusable if we ever add another entry point (e.g. a CLI,
// or a mobile-specific endpoint) without duplicating business rules.

import { findUserByEmail, createUser } from '../repositories/userRepository.js';
import {
  storeRefreshToken,
  findActiveRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../repositories/refreshTokenRepository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/tokens.js';
import { env } from '../config/env.js';

// Custom error class so controllers can distinguish "expected" auth
// failures (wrong password, duplicate email) from genuine server bugs,
// and map them to the correct HTTP status + error code.
export class AuthError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Converts a refresh token's expiry string (e.g. "7d") into a real
// JS Date for storing in the DB's `expires_at` column.
function calculateExpiryDate(expiryString) {
  const match = expiryString.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiryString}`);

  const [, amount, unit] = match;
  const msPerUnit = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + Number(amount) * msPerUnit[unit]);
}

// Issues a fresh access + refresh token pair for a user, and persists
// the refresh token's HASH in the DB so it can later be revoked.
async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await storeRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: calculateExpiryDate(env.jwt.refreshExpiry),
  });

  return { accessToken, refreshToken };
}

// ===================== SIGNUP =====================
export async function signup({ name, email, password }) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AuthError('An account with this email already exists', 'EMAIL_TAKEN', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash });

  const tokens = await issueTokenPair(user);

  return { user, ...tokens };
}

// ===================== LOGIN =====================
export async function login({ email, password }) {
  const user = await findUserByEmail(email);

  // Deliberately vague error — see explanation below.
  if (!user) {
    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const tokens = await issueTokenPair(user);

  // Never return password_hash to the caller, even internally —
  // strip it before returning the user object.
  const { password_hash, ...safeUser } = user;

  return { user: safeUser, ...tokens };
}

// ===================== REFRESH =====================
// Exchanges a valid, unexpired, non-revoked refresh token for a new
// access token. Does NOT issue a new refresh token here (kept simple
// for now — token rotation is a production enhancement we'll discuss).
export async function refreshAccessToken(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN', 401);
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await findActiveRefreshToken(tokenHash);

  // This check matters even though we already verified the JWT signature:
  // the signature being valid only proves WE issued it at some point.
  // The DB check confirms it hasn't been revoked (logout) since then.
  if (!storedToken) {
    throw new AuthError('Refresh token has been revoked or expired', 'INVALID_REFRESH_TOKEN', 401);
  }

  const newAccessToken = signAccessToken({ id: payload.sub, email: payload.email });
  return { accessToken: newAccessToken };
}

// ===================== LOGOUT =====================
export async function logout(refreshToken) {
  if (!refreshToken) return; // nothing to revoke, treat as a no-op success
  await revokeRefreshToken(hashToken(refreshToken));
}

// ===================== LOGOUT EVERYWHERE =====================
export async function logoutAllDevices(userId) {
  await revokeAllUserTokens(userId);
}