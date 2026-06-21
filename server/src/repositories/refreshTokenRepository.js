// src/repositories/refreshTokenRepository.js
//
// WHY THIS FILE EXISTS:
// The ONLY place allowed to write SQL against `refresh_tokens`.
// Handles storing, validating, and revoking refresh tokens — this is
// what gives us server-side revocation ("logout everywhere") despite
// using stateless JWTs for the tokens themselves.

import { pool } from '../config/db.js';

// Store a newly issued refresh token (as a HASH, never the raw token).
export async function storeRefreshToken({ userId, tokenHash, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

// Look up an ACTIVE (not revoked, not expired) refresh token by its hash.
// Used on every /auth/refresh request to check if the token is still valid
// server-side — this is the check that lets us revoke tokens early.
export async function findActiveRefreshToken(tokenHash) {
  const result = await pool.query(
    `SELECT id, user_id, expires_at
     FROM refresh_tokens
     WHERE token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > now()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

// Revoke a single refresh token (used on logout from ONE device/session).
export async function revokeRefreshToken(tokenHash) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = now()
     WHERE token_hash = $1`,
    [tokenHash]
  );
}

// Revoke ALL refresh tokens for a user (used for "logout everywhere" /
// suspected account compromise — a feature we get almost for free
// because we chose to track tokens in the DB).
export async function revokeAllUserTokens(userId) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}