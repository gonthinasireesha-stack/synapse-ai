// src/utils/tokens.js
//
// Handles signing and verifying JWTs, plus hashing refresh tokens
// before they're stored (mirrors why we hash passwords — never store
// a usable secret in plaintext in the database).

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

// ACCESS TOKEN — short-lived, sent with every API request.
// Payload is intentionally minimal: just enough to identify the user.
export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email }, // 'sub' = subject, the JWT standard claim for "who this token is about"
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiry }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret); // throws if invalid/expired — caller must catch
}

// REFRESH TOKEN — long-lived. Signed with a DIFFERENT secret than the
// access token, so a leaked access-token secret can't be used to forge
// refresh tokens, and vice versa.
export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiry }
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

// We store a HASH of the refresh token in the DB (see ADR-style reasoning
// in refreshTokenRepository) — never the raw token. SHA-256 is fine here
// (unlike passwords, JWTs are already high-entropy random-looking strings,
// not low-entropy human-chosen secrets, so we don't need bcrypt's
// deliberate slowness or salting here).
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}